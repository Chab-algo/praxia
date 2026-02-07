'use client';

import { useState, useEffect } from 'react';
import { RecipeNode, StepType } from '@/types/recipe-editor';

interface PropertiesPanelProps {
  selectedNode: RecipeNode | null;
  onUpdateNode: (nodeId: string, updates: Partial<RecipeNode['data']>) => void;
}

export function PropertiesPanel({ selectedNode, onUpdateNode }: PropertiesPanelProps) {
  if (!selectedNode) {
    return (
      <div className="w-80 border-l bg-muted/40 p-4">
        <h3 className="text-sm font-semibold mb-2">Properties</h3>
        <p className="text-sm text-muted-foreground">
          Select a node to edit its properties
        </p>
      </div>
    );
  }

  const handleUpdate = (updates: Partial<RecipeNode['data']>) => {
    onUpdateNode(selectedNode.id, updates);
  };

  return (
    <div className="w-80 border-l bg-muted/40 p-4 overflow-y-auto max-h-screen">
      <h3 className="text-sm font-semibold mb-4">Properties</h3>
      
      <div className="space-y-4">
        {/* Common fields */}
        <div>
          <label className="block text-xs font-medium mb-1">Name</label>
          <input
            type="text"
            value={selectedNode.data.name}
            onChange={(e) =>
              handleUpdate({ name: e.target.value })
            }
            className="w-full px-2 py-1.5 text-sm border rounded-md bg-background"
          />
        </div>

        {/* Type-specific fields */}
        {selectedNode.data.stepType === 'llm_call' && (
          <LLMCallProperties
            config={selectedNode.data.config}
            onUpdate={(config) => handleUpdate({ config: { ...selectedNode.data.config, ...config } })}
          />
        )}

        {selectedNode.data.stepType === 'transform' && (
          <TransformProperties
            config={selectedNode.data.config}
            onUpdate={(config) => handleUpdate({ config: { ...selectedNode.data.config, ...config } })}
          />
        )}

        {selectedNode.data.stepType === 'audio' && (
          <AudioProperties
            config={selectedNode.data.config}
            onUpdate={(config) => handleUpdate({ config: { ...selectedNode.data.config, ...config } })}
          />
        )}
      </div>
    </div>
  );
}

function LLMCallProperties({
  config,
  onUpdate,
}: {
  config: Record<string, unknown>;
  onUpdate: (updates: Record<string, unknown>) => void;
}) {
  return (
    <>
      <div>
        <label className="block text-xs font-medium mb-1">System Prompt</label>
        <textarea
          value={(config.system_prompt as string) || ''}
          onChange={(e) => onUpdate({ system_prompt: e.target.value })}
          className="w-full px-2 py-1.5 text-sm border rounded-md bg-background font-mono"
          rows={4}
          placeholder="You are a helpful assistant..."
        />
      </div>

      <div>
        <label className="block text-xs font-medium mb-1">User Prompt</label>
        <textarea
          value={(config.user_prompt as string) || ''}
          onChange={(e) => onUpdate({ user_prompt: e.target.value })}
          className="w-full px-2 py-1.5 text-sm border rounded-md bg-background font-mono"
          rows={3}
          placeholder="Use {{variable}} for template variables"
        />
      </div>

      <div>
        <label className="block text-xs font-medium mb-1">Complexity</label>
        <select
          value={(config.complexity as string) || 'extract'}
          onChange={(e) => onUpdate({ complexity: e.target.value })}
          className="w-full px-2 py-1.5 text-sm border rounded-md bg-background"
        >
          <option value="extract">Extract</option>
          <option value="classify">Classify</option>
          <option value="generate_short">Generate Short</option>
          <option value="analyze">Analyze</option>
          <option value="generate">Generate</option>
        </select>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-xs font-medium mb-1">Max Tokens</label>
          <input
            type="number"
            value={(config.max_tokens as number) || 300}
            onChange={(e) => onUpdate({ max_tokens: parseInt(e.target.value) || 300 })}
            className="w-full px-2 py-1.5 text-sm border rounded-md bg-background"
            min={1}
            max={4000}
          />
        </div>

        <div>
          <label className="block text-xs font-medium mb-1">Temperature</label>
          <input
            type="number"
            step="0.1"
            value={(config.temperature as number) ?? 0.7}
            onChange={(e) => onUpdate({ temperature: parseFloat(e.target.value) || 0.7 })}
            className="w-full px-2 py-1.5 text-sm border rounded-md bg-background"
            min={0}
            max={1}
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium mb-1">Response Format</label>
        <select
          value={(config.response_format as string) || 'text'}
          onChange={(e) => onUpdate({ response_format: e.target.value })}
          className="w-full px-2 py-1.5 text-sm border rounded-md bg-background"
        >
          <option value="text">Text</option>
          <option value="json_object">JSON Object</option>
        </select>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="cacheable"
          checked={(config.cacheable as boolean) || false}
          onChange={(e) => onUpdate({ cacheable: e.target.checked })}
          className="w-4 h-4"
        />
        <label htmlFor="cacheable" className="text-xs font-medium">
          Cacheable
        </label>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="vision"
          checked={(config.vision as boolean) || false}
          onChange={(e) => onUpdate({ vision: e.target.checked })}
          className="w-4 h-4"
        />
        <label htmlFor="vision" className="text-xs font-medium">
          Vision (Image Support)
        </label>
      </div>
    </>
  );
}

