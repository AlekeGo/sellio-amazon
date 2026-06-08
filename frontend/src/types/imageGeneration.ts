export type ImageGenerationStatus = 'generating' | 'completed' | 'failed'

export interface ImageGeneration {
  id: number
  audit: number | null
  image_type: string
  prompt?: string
  status: ImageGenerationStatus
  provider: string
  model_name: string
  image_url: string | null
  error_message: string
  created_at: string
  updated_at?: string
  completed_at: string | null
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
    product_visual_details?: string
  }
}
