"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import {
  getDashboardStats,
  getAnalyticsTimeline,
  getBudgetStatus,
} from "@/lib/api";
import { CardSkeleton, ChartSkeleton, Skeleton } from "@/components/skeleton";
import { StatCard } from "@/components/dashboard/stat-card";
import { Card } from "@/components/ui/card";
import { useGSAP } from "@gsap/react";
import { setupStatCardsReveal } from "@/lib/gsap-animations";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  Layers,
  Activity,
  Zap,
  DollarSign,
  ArrowRight,
} from "lucide-react";

interface DashboardStats {
  agent_count: number;
  recent_execution_count: number;
  batch_count: number;
  budget_consumed_cents: number;
}

interface TimelineDay {
  date: string;
  executions: number;
  successful: number;
  failed: number;
  cost_cents: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const { getToken, isLoaded } = useAuth();
  const containerRef = useRef<HTMLDivElement>(null);

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [timeline, setTimeline] = useState<TimelineDay[]>([]);
  const [budgetUsd, setBudgetUsd] = useState(15);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoaded) return;

    if (
      typeof window !== "undefined" &&
      !localStorage.getItem("praxia_onboarded")
    ) {
      router.push("/dashboard/onboarding");
      return;
    }

    const load = async () => {
      try {
        const token = await getToken();
        if (!token) return;

        const [statsRes, timelineRes, budgetRes] = await Promise.allSettled([
          getDashboardStats(token),
          getAnalyticsTimeline(token, 7),
          getBudgetStatus(token),
        ]);

        if (statsRes.status === "fulfilled") setStats(statsRes.value);
        if (timelineRes.status === "fulfilled") setTimeline(timelineRes.value);
        if (budgetRes.status === "fulfilled" && budgetRes.value) {
          setBudgetUsd(budgetRes.value.budget_usd);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [isLoaded, getToken, router]);

  // Setup GSAP animations
  useGSAP(
    () => {
      if (!loading) {
        setupStatCardsReveal();
      }
    },
    { scope: containerRef, dependencies: [loading] }
  );

  if (loading) {
    return (
      <div>
        <Skeleton className="h-10 w-64 mb-8" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
        <ChartSkeleton />
      </div>
    );
  }

  const chartData = timeline.map((day) => ({
    date: new Date(day.date).toLocaleDateString("en", {
      month: "short",
      day: "numeric",
    }),
    successful: day.successful,
    failed: day.failed,
  }));

  const spentUsd = stats ? stats.budget_consumed_cents / 100 : 0;
  const budgetPercent = Math.min((spentUsd / budgetUsd) * 100, 100);

  const totalExecutions = timeline.reduce(
    (acc, day) => acc + day.executions,
    0
  );
  const successRate =
    totalExecutions > 0
      ? ((timeline.reduce((acc, day) => acc + day.successful, 0) /
          totalExecutions) *
          100
        ).toFixed(1)
      : "0";

  return (
    <div ref={containerRef}>
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-h1 mb-2">Dashboard</h2>
        <p className="text-body text-muted-foreground">
          Welcome back! Here's your AI agent activity overview.
        </p>
      </div>

      {/* Stats cards */}
      <div className="stats-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          label="Agents"
          value={stats?.agent_count ?? 0}
          icon={Layers}
          href="/dashboard/agents"
        />

        <StatCard
          label="Executions (7d)"
          value={stats?.recent_execution_count ?? 0}
          icon={Activity}
          href="/dashboard/executions"
          trend={
            successRate !== "0"
              ? { value: `${successRate}% success`, positive: Number(successRate) > 80 }
              : undefined
          }
        />

        <StatCard
          label="Batches"
          value={stats?.batch_count ?? 0}
          icon={Zap}
          href="/dashboard/batches"
        />

        <StatCard
          label="AI Cost"
          value={`$${spentUsd.toFixed(4)}`}
          icon={DollarSign}
          href="/dashboard/usage"
        />
      </div>

      {/* Budget progress bar */}
      {budgetPercent > 0 && (
        <Card padding="md" className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Budget Usage</span>
            <span className="text-sm font-mono text-muted-foreground">
              ${spentUsd.toFixed(2)} / ${budgetUsd.toFixed(2)}
            </span>
          </div>
          <div className="w-full h-2 bg-praxia-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-praxia-accent transition-all duration-500"
              style={{ width: `${budgetPercent}%` }}
            />
          </div>
        </Card>
      )}

      {/* Execution chart */}
      <Card padding="md" className="mb-8">
        <div className="mb-6">
          <h3 className="text-h4 mb-1">Execution Activity</h3>
          <p className="text-sm text-muted-foreground">Last 7 days</p>
        </div>

        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={chartData}>
              <CartesianGrid
                strokeDasharray=""
                stroke="rgb(var(--praxia-gray-200))"
                strokeWidth={0.5}
              />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12, fill: "rgb(var(--praxia-gray-600))" }}
                stroke="rgb(var(--praxia-gray-400))"
              />
              <YAxis
                allowDecimals={false}
                tick={{ fontSize: 12, fill: "rgb(var(--praxia-gray-600))" }}
                stroke="rgb(var(--praxia-gray-400))"
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgb(var(--praxia-white))",
                  border: "1px solid rgb(var(--praxia-gray-200))",
                  borderRadius: "6px",
                  fontSize: 12,
                  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.05)",
                }}
                cursor={{ fill: "rgb(var(--praxia-gray-50))" }}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar
                dataKey="successful"
                fill="rgb(var(--praxia-success))"
                name="Successful"
                stackId="a"
                radius={[0, 0, 0, 0]}
              />
              <Bar
                dataKey="failed"
                fill="rgb(var(--praxia-error))"
                name="Failed"
                stackId="a"
                radius={[6, 6, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex flex-col items-center justify-center h-[320px]">
            <Activity className="w-12 h-12 text-muted-foreground/30 mb-3" />
            <p className="text-sm text-muted-foreground">No execution data yet</p>
            <p className="text-xs text-muted-foreground mt-1">
              Run an agent to see activity here
            </p>
          </div>
        )}
      </Card>

      {/* Quick actions */}
      <Card padding="md">
        <h3 className="text-h4 mb-4">Quick Start</h3>
        <div className="space-y-2">
          <a
            href="/dashboard/recipes"
            className="flex items-center justify-between p-3 rounded-md border border-transparent hover:border-praxia-accent hover:bg-praxia-gray-50 transition-all group"
          >
            <span className="font-medium">Browse Recipes</span>
            <ArrowRight className="w-4 h-4 text-praxia-accent group-hover:translate-x-1 transition-transform" />
          </a>
          <a
            href="/dashboard/agents"
            className="flex items-center justify-between p-3 rounded-md border border-transparent hover:border-praxia-accent hover:bg-praxia-gray-50 transition-all group"
          >
            <span className="font-medium">Manage Agents</span>
            <ArrowRight className="w-4 h-4 text-praxia-accent group-hover:translate-x-1 transition-transform" />
          </a>
          <a
            href="/dashboard/batches/new"
            className="flex items-center justify-between p-3 rounded-md border border-transparent hover:border-praxia-accent hover:bg-praxia-gray-50 transition-all group"
          >
            <span className="font-medium">New Batch</span>
            <ArrowRight className="w-4 h-4 text-praxia-accent group-hover:translate-x-1 transition-transform" />
          </a>
        </div>
      </Card>
    </div>
  );
}
