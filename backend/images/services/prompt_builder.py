def build_image_prompt(
    product_name: str = '',
    category: str = '',
    image_type: str = '',
    goal: str = '',
    headline: str = '',
    visual_direction: str = '',
    text_elements: list = None,
    product_visual_details: str = '',
    user_prompt: str = '',
) -> str:
    lines = []

    if product_name:
        lines.append(f"Product: {product_name}")
    if category:
        lines.append(f"Category: {category}")
    if product_visual_details:
        lines.append(
            f"Product visual details: {product_visual_details}. "
            "CRITICAL — preserve the described color, shape, packaging style, label position, "
            "and visible materials exactly as described. "
            "Do not alter the product color. Do not alter the packaging shape. "
            "Do not substitute with a different product."
        )
    if image_type:
        lines.append(f"Image type: {image_type}")
    if goal:
        lines.append(f"Goal: {goal}")
    if headline:
        lines.append(f'Headline: "{headline}"')
    if visual_direction:
        lines.append(f"Visual direction: {visual_direction}")
    if text_elements:
        lines.append(f"Text elements: {', '.join(text_elements)}")
    if user_prompt:
        lines.append(f"Additional instructions: {user_prompt}")

    lines.append(
        "Style: Clean premium Amazon product infographic, marketplace-ready composition, "
        "high-quality studio lighting, modern premium design, high-converting visual hierarchy, "
        "readable text at all sizes, product as the main focus of the image."
    )
    lines.append(
        "Constraints: Preserve product color exactly — do not change it. "
        "Preserve packaging shape exactly — do not change it. "
        "Do not replace the product with a different product. "
        "Do not invent or add brand logos. "
        "No Amazon logo. "
        "No fake or copyrighted logos. "
        "No misleading medical or legal claims. "
        "No tiny unreadable text. "
        "No cluttered layout. "
        "No random extra products in the scene. "
        "No wrong product category. "
        "Keep the product as the primary visual focus."
    )

    return '\n'.join(lines)
