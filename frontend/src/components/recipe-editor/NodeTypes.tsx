'use client';

import { Handle, Position, NodeProps } from '@xyflow/react';
import { Brain, ArrowRightLeft, Mic } from 'lucide-react';
import { RecipeNodeData } from '@/types/recipe-editor';

const nodeStyles = {
  llm_call: {
    bg: 'bg-violet-50 border-violet-300',
    iconBg: 'bg-violet-100',
    iconColor: 'text-violet-600',
    text: 'text-violet-900',
  },
  transform: {
    bg: 'bg-blue-50 border-blue-300',
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
    text: 'text-blue-900',
  },
  audio: {
    bg: 'bg-orange-50 border-orange-300',
    iconBg: 'bg-orange-100',
    iconColor: 'text-orange-600',
    text: 'text-orange-900',
  },
};

export function LLMCallNode({ data, selected }: NodeProps<RecipeNodeData>) {
  const styles = nodeStyles.llm_call;
  const modelInfo = data.config.complexity ? `(${data.config.complexity})` : '';

  return (
    <div
      className={`rounded-lg border-2 p-3 min-w-[180px] shadow-sm ${
        selected ? 'ring-2 ring-violet-400' : ''
      } ${styles.bg}`}
    >
      <Handle type="target" position={Position.Top} className="!bg-violet-400" />
      
      <div className="flex items-center gap-2 mb-2">
        <div className={`p-1.5 rounded ${styles.iconBg}`}>
          <Brain className={`w-4 h-4 ${styles.iconColor}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className={`font-semibold text-sm truncate ${styles.text}`}>
            {data.name}
          </div>
          {modelInfo && (
            <div className={`text-xs ${styles.text} opacity-70`}>
              {modelInfo}
            </div>
          )}
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} className="!bg-violet-400" />
    </div>
  );
}

export function TransformNode({ data, selected }: NodeProps<RecipeNodeData>) {
  const styles = nodeStyles.transform;
  const mappingCount = data.config.mapping
    ? Object.keys(data.config.mapping as Record<string, unknown>).length
    : 0;

  return (
    <div
      className={`rounded-lg border-2 p-3 min-w-[180px] shadow-sm ${
        selected ? 'ring-2 ring-blue-400' : ''
      } ${styles.bg}`}
    >
      <Handle type="target" position={Position.Top} className="!bg-blue-400" />
      
      <div className="flex items-center gap-2 mb-2">
        <div className={`p-1.5 rounded ${styles.iconBg}`}>
          <ArrowRightLeft className={`w-4 h-4 ${styles.iconColor}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className={`font-semibold text-sm truncate ${styles.text}`}>
            {data.name}
          </div>
          {mappingCount > 0 && (
            <div className={`text-xs ${styles.text} opacity-70`}>
              {mappingCount} mapping{mappingCount > 1 ? 's' : ''}
            </div>
          )}
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} className="!bg-blue-400" />
    </div>
  );
}

export function AudioNode({ data, selected }: NodeProps<RecipeNodeData>) {
  const styles = nodeStyles.audio;
  const operation = data.config.operation || 'process';

  return (
    <div
      className={`rounded-lg border-2 p-3 min-w-[180px] shadow-sm ${
        selected ? 'ring-2 ring-orange-400' : ''
      } ${styles.bg}`}
    >
      <Handle type="target" position={Position.Top} className="!bg-orange-400" />
      
      <div className="flex items-center gap-2 mb-2">
        <div className={`p-1.5 rounded ${styles.iconBg}`}>
          <Mic className={`w-4 h-4 ${styles.iconColor}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className={`font-semibold text-sm truncate ${styles.text}`}>
            {data.name}
          </div>
          <div className={`text-xs ${styles.text} opacity-70`}>
            {operation}
          </div>
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} className="!bg-orange-400" />
    </div>
  );
}

// Node types map for React Flow
export const nodeTypes = {
  llm_call: LLMCallNode,
  transform: TransformNode,
  audio: AudioNode,
};
