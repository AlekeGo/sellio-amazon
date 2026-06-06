export type EntryType = 'amazon_url' | 'product_photos'
export type AuditStatus = 'draft' | 'ready_for_analysis' | 'pending_analysis' | 'completed' | 'failed'

export interface AuditImage {
  id: number
  image: string
  original_filename: string
  uploaded_at: string
}

export interface AuditListItem {
  id: number
  product_name: string
  category: string
  entry_type: EntryType
  status: AuditStatus
  created_at: string
  updated_at: string
  thumbnail: string | null
}

export interface AuditDetail {
  id: number
  entry_type: EntryType
  status: AuditStatus
  amazon_url: string | null
  product_name: string
  category: string
  main_benefit: string
  current_title: string
  bullet_points: string
  description: string
  backend_keywords: string
  price: string
  rating: string
  review_count: string
  target_audience: string
  seller_goal: string
  notes: string
  created_at: string
  updated_at: string
  submitted_at: string | null
  images: AuditImage[]
}

export interface CreateAuditPayload {
  entry_type: EntryType
  amazon_url?: string
  product_name?: string
  category?: string
  main_benefit?: string
  current_title?: string
  bullet_points?: string
  description?: string
  backend_keywords?: string
  price?: string
  rating?: string
  review_count?: string
  target_audience?: string
  seller_goal?: string
  notes?: string
}
