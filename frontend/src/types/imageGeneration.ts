export type ImageGenerationStatus = 'generating' | 'completed' | 'failed'

export interface ImageGeneration {
  id: number
  audit_id: number | null
  image_type: string
  prompt?: string
  status: ImageGenerationStatus
  provider: string
  model_name: string
  image_url: string | null
  error_message: string
  brief?: Record<string, unknown> | null
  product_visual_details?: string
  style_direction?: string
  background_preference?: string
  text_intensity?: string
  generation_mode?: string
  product_locked?: boolean
  reference_image_url?: string
  warning?: string | null
  created_at: string
  updated_at?: string
  completed_at: string | null
}

export interface QualityOptions {
  productVisualDetails: string
  styleDirection: string
  backgroundPreference: string
  textIntensity: string
}

export interface CreateImageGenerationPayload {
  audit_id?: number | null
  image_type: string
  prompt?: string
  brief?: {
    goal?: string
    headline?: string
    visual_direction?: string
    text_elements?: string[]
    buyer_objection?: string
    suggested_layout?: string
  }
  product_visual_details?: string
  style_direction?: string
  background_preference?: string
  text_intensity?: string
}
