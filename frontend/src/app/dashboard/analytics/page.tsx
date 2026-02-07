"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  getAnalyticsOverview,
  getAnalyticsAgents,
  getAnalyticsTimeline,
  getAnalyticsInsights,
} from "@/lib/api";

interface Overview {
  total_executions: number;
  successful_executions: number;
  failed_executions: number;
  success_rate: number;
  total_cost_cents: number;
  total_input_tokens: number;
  total_output_tokens: number;
  total_cache_hits: number;
  avg_duration_ms: number;
  avg_cost_cents: number;
}

interface AgentStats {
  agent_id: string;
  agent_name: string;
  recipe_slug: string | null;
  agent_status: string;
  execution_count: number;
  successful_executions: number;
  success_rate: number;
  total_cost_cents: number;
  avg_cost_cents: number;
  avg_duration_ms: number;
  cache_hits: number;
}

interface TimelineItem {
  date: string;
  executions: number;
  successful: number;
  failed: number;
  cost_cents: number;
  input_tokens: number;
  output_tokens: number;
}

export default function AnalyticsPage() {
  const { getToken, isLoaded } = useAuth();
  const [overview, setOverview] = useState<Overview | null>(null);
  const [agents, setAgents] = useState<AgentStats[]>([]);
  const [timeline, setTimeline] = useState<TimelineItem[]>([]);
  const [insights, setInsights] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoaded) return;
    const load = async () => {
      try {
        const token = await getToken();
        if (!token) return;
        const [ov, ag, tl, ins] = await Promise.allSettled([
          getAnalyticsOverview(token),
          getAnalyticsAgents(token),
          getAnalyticsTimeline(token),
          getAnalyticsInsights(token),
        ]);
        setOverview(ov.status === "fulfilled" ? ov.value : null);
        setAgents(ag.status === "fulfilled" ? ag.value : []);
        setTimeline(tl.status === "fulfilled" ? tl.value : []);
        setInsights(ins.status === "fulfilled" ? ins.value : []);
      } catch (err) {
        console.error("Failed to load analytics:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [isLoaded, getToken]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!overview) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        Impossible de charger les analytics.
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Analytics</h2>

      {/* Insights */}
      {insights.length > 0 && (
        <div className="mb-6 space-y-2">
          {insights.map((insight, i) => (
            <div
              key={i}
              className={`p-4 rounded-lg border-l-4 ${
                insight.priority === "high"
                  ? "bg-red-50 border-red-500"
                  : insight.priority === "medium"
                  ? "bg-yellow-50 border-yellow-500"
                  : "bg-blue-50 border-blue-500"
              }`}
            >
              <div className="font-semibold mb-1">{insight.title}</div>
              <div className="text-sm text-muted-foreground mb-2">
                {insight.message}
              </div>
              <div className="text-sm font-medium">{insight.recommendation}</div>
            </div>
          ))}
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <div className="rounded-lg border p-4">
          <p className="text-xs text-muted-foreground">Total Executions</p>
          <p className="text-2xl font-bold">{overview.total_executions}</p>
        </div>
        <div className="rounded-lg border p-4">
          <p className="text-xs text-muted-foreground">Cout Total</p>
          <p className="text-2xl font-bold">
            ${(overview.total_cost_cents / 100).toFixed(4)}
          </p>
        </div>
        <div className="rounded-lg border p-4">
          <p className="text-xs text-muted-foreground">Cout Moy / Exec</p>
          <p className="text-2xl font-bold">
            ${(overview.avg_cost_cents / 100).toFixed(6)}
          </p>
        </div>
        <div className="rounded-lg border p-4">
          <p className="text-xs text-muted-foreground">Taux de Succes</p>
          <p className="text-2xl font-bold">{overview.success_rate}%</p>
        </div>
        <div className="rounded-lg border p-4">
          <p className="text-xs text-muted-foreground">Cache Hits</p>
          <p className="text-2xl font-bold">{overview.total_cache_hits}</p>
        </div>
        <div className="rounded-lg border p-4">
          <p className="text-xs text-muted-foreground">Duree Moyenne</p>
          <p className="text-2xl font-bold">{overview.avg_duration_ms}ms</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Daily Executions */}
        <div className="rounded-lg border p-6">
          <h3 className="font-semibold mb-4">Executions par jour</h3>
          {timeline.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={timeline}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12 }}
                  tickFormatter={(v: string) => v.slice(5)}
                />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="executions"
                  stroke="hsl(221.2, 83.2%, 53.3%)"
                  strokeWidth={2}
                  name="Total"
                />
                <Line
                  type="monotone"
                  dataKey="failed"
                  stroke="hsl(0, 84.2%, 60.2%)"
                  strokeWidth={1}
                  name="Echecs"
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-muted-foreground text-sm text-center py-8">
              Aucune donnee pour cette periode.
            </p>
          )}
        </div>

        {/* Daily Cost */}
        <div className="rounded-lg border p-6">
          <h3 className="font-semibold mb-4">Cout par jour (cents)</h3>
          {timeline.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={timeline}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12 }}
                  tickFormatter={(v: string) => v.slice(5)}
                />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="cost_cents"
                  stroke="hsl(142, 71%, 45%)"
                  strokeWidth={2}
                  name="Cout (cents)"
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-muted-foreground text-sm text-center py-8">
              Aucune donnee pour cette periode.
            </p>
          )}
        </div>
      </div>

      {/* Cost per Agent */}
      {agents.filter((a) => a.execution_count > 0).length > 0 && (
        <div className="rounded-lg border p-6 mb-8">
          <h3 className="font-semibold mb-4">Cout par agent (cents)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={agents.filter((a) => a.execution_count > 0)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="agent_name" tick={{ fontSize: 12 }} />
              <YAxis />
              <Tooltip />
              <Bar
                dataKey="total_cost_cents"
                fill="hsl(221.2, 83.2%, 53.3%)"
                radius={[4, 4, 0, 0]}
                name="Cout (cents)"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Agent Performance Table */}
      <div className="rounded-lg border">
        <div className="p-4 border-b">
          <h3 className="font-semibold">Performance par agent</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left p-3 font-medium">Agent</th>
                <th className="text-left p-3 font-medium">Recipe</th>
                <th className="text-right p-3 font-medium">Executions</th>
                <th className="text-right p-3 font-medium">Succes</th>
                <th className="text-right p-3 font-medium">Cout Total</th>
                <th className="text-right p-3 font-medium">Cout Moy.</th>
                <th className="text-right p-3 font-medium">Duree Moy.</th>
                <th className="text-right p-3 font-medium">Cache</th>
              </tr>
            </thead>
            <tbody>
              {agents.map((agent) => (
                <tr
                  key={agent.agent_id}
                  className="border-b hover:bg-muted/30"
                >
                  <td className="p-3 font-medium">{agent.agent_name}</td>
                  <td className="p-3 text-muted-foreground">
                    {agent.recipe_slug || "—"}
                  </td>
                  <td className="p-3 text-right">{agent.execution_count}</td>
                  <td className="p-3 text-right">{agent.success_rate}%</td>
                  <td className="p-3 text-right">
                    ${(agent.total_cost_cents / 100).toFixed(4)}
                  </td>
                  <td className="p-3 text-right">
                    ${(agent.avg_cost_cents / 100).toFixed(6)}
                  </td>
                  <td className="p-3 text-right">{agent.avg_duration_ms}ms</td>
                  <td className="p-3 text-right">{agent.cache_hits}</td>
                </tr>
              ))}
              {agents.length === 0 && (
                <tr>
                  <td
                    colSpan={8}
                    className="p-6 text-center text-muted-foreground"
                  >
                    Aucun agent cree.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
