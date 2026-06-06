import json
import os
import re
import time

from google import genai
from google.genai import types


REQUIRED_FIELDS = [
    'score', 'score_label', 'executive_summary', 'conversion_diagnosis',
    'weak_points', 'title_analysis', 'improved_title', 'bullet_improvements',
    'improved_bullets', 'description_analysis', 'improved_description',
    'keyword_opportunities', 'review_insights', 'buyer_objections',
    'a_plus_content_ideas', 'image_pack_plan', 'priority_checklist',
]


_TEMPORARY_SIGNALS = (
    '503', 'unavailable', 'rate limit', 'resource exhausted',
    'quota', 'timeout', 'deadline exceeded', 'high demand',
)


class GeminiTemporaryError(Exception):
    pass


def _is_temporary_error(exc: Exception) -> bool:
    msg = str(exc).lower()
    return any(sig in msg for sig in _TEMPORARY_SIGNALS)


def _build_prompt(audit) -> str:
    return f"""You are a senior Amazon listing conversion auditor, Amazon SEO copywriter, and marketplace creative strategist.

Analyze the following Amazon product listing and produce a comprehensive audit report.

PRODUCT DATA:
- Product Name: {audit.product_name or 'Not provided'}
- Category: {audit.category or 'Not provided'}
- Amazon URL: {audit.amazon_url or 'Not provided'}
- Current Title: {audit.current_title or 'Not provided'}
- Bullet Points: {audit.bullet_points or 'Not provided'}
- Description: {audit.description or 'Not provided'}
- Backend Keywords: {audit.backend_keywords or 'Not provided'}
- Price: {audit.price or 'Not provided'}
- Rating: {audit.rating or 'Not provided'}
- Review Count: {audit.review_count or 'Not provided'}
- Main Benefit: {audit.main_benefit or 'Not provided'}
- Target Audience: {audit.target_audience or 'Not provided'}
- Seller Goal: {audit.seller_goal or 'Not provided'}
- Additional Notes: {audit.notes or 'Not provided'}

Return ONLY valid JSON with no markdown fences, no explanation, and no extra text. Use this exact structure:

{{
  "score": <integer 0-100>,
  "score_label": "<short label describing the score>",
  "executive_summary": "<2-3 paragraph overall assessment>",
  "conversion_diagnosis": {{
    "attention": "<how well the listing captures attention>",
    "trust": "<how well it builds trust>",
    "clarity": "<how clear the value proposition is>",
    "conversion": "<conversion signal strength>"
  }},
  "weak_points": [
    {{
      "area": "<area name>",
      "issue": "<specific issue>",
      "impact": "<business impact>",
      "fix": "<actionable fix>"
    }}
  ],
  "title_analysis": {{
    "current_problem": "<what is wrong with the current title>",
    "strategy": "<strategy for improvement>"
  }},
  "improved_title": "<full improved title under 200 chars>",
  "bullet_improvements": [
    {{
      "current_issue": "<what is weak>",
      "improved_version": "<improved bullet text>"
    }}
  ],
  "improved_bullets": ["<bullet 1>", "<bullet 2>", "<bullet 3>", "<bullet 4>", "<bullet 5>"],
  "description_analysis": {{
    "current_problem": "<what is wrong with the description>",
    "improvement_strategy": "<how to improve it>"
  }},
  "improved_description": "<full improved description>",
  "keyword_opportunities": [
    {{
      "keyword": "<keyword phrase>",
      "reason": "<why this keyword matters>"
    }}
  ],
  "review_insights": [
    {{
      "signal": "<pattern from reviews>",
      "what_it_means": "<what it reveals about buyers>",
      "listing_fix": "<how to address it in the listing>"
    }}
  ],
  "buyer_objections": [
    {{
      "objection": "<likely buyer objection>",
      "how_to_address": "<how to address it in the listing>"
    }}
  ],
  "a_plus_content_ideas": [
    {{
      "section": "<section name>",
      "purpose": "<purpose of this section>",
      "content_idea": "<specific content recommendation>"
    }}
  ],
  "image_pack_plan": [
    {{
      "image_type": "<type of image>",
      "goal": "<goal of this image>",
      "headline": "<headline text for the image>",
      "visual_direction": "<visual direction>",
      "text_elements": ["<text element 1>", "<text element 2>"]
    }}
  ],
  "priority_checklist": [
    {{
      "priority": "<High|Medium|Low>",
      "task": "<specific actionable task>",
      "reason": "<why this matters>"
    }}
  ]
}}

Provide at least 3 weak_points, 5 bullet_improvements, 5 improved_bullets, 5 keyword_opportunities, 3 review_insights, 3 buyer_objections, 3 a_plus_content_ideas, 4 image_pack_plan items, and 5 priority_checklist items."""


def _strip_fences(text: str) -> str:
    text = text.strip()
    text = re.sub(r'^```(?:json)?\s*', '', text)
    text = re.sub(r'\s*```$', '', text)
    return text.strip()


_RETRY_DELAYS = [2, 5, 10]


def run_gemini_audit(audit) -> dict:
    api_key = os.getenv('GEMINI_API_KEY')
    if not api_key:
        raise ValueError('Gemini API key is not configured.')

    model = os.getenv('GEMINI_MODEL', 'gemini-2.5-flash')
    prompt = _build_prompt(audit)
    client = genai.Client(api_key=api_key)

    last_exc: Exception | None = None

    for attempt in range(len(_RETRY_DELAYS) + 1):
        try:
            response = client.models.generate_content(
                model=model,
                contents=prompt,
                config=types.GenerateContentConfig(
                    temperature=0.7,
                    response_mime_type='application/json',
                ),
            )

            raw = _strip_fences(response.text)
            data = json.loads(raw)

            missing = [f for f in REQUIRED_FIELDS if f not in data]
            if missing:
                raise ValueError(f'Gemini response missing fields: {missing}')

            data['score'] = int(data['score'])
            data['score_label'] = str(data.get('score_label', ''))
            data['executive_summary'] = str(data.get('executive_summary', ''))
            data['improved_title'] = str(data.get('improved_title', ''))
            data['improved_description'] = str(data.get('improved_description', ''))

            return data

        except ValueError:
            raise
        except Exception as exc:
            if not _is_temporary_error(exc):
                raise
            last_exc = exc
            if attempt < len(_RETRY_DELAYS):
                time.sleep(_RETRY_DELAYS[attempt])

    raise GeminiTemporaryError('Gemini is temporarily busy. Please try again in a moment.') from last_exc
