def _get_type_instruction(image_type: str) -> str:
    t = image_type.lower()
    if 'main image' in t or ('main' in t and 'image' in t) or 'hero' in t or 'refresh' in t:
        return (
            "Image composition: Clean studio packshot, white or soft neutral background, "
            "product precisely centered, premium studio lighting from above-left, "
            "soft drop shadow, marketplace-ready main image format."
        )
    if 'infographic' in t or 'benefit' in t:
        return (
            "Image composition: Product anchored on one side, clean ecommerce infographic layout "
            "on the other, short benefit headlines, icon callouts, "
            "no fake certifications, no unverified medical claims, high-contrast readable text."
        )
    if 'lifestyle' in t:
        return (
            "Image composition: Product placed in a realistic lifestyle environment relevant to the "
            "product category, product unchanged and fully visible, natural soft lighting, "
            "emotionally resonant scene, product identity preserved exactly."
        )
    if 'comparison' in t:
        return (
            "Image composition: Clean side-by-side or table comparison layout, product on the left "
            "unchanged, honest feature comparison, no competitor logos, no false claims, "
            "green checkmarks for product strengths."
        )
    if 'how' in t or 'usage' in t or 'works' in t or 'step' in t:
        return (
            "Image composition: Simple numbered step-by-step layout showing product usage, "
            "product identical in each step, clean minimal arrows or progress indicators, "
            "product identity consistent across all steps."
        )
    if 'a+' in t or 'banner' in t or 'brand' in t:
        return (
            "Image composition: Premium full-width brand-style layout, product as the hero element, "
            "refined minimal text, clean premium background, elevated brand aesthetic."
        )
    return (
        "Image composition: Clean product-forward layout, premium studio quality, "
        "marketplace-ready ecommerce composition."
    )


def build_image_prompt(
    product_name: str = '',
    category: str = '',
    image_type: str = '',
    goal: str = '',
    headline: str = '',
    visual_direction: str = '',
    text_elements: list = None,
    product_visual_details: str = '',
    style_direction: str = '',
    background_preference: str = '',
    text_intensity: str = '',
    user_prompt: str = '',
    current_title: str = '',
    description: str = '',
    about_this_item: str = '',
    reference_image_exists: bool = False,
) -> str:
    lines = []

    if product_name:
        lines.append(f"Product: {product_name}")
    if category:
        lines.append(f"Category: {category}")
    if current_title:
        lines.append(f"Product title: {current_title}")
    if about_this_item:
        lines.append(f"Key product details: {about_this_item[:300]}")
    elif description:
        lines.append(f"Product description: {description[:300]}")

    if reference_image_exists:
        lines.append(
            "PRODUCT IDENTITY LOCK — REFERENCE IMAGE PROVIDED: "
            "The reference image shows the exact product to use. "
            "Preserve every visible detail from the reference image exactly: "
            "shape, packaging, silhouette, color, proportions, cap, lid, label placement, "
            "material finish, and all visible design details. "
            "Do not replace it with a generic product. "
            "Do not invent a different bottle, box, jar, package, color, or label. "
            "Product identity is more important than style. "
            "Improve lighting, background, and composition only — keep the product identical."
        )
    elif product_visual_details:
        lines.append(
            f"Product visual details: {product_visual_details}. "
            "CRITICAL — preserve the described color, shape, packaging style, label position, "
            "and visible materials exactly. "
            "Do not alter the product color. Do not alter the packaging shape. "
            "Do not substitute with a different product."
        )

    if image_type:
        lines.append(f"Image type: {image_type}")
        lines.append(_get_type_instruction(image_type))
    if goal:
        lines.append(f"Goal: {goal}")
    if headline:
        lines.append(f'Headline: "{headline}"')
    if visual_direction:
        lines.append(f"Visual direction: {visual_direction}")
    if text_elements:
        lines.append(f"Text elements: {', '.join(text_elements)}")
    if style_direction:
        lines.append(f"Style direction: {style_direction}")
    if background_preference:
        lines.append(f"Background preference: {background_preference}")
    if text_intensity:
        lines.append(f"Text intensity: {text_intensity}")
    if user_prompt:
        lines.append(f"Additional instructions: {user_prompt}")

    lines.append(
        "Quality: Premium ecommerce product photography, realistic studio lighting, "
        "sharp product details, clean shadows, realistic reflections, "
        "marketplace-ready composition, high-resolution look, "
        "no distorted packaging, no melted text, no random product substitution, "
        "no AI-looking artifacts, no fake text, no fake certification claims, "
        "do not add logos or claims not provided by the seller."
    )
    lines.append(
        "Style: Clean premium Amazon product image, marketplace-ready composition, "
        "high-quality studio lighting, modern premium design, "
        "high-converting visual hierarchy, product as the main focus."
    )
    lines.append(
        "Constraints: Preserve product color exactly. "
        "Preserve packaging shape exactly. "
        "Do not replace the product with a different product. "
        "Do not invent or add brand logos. "
        "No Amazon logo. No fake or copyrighted logos. "
        "No misleading medical or legal claims. "
        "No tiny unreadable text. No cluttered layout. "
        "No random extra products in the scene. "
        "Keep the product as the primary visual focus."
    )

    return '\n'.join(lines)
