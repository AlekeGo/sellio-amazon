import json
import os
import re
import time

from google import genai
from google.genai import types


REQUIRED_FIELDS_V2 = [
    'score', 'score_label', 'executive_summary',
    'top_critical_issues', 'fix_this_first',
    'title_upgrade', 'about_this_item_upgrade',
    'product_details_fixes', 'description_upgrade',
    'keyword_opportunities', 'buyer_objections',
    'image_gallery_plan', 'a_plus_brand_plan',
    'priority_checklist', 'details',
    'pro_upgrade_pack',
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


_PERSONA_INSTRUCTIONS = {
    'premium': (
        "SELLER PERSONA: Premium. "
        "Use language that emphasizes trust, quality materials, superior craftsmanship, and value perception. "
        "Every copy element should reinforce that this product is worth paying more for."
    ),
    'budget_friendly': (
        "SELLER PERSONA: Budget Friendly. "
        "Lead with value, practicality, and affordability. "
        "Highlight everyday usefulness and cost-effectiveness without sounding cheap."
    ),
    'gift_ready': (
        "SELLER PERSONA: Gift Ready. "
        "Emphasize emotional value, gifting occasions (birthdays, holidays, anniversaries), "
        "and the benefit for the recipient. Make the buyer feel this is the perfect gift."
    ),
    'expert_professional': (
        "SELLER PERSONA: Expert / Professional. "
        "Use precise, technical, specification-driven language. "
        "Buyers are knowledgeable; give them specs, compatibility details, and professional-grade claims."
    ),
    'luxury': (
        "SELLER PERSONA: Luxury. "
        "Use refined, elegant, aspirational positioning. "
        "Every word should evoke exclusivity, prestige, and superior experience."
    ),
    'problem_solver': (
        "SELLER PERSONA: Problem Solver. "
        "Lead with the buyer's pain point, then deliver the clear solution this product provides. "
        "Be direct: here is the problem, here is how this product fixes it."
    ),
    'minimal_clean': (
        "SELLER PERSONA: Minimal / Clean. "
        "Use simple, clear, direct wording with no hype, no filler, no buzzwords. "
        "Every sentence must earn its place. Less is more."
    ),
}


def _persona_block(persona: str) -> str:
    instruction = _PERSONA_INSTRUCTIONS.get(persona, '')
    if not instruction:
        return "SELLER PERSONA: Not set. Use balanced, professional Amazon copywriting."
    return instruction


def _build_prompt(audit) -> str:
    about_bullets = audit.about_this_item or audit.bullet_points or 'Not provided'
    brand_aplus = audit.brand_content or audit.a_plus_content or 'Not provided'
    persona = audit.seller_persona or ''
    persona_block = _persona_block(persona)
    persona_display = dict(audit.SELLER_PERSONA_CHOICES).get(persona, 'Not set') if persona else 'Not set'

    return f"""You are a senior Amazon listing conversion auditor and SEO copywriter.

Analyze this Amazon product listing and return a concise, actionable audit report.

{persona_block}

Apply this persona consistently across ALL copy outputs: title, bullets, description, pro_upgrade_pack, image briefs, and checklist.

PRODUCT DATA:
- Product Name: {audit.product_name or 'Not provided'}
- Category: {audit.category or 'Not provided'}
- Amazon URL: {audit.amazon_url or 'Not provided'}
- Current Title: {audit.current_title or 'Not provided'}
- About This Item / Bullet Points: {about_bullets}
- Product Details / Top Highlights: {audit.product_details or 'Not provided'}
- Product Specifications: {audit.product_specifications or 'Not provided'}
- Description: {audit.description or 'Not provided'}
- Brand / A+ Content: {brand_aplus}
- Variations (size/color/options): {audit.variations or 'Not provided'}
- Size Guide: {audit.size_guide or 'Not provided'}
- Product Images Notes: {audit.product_images_notes or 'Not provided'}
- Videos Notes: {audit.videos_notes or 'Not provided'}
- Reviews / Q&A: {audit.reviews_qna or 'Not provided'}
- Buyer Complaints: {audit.buyer_complaints or 'Not provided'}
- Price: {audit.price or 'Not provided'}
- Rating: {audit.rating or 'Not provided'}
- Review Count: {audit.review_count or 'Not provided'}
- Main Benefit: {audit.main_benefit or 'Not provided'}
- Target Audience: {audit.target_audience or 'Not provided'}
- Seller Goal: {audit.seller_goal or 'Not provided'}
- Additional Notes: {audit.notes or 'Not provided'}
- Seller Persona: {persona_display}

Rules:
- Return ONLY valid JSON. No markdown fences, no explanation, no extra text.
- Keep all text SHORT. Every field is 1 sentence max unless noted.
- executive_summary: exactly 1 sentence summarising the biggest opportunity.
- about_this_item_upgrade.improved_bullets: exactly 5 bullets, each ready to paste into Amazon.
- title_upgrade.improved_title: ready-to-use Amazon title under 200 chars.
- description_upgrade.improved_description: max 3 sentences, ready to paste.
- top_critical_issues: max 5 items.
- fix_this_first: max 3 items.
- product_details_fixes: max 5 items.
- keyword_opportunities: max 8 items.
- buyer_objections: max 5 items.
- image_gallery_plan: max 6 items.
- a_plus_brand_plan: max 3 items.
- priority_checklist: max 5 items.
- pro_upgrade_pack: required. See structure below. All copy must reflect the seller persona.
- pro_upgrade_pack.copy_ready_bullets: exactly 5 bullets, ready to paste.
- pro_upgrade_pack.copy_ready_description: max 3 sentences, ready to paste.
- pro_upgrade_pack.product_details_fixes: max 5 items.
- pro_upgrade_pack.image_briefs: max 6 items.
- pro_upgrade_pack.priority_checklist: max 5 items.

Return this exact JSON structure:

{{
  "score": <integer 0-100>,
  "score_label": "<short label max 6 words>",
  "executive_summary": "<1 sentence — the single biggest opportunity for this listing>",
  "top_critical_issues": [
    {{
      "area": "<Amazon section name>",
      "problem": "<1 sentence>",
      "impact": "<1 sentence>",
      "fix": "<1 sentence>"
    }}
  ],
  "fix_this_first": [
    {{
      "task": "<short task name>",
      "reason": "<1 sentence>"
    }}
  ],
  "title_upgrade": {{
    "current_issue": "<1 sentence>",
    "improved_title": "<ready-to-use Amazon title under 200 chars>"
  }},
  "about_this_item_upgrade": {{
    "strategy": "<1 sentence>",
    "improved_bullets": ["<bullet 1>", "<bullet 2>", "<bullet 3>", "<bullet 4>", "<bullet 5>"]
  }},
  "product_details_fixes": [
    {{
      "field": "<spec or detail name>",
      "issue": "<1 sentence>",
      "recommended_fix": "<1 sentence>"
    }}
  ],
  "description_upgrade": {{
    "current_issue": "<1 sentence>",
    "improved_description": "<max 3 sentences>"
  }},
  "keyword_opportunities": [
    {{
      "keyword": "<keyword phrase>",
      "reason": "<1 sentence>"
    }}
  ],
  "buyer_objections": [
    {{
      "objection": "<1 sentence>",
      "how_to_address": "<1 sentence>"
    }}
  ],
  "image_gallery_plan": [
    {{
      "image_type": "<e.g. Hero Shot, Lifestyle, Benefit Infographic>",
      "goal": "<1 sentence>",
      "headline": "<short headline text>",
      "visual_direction": "<1 sentence>",
      "text_elements": ["<short text>", "<short text>"]
    }}
  ],
  "a_plus_brand_plan": [
    {{
      "section": "<section name>",
      "purpose": "<1 sentence>",
      "content_idea": "<1 sentence>"
    }}
  ],
  "priority_checklist": [
    {{
      "priority": "<High|Medium|Low>",
      "task": "<short task>",
      "reason": "<1 sentence>"
    }}
  ],
  "details": {{
    "title": "<optional deeper note max 3 sentences>",
    "bullets": "<optional deeper note max 3 sentences>",
    "images": "<optional deeper note max 3 sentences>",
    "product_details": "<optional deeper note max 3 sentences>"
  }},
  "pro_upgrade_pack": {{
    "persona_used": "{persona_display}",
    "copy_ready_title": "<ready-to-use Amazon title under 200 chars, persona-aligned>",
    "copy_ready_bullets": [
      "<bullet 1 — persona-aligned, ready to paste>",
      "<bullet 2 — persona-aligned, ready to paste>",
      "<bullet 3 — persona-aligned, ready to paste>",
      "<bullet 4 — persona-aligned, ready to paste>",
      "<bullet 5 — persona-aligned, ready to paste>"
    ],
    "copy_ready_description": "<max 3 sentences, persona-aligned, ready to paste>",
    "product_details_fixes": [
      {{
        "field": "<spec field name>",
        "recommended_value": "<ready-to-use value>",
        "reason": "<1 sentence>"
      }}
    ],
    "image_briefs": [
      {{
        "image_type": "<e.g. Hero Shot, Benefit Infographic, Lifestyle>",
        "headline": "<short headline text>",
        "visual_direction": "<1 sentence>",
        "text_elements": ["<short text>", "<short text>"]
      }}
    ],
    "priority_checklist": [
      {{
        "priority": "<High|Medium|Low>",
        "task": "<short task>",
        "reason": "<1 sentence>"
      }}
    ]
  }}
}}"""


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

            missing = [f for f in REQUIRED_FIELDS_V2 if f not in data]
            if missing:
                raise ValueError(f'Gemini response missing fields: {missing}')

            data['score'] = int(data['score'])
            data['score_label'] = str(data.get('score_label', ''))
            data['executive_summary'] = str(data.get('executive_summary', ''))

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
