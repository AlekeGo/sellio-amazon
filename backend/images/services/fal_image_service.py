import base64
import io
import logging
import mimetypes
import os

import fal_client
import requests as http_requests
from PIL import Image, ImageStat

logger = logging.getLogger(__name__)


class FalImageError(Exception):
    pass


def _validate_reference_file(image_path: str) -> None:
    if not os.path.exists(image_path):
        raise FalImageError(f'Reference image not found at path: {image_path}')
    file_size = os.path.getsize(image_path)
    if file_size == 0:
        raise FalImageError('Reference image file is empty (0 bytes).')
    logger.debug('Reference image file: path=%s size=%d bytes', image_path, file_size)


def _upload_reference_image(image_path: str) -> str:
    mime_type, _ = mimetypes.guess_type(image_path)
    if mime_type is None:
        mime_type = 'image/jpeg'

    try:
        url = fal_client.upload_file(image_path)
        logger.info('Reference image uploaded to fal CDN: %s', url)
        return url
    except Exception as exc:
        logger.warning('fal CDN upload failed for %s: %s', image_path, exc)

    try:
        with open(image_path, 'rb') as f:
            data = f.read()
        encoded = base64.b64encode(data).decode('utf-8')
        data_uri = f'data:{mime_type};base64,{encoded}'
        logger.warning(
            'Using base64 data URI fallback for reference image: path=%s original_size=%d bytes data_uri_len=%d chars',
            image_path, len(data), len(data_uri),
        )
        return data_uri
    except Exception as exc:
        logger.error('base64 fallback also failed for %s: %s', image_path, exc)
        raise FalImageError(f'Reference image upload failed: {exc}') from exc


def _resolve_reference_url(reference_image_path: str) -> str:
    if reference_image_path.startswith(('http://', 'https://')):
        logger.info('Reference image is an HTTP URL: %s', reference_image_path)
        return reference_image_path
    _validate_reference_file(reference_image_path)
    return _upload_reference_image(reference_image_path)


def _validate_generated_image(image_url: str) -> None:
    try:
        resp = http_requests.get(image_url, timeout=30)
        resp.raise_for_status()
    except Exception as exc:
        logger.error('Could not fetch generated image for validation: %s — url=%s', exc, image_url)
        raise FalImageError('Generated image output was invalid. Please try again.') from exc

    content_type = resp.headers.get('Content-Type', '')
    file_size = len(resp.content)
    logger.info(
        'Generated image download: url=%s content_type=%s size=%d bytes',
        image_url, content_type, file_size,
    )

    if file_size < 1000:
        logger.error('Generated image is too small (%d bytes) — treating as invalid', file_size)
        raise FalImageError('Generated image output was invalid. Please try again.')

    if not content_type.startswith('image/'):
        logger.error(
            'Generated image has unexpected content-type "%s" — treating as invalid', content_type,
        )
        raise FalImageError('Generated image output was invalid. Please try again.')

    try:
        img = Image.open(io.BytesIO(resp.content)).convert('RGB')
        width, height = img.size
        stat = ImageStat.Stat(img)
        mean_brightness = sum(stat.mean) / 3
        logger.info(
            'Generated image pixel stats: size=%dx%d mean_brightness=%.2f/255',
            width, height, mean_brightness,
        )
        if mean_brightness < 3.0:
            logger.error(
                'Generated image appears fully black (mean_brightness=%.2f) — treating as invalid',
                mean_brightness,
            )
            raise FalImageError('Generated image output was invalid. Please try again.')
    except FalImageError:
        raise
    except Exception as exc:
        logger.warning('Pixel-level image validation failed (non-critical): %s', exc)


def generate_image(prompt: str, reference_image_path: str = None) -> dict:
    api_key = os.getenv('FAL_KEY')
    if not api_key:
        raise FalImageError('FAL_KEY is not configured.')

    if reference_image_path:
        model = os.getenv(
            'FAL_REFERENCE_IMAGE_MODEL',
            os.getenv('FAL_KONTEXT_MODEL', 'fal-ai/flux-pro/kontext'),
        )
        reference_url = _resolve_reference_url(reference_image_path)
        is_data_uri = reference_url.startswith('data:')
        logger.info(
            'Reference-based generation start: model=%s reference_path=%s is_data_uri=%s',
            model, reference_image_path, is_data_uri,
        )
        if is_data_uri:
            logger.info(
                'Reference URL is a data URI: mime=%s data_uri_len=%d',
                reference_url.split(';')[0][5:],
                len(reference_url),
            )
        else:
            logger.info('Reference URL: %s', reference_url)
        logger.debug('Prompt sent to %s (length=%d):\n%s', model, len(prompt), prompt)
        try:
            result = fal_client.subscribe(
                model,
                arguments={
                    'prompt': prompt,
                    'image_url': reference_url,
                    'num_images': 1,
                },
            )
        except Exception as exc:
            logger.error('fal reference generation error (model=%s): %s', model, exc)
            raise FalImageError(str(exc)) from exc
        generation_mode = 'reference_based'
    else:
        model = os.getenv('FAL_TEXT_TO_IMAGE_MODEL', 'fal-ai/flux/schnell')
        reference_url = None
        logger.info('Text-to-image generation start: model=%s', model)
        logger.debug('Prompt sent to %s (length=%d):\n%s', model, len(prompt), prompt)
        try:
            result = fal_client.subscribe(
                model,
                arguments={
                    'prompt': prompt,
                    'image_size': 'square_hd',
                    'num_images': 1,
                },
            )
        except Exception as exc:
            logger.error('fal text-to-image error (model=%s): %s', model, exc)
            raise FalImageError(str(exc)) from exc
        generation_mode = 'text_fallback'

    logger.info('fal raw response (model=%s): %s', model, result)

    try:
        image_url = result['images'][0]['url']
    except (KeyError, IndexError, TypeError) as exc:
        raise FalImageError(f'Unexpected response structure: {result}') from exc

    if not image_url:
        raise FalImageError('No image URL in response.')

    logger.info('fal output image URL: %s', image_url)
    _validate_generated_image(image_url)

    return {
        'image_url': image_url,
        'raw': result,
        'model_used': model,
        'generation_mode': generation_mode,
        'reference_url': reference_url,
    }
