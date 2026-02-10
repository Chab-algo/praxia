"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { getRecipe, createExecution } from "@/lib/api";
import { Skeleton } from "@/components/skeleton";
import { useToast } from "@/components/toast";
import { ArrowLeft } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ResultRenderer } from "@/components/result-renderer/ResultRenderer";

interface AgentData {
  id: string;
  name: string;
  description: string | null;
  status: string;
  recipe_slug: string | null;
  config_overrides: Record<string, any>;
  created_at: string;
}

export default function AgentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { getToken, isLoaded } = useAuth();
  const { addToast } = useToast();
  const [agent, setAgent] = useState<AgentData | null>(null);
  const [recipe, setRecipe] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Test execution state
  const [testInputs, setTestInputs] = useState<Record<string, string>>({});
  const [executing, setExecuting] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const agentId = params.id as string;

  useEffect(() => {
    if (!isLoaded) return;
    const load = async () => {
      try {
        const token = await getToken();
        if (!token) return;

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/agents/${agentId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const agentData = await res.json();
        setAgent(agentData);

        if (agentData.recipe_slug) {
          try {
            const token = await getToken();
            const recipeData = await getRecipe(agentData.recipe_slug, token || undefined);
            setRecipe(recipeData);

            if (recipeData.input_schema?.properties) {
              const defaults: Record<string, string> = {};
              for (const [key, schema] of Object.entries(
                recipeData.input_schema.properties as Record<string, any>
              )) {
                defaults[key] = schema.default || "";
              }
              setTestInputs(defaults);
            }
          } catch {
            // Recipe might not exist
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [isLoaded, agentId, getToken]);

  const handleTest = async () => {
    if (!agent) return;
    setExecuting(true);
    setResult(null);
    setError(null);

    try {
      const token = await getToken();
      if (!token) return;

      const execution = await createExecution(token, {
        agent_id: agent.id,
        input_data: testInputs,
      });

      if (execution.status === "failed") {
        setError(execution.error_data?.error || "Execution failed");
        addToast("Execution failed", "error");
      } else {
        setResult(execution);
        addToast("Agent executed successfully", "success");
      }
    } catch (err: any) {
      setError(err.message);
      addToast(err.message, "error");
    } finally {
      setExecuting(false);
    }
  };

  if (loading) {
    return (
      <div>
        <Skeleton className="h-4 w-24 mb-6" />
        <Skeleton className="h-8 w-64 mb-8" />
        <div className="grid grid-cols-1 lg:grid-cols-[30%_70%] gap-6">
          <Card padding="md">
            <Skeleton className="h-6 w-32 mb-4" />
            <Skeleton className="h-10 w-full mb-3" />
            <Skeleton className="h-10 w-full mb-3" />
          </Card>
          <Card padding="md">
            <Skeleton className="h-6 w-32 mb-4" />
            <Skeleton className="h-10 w-full mb-3" />
            <Skeleton className="h-10 w-32" />
          </Card>
        </div>
      </div>
    );
  }

  if (!agent) {
    return <p className="text-muted-foreground">Agent not found.</p>;
  }

  return (
    <div>
      {/* Back Button */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Agents
      </button>

      {/* Agent Name */}
      <h1 className="text-h1 mb-8">{agent.name}</h1>

      {/* Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[30%_70%] gap-6">
        {/* Left Column: Agent Info */}
        <div>
          <Card padding="md">
            <h3 className="text-h4 mb-4">Agent Information</h3>

            <dl className="space-y-3">
              <div>
                <dt className="text-xs font-mono uppercase text-muted-foreground mb-1">
                  Name
                </dt>
                <dd className="text-sm font-medium">{agent.name}</dd>
              </div>

              {agent.description && (
                <div>
                  <dt className="text-xs font-mono uppercase text-muted-foreground mb-1">
                    Description
                  </dt>
                  <dd className="text-sm text-muted-foreground">
                    {agent.description}
                  </dd>
                </div>
              )}

              <div>
                <dt className="text-xs font-mono uppercase text-muted-foreground mb-1">
                  Type
                </dt>
                <dd className="text-sm">
                  <Badge variant="default">
                    {agent.recipe_slug ? "Recipe" : "Custom"}
                  </Badge>
                </dd>
              </div>

              {agent.recipe_slug && (
                <div>
                  <dt className="text-xs font-mono uppercase text-muted-foreground mb-1">
                    Recipe
                  </dt>
                  <dd className="text-sm">
                    <Badge variant="default">{agent.recipe_slug}</Badge>
                  </dd>
                </div>
              )}

              <div>
                <dt className="text-xs font-mono uppercase text-muted-foreground mb-1">
                  Status
                </dt>
                <dd>
                  <Badge
                    variant={agent.status === "active" ? "active" : "draft"}
                    withDot
                  >
                    {agent.status}
                  </Badge>
                </dd>
              </div>

              <div>
                <dt className="text-xs font-mono uppercase text-muted-foreground mb-1">
                  Created
                </dt>
                <dd className="text-sm text-muted-foreground">
                  {new Date(agent.created_at).toLocaleDateString()}
                </dd>
              </div>
            </dl>

            <Button
              variant="secondary"
              className="w-full mt-6"
              onClick={() => router.push(`/dashboard/agents/${agent.id}/edit`)}
            >
              Edit Agent
            </Button>
          </Card>
        </div>

        {/* Right Column: Test Interface */}
        <div className="space-y-6">
          <Card padding="md">
            <h3 className="text-h4 mb-4">Test Agent</h3>

            {/* Test Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleTest();
              }}
              className="space-y-4"
            >
              {recipe?.input_schema?.properties ? (
                Object.entries(
                  recipe.input_schema.properties as Record<string, any>
                ).map(([key, schema]: [string, any]) => (
                  <div key={key}>
                    <label className="block text-sm font-medium mb-2">
                      {key}
                      {recipe.input_schema.required?.includes(key) && (
                        <span className="text-praxia-error ml-1">*</span>
                      )}
                    </label>
                    {schema.type === "string" && !schema.enum ? (
                      <textarea
                        rows={key.includes("text") ? 4 : 2}
                        className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm transition-colors focus:outline-none focus:border-l-4 focus:border-l-praxia-accent focus:pl-2"
                        placeholder={schema.description || key}
                        value={testInputs[key] || ""}
                        onChange={(e) =>
                          setTestInputs({ ...testInputs, [key]: e.target.value })
                        }
                        required={recipe.input_schema.required?.includes(key)}
                      />
                    ) : schema.enum ? (
                      <select
                        className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm transition-colors focus:outline-none focus:border-l-4 focus:border-l-praxia-accent focus:pl-2"
                        value={testInputs[key] || schema.default || ""}
                        onChange={(e) =>
                          setTestInputs({ ...testInputs, [key]: e.target.value })
                        }
                      >
                        {schema.enum.map((opt: string) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type={schema.type === "integer" ? "number" : "text"}
                        className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm transition-colors focus:outline-none focus:border-l-4 focus:border-l-praxia-accent focus:pl-2"
                        placeholder={schema.description || key}
                        value={testInputs[key] || ""}
                        onChange={(e) =>
                          setTestInputs({ ...testInputs, [key]: e.target.value })
                        }
                        required={recipe.input_schema.required?.includes(key)}
                      />
                    )}
                  </div>
                ))
              ) : (
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Input Data (JSON)
                  </label>
                  <textarea
                    rows={5}
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm font-mono transition-colors focus:outline-none focus:border-l-4 focus:border-l-praxia-accent focus:pl-2"
                    placeholder='{"key": "value"}'
                    value={JSON.stringify(testInputs, null, 2)}
                    onChange={(e) => {
                      try {
                        setTestInputs(JSON.parse(e.target.value));
                      } catch {}
                    }}
                  />
                </div>
              )}

              <Button type="submit" variant="accent" disabled={executing}>
                {executing ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                    Running...
                  </span>
                ) : (
                  "Run Test"
                )}
              </Button>
            </form>

            {/* Results Section */}
            {(result || error) && (
              <div className="mt-6 pt-6 border-t border-border">
                <h4 className="text-sm font-medium mb-3">Results</h4>

                {/* Error Display */}
                {error && (
                  <div className="rounded-md border border-praxia-error bg-[rgb(var(--praxia-error)_/_0.1)] p-4 mb-4">
                    <p className="text-sm font-medium text-[rgb(var(--praxia-error))]">
                      Error
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">{error}</p>
                  </div>
                )}

                {/* Success Result */}
                {result && (
                  <div className="space-y-4">
                    <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                      <span>{result.duration_ms}ms</span>
                      <span>${(result.total_cost_cents / 100).toFixed(6)}</span>
                      <span>{result.cache_hits} cache hits</span>
                      {result.models_used && (
                        <span>{result.models_used.join(", ")}</span>
                      )}
                    </div>

                    <div className="rounded-md bg-muted/30 p-4">
                      <ResultRenderer
                        outputData={result.output_data}
                        recipeSlug={agent.recipe_slug}
                      />
                    </div>

                    {result.steps && result.steps.length > 0 && (
                      <div>
                        <h5 className="text-xs font-mono uppercase text-muted-foreground mb-2">
                          Execution Steps
                        </h5>
                        <div className="space-y-2">
                          {result.steps.map((step: any, i: number) => (
                            <div
                              key={i}
                              className="flex items-center gap-3 rounded-md bg-muted/50 p-2 text-xs"
                            >
                              <span className="font-medium w-32">
                                {step.step_name}
                              </span>
                              <span className="text-muted-foreground">
                                {step.model_used || "transform"}
                              </span>
                              <span>{step.duration_ms}ms</span>
                              {step.cache_hit && (
                                <Badge variant="active" size="sm">
                                  CACHED
                                </Badge>
                              )}
                              <span className="ml-auto">
                                ${(step.cost_cents / 100).toFixed(6)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
