"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { listExecutions } from "@/lib/api";

interface Execution {
  id: string;
  agent_id: string;
  status: string;
  total_cost_cents: number;
  cache_hits: number;
  models_used: string[];
  duration_ms: number | null;
  triggered_by: string;
  created_at: string;
  output_data: any;
  error_data: any;
}

const STATUS_COLORS: Record<string, string> = {
  completed: "bg-green-100 text-green-700",
  failed: "bg-red-100 text-red-700",
  running: "bg-blue-100 text-blue-700",
  pending: "bg-gray-100 text-gray-700",
};

export default function ExecutionsPage() {
  const { getToken, isLoaded } = useAuth();
  const [executions, setExecutions] = useState<Execution[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoaded) return;
    const load = async () => {
      try {
        const token = await getToken();
        if (token) {
          const data = await listExecutions(token);
          setExecutions(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [isLoaded, getToken]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Executions</h2>

      {executions.length === 0 ? (
        <div className="rounded-lg border p-8 text-center text-muted-foreground">
          No executions yet. Run an agent to see results here.
        </div>
      ) : (
        <div className="space-y-2">
          {executions.map((exec) => (
            <div key={exec.id} className="rounded-lg border">
              <button
                onClick={() =>
                  setExpanded(expanded === exec.id ? null : exec.id)
                }
                className="w-full p-4 text-left hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        STATUS_COLORS[exec.status] || STATUS_COLORS.pending
                      }`}
                    >
                      {exec.status}
                    </span>
                    <span className="text-sm font-mono text-muted-foreground">
                      {exec.id.slice(0, 8)}...
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    {exec.duration_ms && <span>{exec.duration_ms}ms</span>}
                    <span>
                      ${(exec.total_cost_cents / 100).toFixed(6)}
                    </span>
                    <span>
                      {new Date(exec.created_at).toLocaleString()}
                    </span>
                  </div>
                </div>
              </button>

              {expanded === exec.id && (
                <div className="border-t p-4 bg-muted/30">
                  <div className="grid grid-cols-4 gap-4 text-sm mb-4">
                    <div>
                      <span className="text-muted-foreground">Models</span>
                      <p className="font-medium">
                        {exec.models_used?.join(", ") || "—"}
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Cache Hits</span>
                      <p className="font-medium">{exec.cache_hits}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Duration</span>
                      <p className="font-medium">
                        {exec.duration_ms ? `${exec.duration_ms}ms` : "—"}
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Triggered</span>
                      <p className="font-medium">{exec.triggered_by}</p>
                    </div>
                  </div>

                  {exec.output_data && (
                    <div>
                      <span className="text-sm text-muted-foreground">
                        Output
                      </span>
                      <pre className="mt-1 rounded-md bg-muted p-3 text-xs font-mono whitespace-pre-wrap">
                        {JSON.stringify(exec.output_data, null, 2)}
                      </pre>
                    </div>
                  )}

                  {exec.error_data && (
                    <div className="mt-2">
                      <span className="text-sm text-red-600">Error</span>
                      <pre className="mt-1 rounded-md bg-red-50 p-3 text-xs font-mono text-red-800">
                        {JSON.stringify(exec.error_data, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