function TransformProperties({
  config,
  onUpdate,
}: {
  config: Record<string, unknown>;
  onUpdate: (updates: Record<string, unknown>) => void;
}) {
  const [mappings, setMappings] = useState<Array<{ key: string; value: string }>>(() => {
    const mapping = (config.mapping as Record<string, string>) || {};
    return Object.entries(mapping).map(([key, value]) => ({ key, value }));
  });

  useEffect(() => {
    const mapping: Record<string, string> = {};
    mappings.forEach(({ key, value }) => {
      if (key.trim()) {
        mapping[key] = value;
      }
    });
    onUpdate({ mapping });
  }, [mappings, onUpdate]);

  const addMapping = () => {
    setMappings([...mappings, { key: '', value: '' }]);
  };

  const updateMapping = (index: number, field: 'key' | 'value', value: string) => {
    const updated = [...mappings];
    updated[index][field] = value;
    setMappings(updated);
  };

  const removeMapping = (index: number) => {
    setMappings(mappings.filter((_, i) => i !== index));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="block text-xs font-medium">Mapping</label>
        <button
          onClick={addMapping}
          className="text-xs px-2 py-1 bg-primary text-primary-foreground rounded hover:bg-primary/90"
        >
          + Add
        </button>
      </div>
      <div className="space-y-2">
        {mappings.map((mapping, index) => (
          <div key={index} className="flex gap-1">
            <input
              type="text"
              value={mapping.key}
              onChange={(e) => updateMapping(index, 'key', e.target.value)}
              placeholder="output_key"
              className="flex-1 px-2 py-1 text-xs border rounded-md bg-background"
            />
            <input
              type="text"
              value={mapping.value}
              onChange={(e) => updateMapping(index, 'value', e.target.value)}
              placeholder="{{steps.step_id.output.field}}"
              className="flex-1 px-2 py-1 text-xs border rounded-md bg-background font-mono"
            />
            <button
              onClick={() => removeMapping(index)}
              className="px-2 py-1 text-xs text-destructive hover:bg-destructive/10 rounded"
            >
              ×
            </button>
          </div>
        ))}
        {mappings.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-2">
            No mappings. Click + Add to create one.
          </p>
        )}
      </div>
    </div>
  );
}

function AudioProperties({
  config,
  onUpdate,
}: {
  config: Record<string, unknown>;
  onUpdate: (updates: Record<string, unknown>) => void;
}) {
  return (
    <>
      <div>
        <label className="block text-xs font-medium mb-1">Operation</label>
        <select
          value={(config.operation as string) || 'transcribe'}
          onChange={(e) => onUpdate({ operation: e.target.value })}
          className="w-full px-2 py-1.5 text-sm border rounded-md bg-background"
        >
          <option value="transcribe">Transcribe</option>
          <option value="analyze">Analyze</option>
          <option value="extract">Extract</option>
        </select>
      </div>
    </>
  );
}
