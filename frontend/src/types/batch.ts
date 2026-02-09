export type BatchStatus =
  | "pending"
  | "processing"
  | "completed"
  | "partial_failure"
  | "failed";

export type BatchItemStatus = "pending" | "processing" | "completed" | "failed";

export interface BatchSummary {
  id: string;
  agent_id: string;
  recipe_slug: string | null;
  name: string;
  status: BatchStatus;
  file_type: string;
  total_items: number;
  completed_items: number;
  failed_items: number;
  total_cost_cents: number;
  created_at: string;
  completed_at: string | null;
}

export interface BatchItem {
  id: string;
  item_index: number;
  status: BatchItemStatus;
  input_data: Record<string, unknown>;
  output_data: Record<string, unknown> | null;
  error_data: Record<string, unknown> | null;
  cost_cents: number;
  duration_ms: number | null;
  created_at: string;
  completed_at: string | null;
}

export interface BatchDetail extends BatchSummary {
  items: BatchItem[];
}
