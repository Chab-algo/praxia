"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { getRecipe, createExecution } from "@/lib/api";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { fadeUp, staggerContainer, cardHover } from "@/lib/motion";

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
  const { getToken, isLoaded } = useAuth();
  const shouldReduceMotion = useReducedMotion();
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
      } else {
        setResult(execution);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setExecuting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!agent) {
    return <p className="text-muted-foreground">Agent not found.</p>;
  }

  return (
    <motion.div
      className="max-w-4xl"
      variants={staggerContainer}
      initial={shouldReduceMotion ? false : "initial"}
      animate={shouldReduceMotion ? false : "animate"}
    >
      <div className="mb-6">
        <a
          href="/dashboard/agents"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          &larr; Back to agents
        </a>
      </div>

      <motion.div className="flex items-start justify-between mb-6" variants={fadeUp}>
        <div>
          <h2 className="text-2xl font-bold">{agent.name}</h2>
          {agent.description && (
            <p className="text-muted-foreground mt-1">{agent.description}</p>
          )}
          <div className="flex gap-2 mt-2">
            <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs">
              {agent.status}
            </span>
            {agent.recipe_slug && (
              <span className="rounded-full bg-blue-50 text-blue-700 px-2.5 py-0.5 text-xs">
                {agent.recipe_slug}
              </span>
            )}
          </div>
        </div>
      </motion.div>

      {/* Test Panel */}
      <motion.div className="rounded-lg border p-6 mb-6" variants={fadeUp}>
        <h3 className="font-semibold mb-4">Test Agent</h3>

        {recipe?.input_schema?.properties ? (
          <div className="space-y-3 mb-4">
            {Object.entries(
              recipe.input_schema.properties as Record<string, any>
            ).map(([key, schema]: [string, any]) => (
              <div key={key}>
                <label className="block text-sm font-medium mb-1">
                  {key}
                  {recipe.input_schema.required?.includes(key) && (
                    <span className="text-red-500 ml-1">*</span>
                  )}
                  <span className="text-muted-foreground font-normal ml-2">
                    ({schema.type})
                  </span>
                </label>
                {schema.type === "string" && !schema.enum ? (
                  <textarea
                    rows={key.includes("text") ? 4 : 2}
                    className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                    placeholder={schema.description || key}
                    value={testInputs[key] || ""}
                    onChange={(e) =>
                      setTestInputs({ ...testInputs, [key]: e.target.value })
                    }
                  />
                ) : schema.enum ? (
                  <select
                    className="w-full rounded-md border bg-background px-3 py-2 text-sm"
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
                    className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                    placeholder={schema.description || key}
                    value={testInputs[key] || ""}
                    onChange={(e) =>
                      setTestInputs({ ...testInputs, [key]: e.target.value })
                    }
                  />
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">
              Input Data (JSON)
            </label>
            <textarea
              rows={5}
              className="w-full rounded-md border bg-background px-3 py-2 text-sm font-mono"
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

        <motion.button
          onClick={handleTest}
          disabled={executing}
          className="rounded-md bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          {...(shouldReduceMotion ? {} : cardHover)}
        >
          {executing ? (
            <span className="flex items-center gap-2">
              <span className="animate-spin h-4 w-4 border-2 border-primary-foreground border-t-transparent rounded-full" />
              Running...
            </span>
          ) : (
            "Run Test"
          )}
        </motion.button>
      </motion.div>

      {/* Error */}
      <AnimatePresence initial={false}>
        {error && (
          <motion.div
            className="rounded-lg border border-red-200 bg-red-50 p-4 mb-6"
            variants={fadeUp}
            initial={shouldReduceMotion ? false : "initial"}
            animate={shouldReduceMotion ? false : "animate"}
            exit={shouldReduceMotion ? undefined : "exit"}
          >
            <p className="text-sm text-red-800 font-medium">Error</p>
            <p className="text-sm text-red-600 mt-1">{error}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Result */}
      <AnimatePresence initial={false}>
        {result && (
          <motion.div
            className="rounded-lg border p-6 mb-6"
            variants={fadeUp}
            initial={shouldReduceMotion ? false : "initial"}
            animate={shouldReduceMotion ? false : "animate"}
            exit={shouldReduceMotion ? undefined : "exit"}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Result</h3>
              <div className="flex gap-3 text-xs text-muted-foreground">
                <span>{result.duration_ms}ms</span>
                <span>${(result.total_cost_cents / 100).toFixed(6)}</span>
                <span>{result.cache_hits} cache hits</span>
                <span>{result.models_used?.join(", ")}</span>
              </div>
            </div>

            <div className="rounded-md bg-muted p-4 mb-4">
              <pre className="text-sm whitespace-pre-wrap font-mono">
                {JSON.stringify(result.output_data, null, 2)}
              </pre>
            </div>

            {result.steps && result.steps.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-2">Execution Steps</h4>
                <div className="space-y-2">
                  {result.steps.map((step: any, i: number) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 rounded-md bg-muted/50 p-2 text-xs"
                    >
                      <span className="font-medium w-32">{step.step_name}</span>
                      <span className="text-muted-foreground">
                        {step.model_used || "transform"}
                      </span>
                      <span>{step.duration_ms}ms</span>
                      {step.cache_hit && (
                        <span className="text-green-600 font-medium">CACHED</span>
                      )}
                      <span className="ml-auto">
                        ${(step.cost_cents / 100).toFixed(6)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
