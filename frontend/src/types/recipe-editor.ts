import { Node, Edge } from '@xyflow/react';

export type StepType = 'llm_call' | 'transform' | 'audio';

export interface StepConfig extends Record<string, unknown> {
  // Common fields
  name: string;
  
  // LLM Call specific
  system_prompt?: string;
  user_prompt?: string;
  complexity?: 'extract' | 'classify' | 'generate_short' | 'analyze' | 'generate';
  max_tokens?: number;
  temperature?: number;
  response_format?: 'text' | 'json_object';
  cacheable?: boolean;
  vision?: boolean;
  
  // Transform specific
  mapping?: Record<string, string>;
  
  // Audio specific
  operation?: string;
  audio_config?: Record<string, unknown>;
}

export interface RecipeNodeData extends Record<string, unknown> {
  stepId: string;
  name: string;
  config: StepConfig;
  stepType: StepType;
}

export type RecipeNode = Node<RecipeNodeData>;
export type LLMCallNodeType = Node<RecipeNodeData, 'llm_call'>;
export type TransformNodeType = Node<RecipeNodeData, 'transform'>;
export type AudioNodeType = Node<RecipeNodeData, 'audio'>;
export type RecipeEdge = Edge;

export interface VisualRecipe {
  nodes: RecipeNode[];
  edges: RecipeEdge[];
  metadata: {
    name: string;
    description: string;
    category: string;
    input_schema: Record<string, unknown>;
    output_schema: Record<string, unknown>;
  };
}

export interface RecipeDetail {
  slug: string;
  name: string;
  description: string;
  category: string;
  version: string;
  icon: string | null;
  estimated_cost_per_run: number | null;
  roi_metrics: Record<string, string>;
  input_schema: Record<string, unknown>;
  output_schema: Record<string, unknown>;
  steps: Array<{
    id: string;
    name: string;
    type: StepType;
    [key: string]: unknown;
  }>;
}
