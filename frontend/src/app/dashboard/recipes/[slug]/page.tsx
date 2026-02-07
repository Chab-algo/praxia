"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getRecipe, createAgent } from "@/lib/api";
import { useAuth } from "@clerk/nextjs";

interface RecipeDetail {
  slug: string;
  name: string;
  description: string;
  category: string;
  version: string;
  estimated_cost_per_run: number | null;
  roi_metrics: Record<string, string>;
  input_schema: Record<string, any>;
  output_schema: Record<string, any>;
  steps: any[];
}

export default function RecipeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { getToken } = useAuth();
  const [recipe, setRecipe] = useState<RecipeDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  const slug = params.slug as string;

  useEffect(() => {
    getRecipe(slug)
      .then(setRecipe)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [slug]);

  const handleCreateAgent = async () => {
    if (!recipe) return;
    setCreating(true);
    try {
      const token = await getToken();
      if (!token) return;
      const agent = await createAgent(token, {
        name: recipe.name,
        recipe_slug: recipe.slug,
        description: recipe.description,
      });
      router.push(`/dashboard/agents/${agent.id}`);
    } catch (err) {
      console.error(err);
    } finally {
      setCreating(false);
    }
  };

  if (loading || !recipe) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  const inputFields = recipe.input_schema?.properties
    ? Object.entries(recipe.input_schema.properties)
    : [];
  const requiredFields = recipe.input_schema?.required || [];

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <a
          href="/dashboard/recipes"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          &larr; Back to recipes
        </a>
      </div>

      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">{recipe.name}</h2>
          <p className="text-muted-foreground mt-1">{recipe.description}</p>
          <div className="flex gap-2 mt-2">
            <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs">
              {recipe.category}
            </span>
            <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs">
              v{recipe.version}
            </span>
          </div>
        </div>
        <button
          onClick={handleCreateAgent}
          disabled={creating}
          className="rounded-md bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          {creating ? "Creating..." : "Create Agent"}
        </button>
      </div>

      {/* ROI Metrics */}
      {recipe.roi_metrics && Object.keys(recipe.roi_metrics).length > 0 && (
        <div className="rounded-lg border p-4 mb-6">
          <h3 className="font-semibold mb-3">ROI Metrics</h3>
          <div className="grid grid-cols-3 gap-4 text-sm">
            {Object.entries(recipe.roi_metrics).map(([key, value]) => (
              <div key={key}>
                <span className="text-muted-foreground">
                  {key.replace(/_/g, " ")}
                </span>
                <p className="font-medium">{value}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Cost */}
      {recipe.estimated_cost_per_run && (
        <div className="rounded-lg border p-4 mb-6">
          <h3 className="font-semibold mb-2">Estimated Cost</h3>
          <p className="text-2xl font-bold text-primary">
            ${recipe.estimated_cost_per_run.toFixed(4)}
            <span className="text-sm font-normal text-muted-foreground">
              {" "}
              per execution
            </span>
          </p>
        </div>
      )}

      {/* Input Schema */}
      <div className="rounded-lg border p-4 mb-6">
        <h3 className="font-semibold mb-3">Input Fields</h3>
        <div className="space-y-2">
          {inputFields.map(([name, schema]: [string, any]) => (
            <div
              key={name}
              className="flex items-center gap-2 text-sm rounded-md bg-muted p-2"
            >
              <span className="font-mono font-medium">{name}</span>
              <span className="text-muted-foreground">({schema.type})</span>
              {requiredFields.includes(name) && (
                <span className="text-xs text-red-500">required</span>
              )}
              {schema.description && (
                <span className="text-muted-foreground ml-auto text-xs">
                  {schema.description}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Steps */}
      <div className="rounded-lg border p-4">
        <h3 className="font-semibold mb-3">
          Workflow ({recipe.steps.length} steps)
        </h3>
        <div className="space-y-3">
          {recipe.steps.map((step: any, i: number) => (
            <div key={step.id} className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                {i + 1}
              </div>
              <div className="flex-1">
                <div className="font-medium text-sm">{step.name}</div>
                <div className="text-xs text-muted-foreground">
                  {step.type === "llm_call"
                    ? `AI Call (${step.complexity})`
                    : step.type}
                </div>
              </div>
              {step.complexity && (
                <span className="rounded-full bg-muted px-2 py-0.5 text-xs">
                  {step.complexity}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
