import logging
import os
import time

from .gemini_audit_service import GeminiTemporaryError, run_gemini_audit
from .openai_audit_service import OpenAITemporaryError, run_openai_audit

logger = logging.getLogger(__name__)


class AITemporaryError(Exception):
    pass


def _provider_key_present(provider: str) -> bool:
    if provider == 'openai':
        return bool(os.getenv('OPENAI_API_KEY'))
    if provider == 'gemini':
        return bool(os.getenv('GEMINI_API_KEY'))
    return False


def is_ai_configured() -> bool:
    primary = os.getenv('AI_PROVIDER', 'openai').lower().strip()
    fallback = os.getenv('AI_FALLBACK_PROVIDER', 'gemini').lower().strip()
    return _provider_key_present(primary) or _provider_key_present(fallback)


def _call_provider(provider: str, audit) -> dict:
    if provider == 'openai':
        return run_openai_audit(audit)
    if provider == 'gemini':
        return run_gemini_audit(audit)
    raise ValueError(f'Unknown AI provider: {provider}')


def run_audit(audit) -> dict:
    primary = os.getenv('AI_PROVIDER', 'openai').lower().strip()
    fallback = os.getenv('AI_FALLBACK_PROVIDER', 'gemini').lower().strip()

    if not _provider_key_present(primary) and not _provider_key_present(fallback):
        raise ValueError('AI provider is not configured.')

    if not _provider_key_present(primary):
        logger.warning('ai_provider primary_missing provider=%s switching_to=%s', primary, fallback)
        primary = fallback
        fallback = None

    t0 = time.monotonic()

    try:
        result = _call_provider(primary, audit)
        duration = round(time.monotonic() - t0, 2)
        logger.info(
            'ai_audit_done provider=%s fallback_used=False duration=%.2fs audit_id=%s',
            primary, duration, audit.id,
        )
        return result

    except (OpenAITemporaryError, GeminiTemporaryError) as primary_exc:
        logger.warning(
            'ai_audit_primary_failed provider=%s error_type=%s audit_id=%s',
            primary, type(primary_exc).__name__, audit.id,
        )

        if not fallback or not _provider_key_present(fallback):
            raise AITemporaryError(
                'AI analysis is temporarily unavailable. Please try again in a few minutes.'
            ) from primary_exc

        try:
            result = _call_provider(fallback, audit)
            duration = round(time.monotonic() - t0, 2)
            logger.info(
                'ai_audit_done provider=%s fallback_used=True duration=%.2fs audit_id=%s',
                fallback, duration, audit.id,
            )
            return result

        except (OpenAITemporaryError, GeminiTemporaryError) as fallback_exc:
            duration = round(time.monotonic() - t0, 2)
            logger.error(
                'ai_audit_both_failed primary=%s fallback=%s duration=%.2fs audit_id=%s',
                primary, fallback, duration, audit.id,
            )
            raise AITemporaryError(
                'AI analysis is temporarily unavailable. Please try again in a few minutes.'
            ) from fallback_exc

    except ValueError:
        raise

    except Exception as exc:
        duration = round(time.monotonic() - t0, 2)
        logger.error(
            'ai_audit_unexpected_error provider=%s error_type=%s duration=%.2fs audit_id=%s',
            primary, type(exc).__name__, duration, audit.id,
        )
        raise
