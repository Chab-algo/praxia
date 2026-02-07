'use client';

import { Brain, ArrowRightLeft, Mic } from 'lucide-react';
import { StepType } from '@/types/recipe-editor';

interface NodePaletteProps {
  onAddNode: (type: StepType) => void;
}

const nodeTypes: Array<{
  type: StepType;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  description: string;
}> = [
  {
    type: 'llm_call',
    label: 'LLM Call',
    icon: Brain,
    color: 'bg-violet-100 text-violet-700 border-violet-300',
    description: 'Call a language model',
  },
  {
    type: 'transform',
    label: 'Transform',
    icon: ArrowRightLeft,
    color: 'bg-blue-100 text-blue-700 border-blue-300',
    description: 'Transform data',
  },
  {
    type: 'audio',
    label: 'Audio',
    icon: Mic,
    color: 'bg-orange-100 text-orange-700 border-orange-300',
    description: 'Process audio',
  },
];

export function NodePalette({ onAddNode }: NodePaletteProps) {
  return (
    <div className="w-64 border-r bg-muted/40 p-4">
      <h3 className="text-sm font-semibold mb-3">Components</h3>
      <div className="space-y-2">
        {nodeTypes.map((nodeType) => {
          const Icon = nodeType.icon;
          return (
            <button
              key={nodeType.type}
              onClick={() => onAddNode(nodeType.type)}
              className={`w-full p-3 rounded-lg border-2 text-left hover:shadow-md transition-all ${nodeType.color}`}
            >
              <div className="flex items-center gap-2 mb-1">
                <Icon className="w-4 h-4" />
                <span className="font-medium text-sm">{nodeType.label}</span>
              </div>
              <p className="text-xs opacity-70">{nodeType.description}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
