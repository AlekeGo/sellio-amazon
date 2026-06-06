export type EntryType = 'amazon_url' | 'product_photos'
export type AuditStatus = 'draft' | 'ready_for_analysis' | 'pending_analysis' | 'completed' | 'failed'

export interface AuditImage {
  id: number
  image: string
  original_filename: string
  uploaded_at: string
}

export interface AuditResult {
  id: number
  score: number
  score_label: string
  executive_summary: string
  conversion_diagnosis: {
    attention: string
    trust: string
    clarity: string
    conversion: string
  }
  weak_points: Array<{ area: string; issue: string; impact: string; fix: string }>
  title_analysis: { current_problem: string; strategy: string }
  improved_title: string
  bullet_improvements: Array<{ current_issue: string; improved_version: string }>
  improved_bullets: string[]
  description_analysis: { current_problem: string; improvement_strategy: string }
  improved_description: string
  keyword_opportunities: Array<{ keyword: string; reason: string }>
  review_insights: Array<{ signal: string; what_it_means: string; listing_fix: string }>
  buyer_objections: Array<{ objection: string; how_to_address: string }>
  a_plus_content_ideas: Array<{ section: string; purpose: string; content_idea: string }>
  image_pack_plan: Array<{
    image_type: string
    goal: string
    headline: string
    visual_direction: string
    text_elements: string[]
  }>
  priority_checklist: Array<{ priority: string; task: string; reason: string }>
  created_at: string
  updated_at: string
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
  result_score: number | null
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
  result: AuditResult | null
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
