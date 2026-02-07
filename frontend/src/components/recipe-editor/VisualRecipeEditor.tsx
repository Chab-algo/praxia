'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Node,
  Edge,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { RecipeNode, RecipeEdge, VisualRecipe, StepType } from '@/types/recipe-editor';
import { nodeTypes } from './NodeTypes';
import { PropertiesPanel } from './PropertiesPanel';
import { NodePalette } from './NodePalette';

function getDefaultConfigForType(type: StepType): Record<string, unknown> {
  switch (type) {
    case 'llm_call':
      return {
        complexity: 'extract',
        max_tokens: 300,
        temperature: 0.7,
        response_format: 'text',
        cacheable: false,
        vision: false,
      };
    case 'transform':
      return {
        mapping: {},
      };
    case 'audio':
      return {
        operation: 'transcribe',
      };
    default:
      return {};
  }
}

interface VisualRecipeEditorProps {
  initialRecipe?: VisualRecipe;
  onRecipeChange?: (recipe: VisualRecipe) => void;
}

let nodeIdCounter = 0;

export function VisualRecipeEditor({
  initialRecipe,
  onRecipeChange,
}: VisualRecipeEditorProps) {
  const initialNodes = useMemo(() => initialRecipe?.nodes || [], [initialRecipe]);
  const initialEdges = useMemo(() => initialRecipe?.edges || [], [initialRecipe]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNode, setSelectedNode] = useState<RecipeNode | null>(null);

  // Notify parent of changes
  const notifyChange = useCallback(() => {
    if (onRecipeChange) {
      onRecipeChange({
        nodes: nodes as RecipeNode[],
        edges: edges as RecipeEdge[],
        metadata: initialRecipe?.metadata || {
          name: '',
          description: '',
          category: 'general',
          input_schema: {},
          output_schema: {},
        },
      });
    }
  }, [nodes, edges, initialRecipe, onRecipeChange]);

  const onConnect = useCallback(
    (params: Connection) => {
      setEdges((eds) => addEdge(params, eds));
      notifyChange();
    },
    [setEdges, notifyChange]
  );

  const onNodeClick = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      setSelectedNode(node as RecipeNode);
    },
    []
  );

  const handleAddNode = useCallback(
    (type: StepType) => {
      const newNode: RecipeNode = {
        id: `node-${++nodeIdCounter}`,
        type,
        position: {
          x: Math.random() * 400 + 100,
          y: Math.random() * 400 + 100,
        },
        data: {
          stepId: `step_${nodeIdCounter}`,
          name: `New ${type}`,
          stepType: type,
          config: getDefaultConfigForType(type),
        },
      };

      setNodes((nds) => [...nds, newNode]);
      notifyChange();
    },
    [setNodes, notifyChange]
  );

  const handleUpdateNode = useCallback(
    (nodeId: string, updates: Partial<RecipeNode['data']>) => {
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === nodeId) {
            return {
              ...node,
              data: {
                ...node.data,
                ...updates,
              },
            };
          }
          return node;
        })
      );
      
      // Update selected node if it's the one being updated
      if (selectedNode?.id === nodeId) {
        setSelectedNode({
          ...selectedNode,
          data: {
            ...selectedNode.data,
            ...updates,
          },
        });
      }
      
      notifyChange();
    },
    [setNodes, selectedNode, notifyChange]
  );

  const handleDeleteNode = useCallback(
    (nodeId: string) => {
      setNodes((nds) => nds.filter((node) => node.id !== nodeId));
      setEdges((eds) =>
        eds.filter((edge) => edge.source !== nodeId && edge.target !== nodeId)
      );
      if (selectedNode?.id === nodeId) {
        setSelectedNode(null);
      }
      notifyChange();
    },
    [setNodes, setEdges, selectedNode, notifyChange]
  );

  // Handle keyboard shortcuts
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if ((event.key === 'Delete' || event.key === 'Backspace') && selectedNode) {
        event.preventDefault();
        handleDeleteNode(selectedNode.id);
      }
    },
    [selectedNode, handleDeleteNode]
  );

  // Set up keyboard listener
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [handleKeyDown]);

  return (
    <div className="flex h-full w-full">
      <NodePalette onAddNode={handleAddNode} />
      
      <div className="flex-1 relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          nodeTypes={nodeTypes}
          fitView
          className="bg-background"
        >
          <Background />
          <Controls />
          <MiniMap
            nodeColor={(node) => {
              const colors: Record<string, string> = {
                llm_call: '#a78bfa',
                transform: '#60a5fa',
                audio: '#fb923c',
              };
              return colors[node.type || 'llm_call'] || '#gray';
            }}
          />
        </ReactFlow>
      </div>

      <PropertiesPanel selectedNode={selectedNode} onUpdateNode={handleUpdateNode} />
    </div>
  );
}
