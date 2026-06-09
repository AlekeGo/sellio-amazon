export type EntryType = 'amazon_url' | 'product_photos'

export type SellerPersona =
  | 'premium'
  | 'budget_friendly'
  | 'gift_ready'
  | 'expert_professional'
  | 'luxury'
  | 'problem_solver'
  | 'minimal_clean'
  | ''

export interface ProUpgradePack {
  persona_used: string
  copy_ready_title: string
  copy_ready_bullets: string[]
  copy_ready_description: string
  product_details_fixes: Array<{
    field: string
    recommended_value: string
    reason: string
  }>
  image_briefs: Array<{
    image_type: string
    headline: string
    visual_direction: string
    text_elements?: string[]
  }>
  priority_checklist: Array<{
    priority: string
    task: string
    reason: string
  }>
}

export interface ImagePackPlanItem {
  image_type: string
  goal: string
  headline: string
  visual_direction: string
  text_elements: string[]
  buyer_objection?: string
  suggested_layout?: string
}

export interface Competitor {
  name?: string
  url?: string
  title?: string
  price?: string
  rating?: string
  review_count?: string
  bullets?: string
  image_notes?: string
  strengths?: string
  notes?: string
}

export interface BuyerObjectionRadarItem {
  objection: string
  source_signal: string
  why_it_hurts_conversion: string
  listing_fix: string
  image_fix: string
}

export interface CompetitorAdvantage {
  competitor: string
  advantage: string
  why_it_matters: string
}

export interface CompetitorWinArea {
  area: string
  opportunity: string
  recommended_action: string
}

export interface CompetitorAnalysisLite {
  summary: string
  competitor_advantages: CompetitorAdvantage[]
  where_we_can_win: CompetitorWinArea[]
  do_not_copy_warning: string
}

export interface ConciseReport {
  score: number
  score_label: string
  executive_summary: string
  top_critical_issues: Array<{ area: string; problem: string; impact: string; fix: string }>
  fix_this_first: Array<{ task: string; reason: string }>
  title_upgrade: { current_issue?: string; improved_title: string }
  about_this_item_upgrade: { strategy?: string; improved_bullets: string[] }
  product_details_fixes: Array<{ field: string; issue: string; recommended_fix: string }>
  description_upgrade: { current_issue?: string; improved_description: string }
  keyword_opportunities: Array<{ keyword: string; reason: string }>
  buyer_objections: Array<{ objection: string; how_to_address: string }>
  image_gallery_plan: Array<{
    image_type: string
    goal: string
    headline: string
    visual_direction: string
    text_elements?: string[]
  }>
  a_plus_brand_plan: Array<{ section: string; purpose: string; content_idea: string }>
  priority_checklist: Array<{ priority: string; task: string; reason: string }>
  buyer_objection_radar?: BuyerObjectionRadarItem[]
  competitor_analysis_lite?: CompetitorAnalysisLite
  details?: Record<string, unknown>
}

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
  image_pack_plan: ImagePackPlanItem[]
  priority_checklist: Array<{ priority: string; task: string; reason: string }>
  concise_report: ConciseReport | null
  pro_upgrade_pack: ProUpgradePack | null
  report_version: string
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
  about_this_item: string
  product_details: string
  product_specifications: string
  brand_content: string
  a_plus_content: string
  variations: string
  size_guide: string
  product_images_notes: string
  videos_notes: string
  reviews_qna: string
  buyer_complaints: string
  seller_persona: string
  competitors: Competitor[] | null
  competitor_notes: string
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
  about_this_item?: string
  product_details?: string
  product_specifications?: string
  brand_content?: string
  a_plus_content?: string
  product_images_notes?: string
  reviews_qna?: string
  seller_persona?: string
  competitors?: Competitor[]
  competitor_notes?: string
}
