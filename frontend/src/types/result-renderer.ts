// ── Result Renderer Types ──────────────────────────────────────────

export interface ResultRendererProps {
  outputData: Record<string, unknown>;
  recipeSlug?: string | null;
  executionMeta?: ExecutionMeta;
}

export interface ExecutionMeta {
  duration_ms?: number | null;
  total_cost_cents?: number;
  models_used?: string[];
  cache_hits?: number;
  created_at?: string;
}

// ── Per-Recipe Output Types ──────────────────────────────────────────

export interface CvScreenerOutput {
  candidate_name: string;
  skills_found: string[];
  experience_years: number;
  match_score: number;
  recommendation: "strong_yes" | "yes" | "maybe" | "no";
  summary: string;
}

export interface InvoiceAnalyzerOutput {
  vendor: string;
  invoice_number: string;
  date: string;
  total_amount: number;
  currency: string;
  line_items: Array<{
    description: string;
    quantity: number;
    unit_price: number;
    total: number;
  }>;
  anomalies: string[];
}

export interface SupportTicketOutput {
  priority: "low" | "medium" | "high" | "urgent";
  category: string;
  sentiment: "positive" | "neutral" | "negative" | "angry";
  suggested_response: string;
  requires_escalation: boolean;
}

export interface ReviewResponderOutput {
  sentiment: "positive" | "neutral" | "negative";
  response: string;
  key_points: string[];
}

export interface SocialPostOutput {
  post_text: string;
  hashtags: string[];
  call_to_action: string;
}

export interface ImageAnalyzerOutput {
  description: string;
  tags: string[];
  category: string;
  price_estimate: number;
}

export interface AudioTranscriberOutput {
  transcript: string;
  summary: string;
  language: string;
  duration_estimate: number;
}

export interface ColorTesterOutput {
  color_analysis: Array<{
    color: string;
    element: string;
    recommendation: string;
    visual_harmony_score: number;
  }>;
  best_combinations: Array<{
    colors: string[];
    elements: string[];
    score: number;
    reasoning: string;
  }>;
  summary: string;
}
