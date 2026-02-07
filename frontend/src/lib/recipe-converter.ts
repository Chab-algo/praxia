import { RecipeDetail, VisualRecipe, RecipeNode, RecipeEdge, StepType } from '@/types/recipe-editor';

const NODE_WIDTH = 200;
const NODE_HEIGHT = 100;
const VERTICAL_SPACING = 150;
const HORIZONTAL_START = 100;

/**
 * Convert a recipe to visual format (nodes + edges)
 */
export function recipeToVisual(recipe: RecipeDetail): VisualRecipe {
  const nodes: RecipeNode[] = [];
  const edges: RecipeEdge[] = [];

  // Create nodes from steps
  recipe.steps.forEach((step, index) => {
    const nodeId = `node-${step.id}`;
    const x = HORIZONTAL_START;
    const y = VERTICAL_SPACING * index + 100;

    // Extract config from step
    const config: Record<string, unknown> = { ...step };
    delete config.id;
    delete config.name;
    delete config.type;

    nodes.push({
      id: nodeId,
      type: step.type,
      position: { x, y },
      data: {
        stepId: step.id,
        name: step.name,
        stepType: step.type as StepType,
        config: config as Record<string, unknown>,
      },
    });

    // Create edge from previous node
    if (index > 0) {
      const prevNodeId = `node-${recipe.steps[index - 1].id}`;
      edges.push({
        id: `edge-${prevNodeId}-${nodeId}`,
        source: prevNodeId,
        target: nodeId,
        type: 'smoothstep',
      });
    }
  });

  return {
    nodes,
    edges,
    metadata: {
      name: recipe.name,
      description: recipe.description,
      category: recipe.category,
      input_schema: recipe.input_schema,
      output_schema: recipe.output_schema,
    },
  };
}

/**
 * Convert visual format to recipe format
 */
export function visualToRecipe(visual: VisualRecipe): {
  steps: Array<{
    id: string;
    name: string;
    type: StepType;
    [key: string]: unknown;
  }>;
  metadata: {
    name: string;
    description: string;
    category: string;
    input_schema: Record<string, unknown>;
    output_schema: Record<string, unknown>;
  };
} {
  // Topological sort to determine execution order
  const sortedNodes = topologicalSort(visual.nodes, visual.edges);

  const steps = sortedNodes.map((node) => {
    const step: {
      id: string;
      name: string;
      type: StepType;
      [key: string]: unknown;
    } = {
      id: node.data.stepId,
      name: node.data.name,
      type: node.data.stepType,
      ...node.data.config,
    };

    return step;
  });

  return {
    steps,
    metadata: visual.metadata,
  };
}

/**
 * Topological sort to determine execution order based on edges
 */
function topologicalSort(
  nodes: RecipeNode[],
  edges: RecipeEdge[]
): RecipeNode[] {
  // Build adjacency list
  const graph = new Map<string, string[]>();
  const inDegree = new Map<string, number>();

  // Initialize
  nodes.forEach((node) => {
    graph.set(node.id, []);
    inDegree.set(node.id, 0);
  });

  // Build graph
  edges.forEach((edge) => {
    const source = graph.get(edge.source);
    if (source) {
      source.push(edge.target);
    }
    inDegree.set(edge.target, (inDegree.get(edge.target) || 0) + 1);
  });

  // Find nodes with no incoming edges
  const queue: string[] = [];
  inDegree.forEach((degree, nodeId) => {
    if (degree === 0) {
      queue.push(nodeId);
    }
  });

  const result: RecipeNode[] = [];
  const nodeMap = new Map(nodes.map((n) => [n.id, n]));

  // Process queue
  while (queue.length > 0) {
    const nodeId = queue.shift()!;
    const node = nodeMap.get(nodeId);
    if (node) {
      result.push(node);
    }

    const neighbors = graph.get(nodeId) || [];
    neighbors.forEach((neighborId) => {
      const currentDegree = inDegree.get(neighborId) || 0;
      inDegree.set(neighborId, currentDegree - 1);
      if (currentDegree - 1 === 0) {
        queue.push(neighborId);
      }
    });
  }

  // If we couldn't process all nodes, there's a cycle
  if (result.length !== nodes.length) {
    // Fallback: return nodes in their current order
    console.warn('Cycle detected in workflow, using fallback order');
    return nodes;
  }

  return result;
}

/**
 * Validate visual recipe
 */
export function validateVisualRecipe(visual: VisualRecipe): {
  valid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check for cycles
  const sortedNodes = topologicalSort(visual.nodes, visual.edges);
  if (sortedNodes.length !== visual.nodes.length) {
    errors.push('Workflow contains cycles. All workflows must be acyclic.');
  }

  // Check for isolated nodes (no connections)
  const connectedNodeIds = new Set<string>();
  visual.edges.forEach((edge) => {
    connectedNodeIds.add(edge.source);
    connectedNodeIds.add(edge.target);
  });

  visual.nodes.forEach((node) => {
    if (!connectedNodeIds.has(node.id) && visual.nodes.length > 1) {
      warnings.push(`Node "${node.data.name}" is not connected to the workflow.`);
    }
  });

  // Validate node data
  visual.nodes.forEach((node) => {
    if (!node.data.name || node.data.name.trim() === '') {
      errors.push(`Node "${node.id}" has no name.`);
    }
    if (!node.data.stepId || node.data.stepId.trim() === '') {
      errors.push(`Node "${node.id}" has no step ID.`);
    }
  });

  // Validate variable references in prompts
  visual.nodes.forEach((node) => {
    if (node.data.config.system_prompt) {
      const refs = extractVariableReferences(node.data.config.system_prompt as string);
      refs.forEach((ref) => {
        if (!isValidVariableReference(ref, visual.nodes)) {
          warnings.push(`Invalid variable reference "${ref}" in node "${node.data.name}".`);
        }
      });
    }
    if (node.data.config.user_prompt) {
      const refs = extractVariableReferences(node.data.config.user_prompt as string);
      refs.forEach((ref) => {
        if (!isValidVariableReference(ref, visual.nodes)) {
          warnings.push(`Invalid variable reference "${ref}" in node "${node.data.name}".`);
        }
      });
    }
  });

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Extract variable references from a template string
 */
function extractVariableReferences(template: string): string[] {
  const regex = /\{\{([^}]+)\}\}/g;
  const matches: string[] = [];
  let match;

  while ((match = regex.exec(template)) !== null) {
    matches.push(match[1].trim());
  }

  return matches;
}

/**
 * Check if a variable reference is valid
 */
function isValidVariableReference(ref: string, nodes: RecipeNode[]): boolean {
  // Check if it's a simple input variable (starts with input or direct variable)
  if (!ref.includes('steps.')) {
    return true; // Assume it's an input variable
  }

  // Check if it references a step output
  const stepRefMatch = ref.match(/steps\.([^.]+)\.output/);
  if (!stepRefMatch) {
    return false;
  }

  const stepId = stepRefMatch[1];
  return nodes.some((node) => node.data.stepId === stepId);
}
