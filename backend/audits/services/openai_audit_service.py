import json
import logging
import os
import time

from openai import APIStatusError, APITimeoutError, OpenAI, RateLimitError

from .gemini_audit_service import (
    REQUIRED_FIELDS_V2,
    _build_prompt,
    _compute_weighted_score,
    _fallback_report,
    _safe_parse_json,
)

logger = logging.getLogger(__name__)

_RETRY_DELAYS = [2, 5]


class OpenAITemporaryError(Exception):
    pass


def run_openai_audit(audit) -> dict:
    api_key = os.getenv('OPENAI_API_KEY')
    if not api_key:
        raise ValueError('AI provider is not configured.')

    model = os.getenv('OPENAI_MODEL', 'gpt-4o-mini')
    prompt = _build_prompt(audit)
    client = OpenAI(api_key=api_key, timeout=60.0)

    last_exc: Exception | None = None

    for attempt in range(len(_RETRY_DELAYS) + 1):
        try:
            response = client.chat.completions.create(
                model=model,
                messages=[
                    {
                        'role': 'system',
                        'content': (
                            'You are a JSON-only AI. Return ONLY a single valid JSON object. '
                            'No markdown fences, no explanations, no text outside the JSON.'
                        ),
                    },
                    {'role': 'user', 'content': prompt},
                ],
                temperature=0.4,
                response_format={'type': 'json_object'},
            )

            raw = (response.choices[0].message.content or '').strip()
            if not raw:
                return _fallback_report()

            try:
                data = _safe_parse_json(raw)
            except json.JSONDecodeError:
                return _fallback_report()

            fallback = _fallback_report()
            for field in REQUIRED_FIELDS_V2:
                if field not in data:
                    data[field] = fallback[field]

            computed = _compute_weighted_score(data.get('score_breakdown', {}))
            if computed is None:
                raise OpenAITemporaryError(
                    'AI analysis returned incomplete category scores. Please try again in a few minutes.'
                )
            data['score'] = computed
            cr = data.get('compact_report')
            if isinstance(cr, dict):
                ss = cr.get('score_snapshot')
                if isinstance(ss, dict):
                    ss['overall_score'] = computed

            data['score_label'] = str(data.get('score_label', ''))
            data['executive_summary'] = str(data.get('executive_summary', ''))

            return data

        except RateLimitError as exc:
            logger.warning('openai_audit rate_limit attempt=%d audit_id=%s', attempt, audit.id)
            last_exc = exc
            if attempt < len(_RETRY_DELAYS):
                time.sleep(_RETRY_DELAYS[attempt])

        except APITimeoutError as exc:
            logger.warning('openai_audit timeout attempt=%d audit_id=%s', attempt, audit.id)
            last_exc = exc
            if attempt < len(_RETRY_DELAYS):
                time.sleep(_RETRY_DELAYS[attempt])

        except APIStatusError as exc:
            if exc.status_code >= 500:
                logger.warning('openai_audit server_error status=%d attempt=%d audit_id=%s',
                               exc.status_code, attempt, audit.id)
                last_exc = exc
                if attempt < len(_RETRY_DELAYS):
                    time.sleep(_RETRY_DELAYS[attempt])
            else:
                raise

        except ValueError:
            raise

    raise OpenAITemporaryError(
        'AI analysis is temporarily unavailable. Please try again in a few minutes.'
    ) from last_exc
