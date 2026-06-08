import os

import fal_client


class FalImageError(Exception):
    pass


def generate_image(prompt: str) -> dict:
    api_key = os.getenv('FAL_KEY')
    if not api_key:
        raise FalImageError('FAL_KEY is not configured.')

    model = os.getenv('FAL_TEXT_TO_IMAGE_MODEL', 'fal-ai/flux/schnell')

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
        raise FalImageError(str(exc)) from exc

    try:
        image_url = result['images'][0]['url']
    except (KeyError, IndexError, TypeError) as exc:
        raise FalImageError(f'Unexpected response structure: {result}') from exc

    if not image_url:
        raise FalImageError('No image URL in response.')

    return {'image_url': image_url, 'raw': result}
