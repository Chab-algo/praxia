"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import {
  getDashboardStats,
  getAnalyticsTimeline,
  getBudgetStatus,
} from "@/lib/api";
import { CardSkeleton, ChartSkeleton, Skeleton } from "@/components/skeleton";
import { motion, useReducedMotion } from "framer-motion";
import { fadeUp, staggerContainer, cardHover } from "@/lib/motion";
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
  const shouldReduceMotion = useReducedMotion();

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

  if (loading) {
    return (
      <div>
        <Skeleton className="h-8 w-48 mb-6" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
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

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Dashboard</h2>

      {/* Stats cards */}
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
        variants={staggerContainer}
        initial={shouldReduceMotion ? false : "initial"}
        animate={shouldReduceMotion ? false : "animate"}
      >
        <motion.a
          href="/dashboard/agents"
          className="rounded-lg border p-6 hover:border-primary transition-colors"
          variants={fadeUp}
          {...(shouldReduceMotion ? {} : cardHover)}
        >
          <p className="text-sm text-muted-foreground">Agents</p>
          <p className="text-3xl font-bold">{stats?.agent_count ?? 0}</p>
        </motion.a>
        <motion.a
          href="/dashboard/executions"
          className="rounded-lg border p-6 hover:border-primary transition-colors"
          variants={fadeUp}
          {...(shouldReduceMotion ? {} : cardHover)}
        >
          <p className="text-sm text-muted-foreground">Executions (7d)</p>
          <p className="text-3xl font-bold">
            {stats?.recent_execution_count ?? 0}
          </p>
        </motion.a>
        <motion.a
          href="/dashboard/batches"
          className="rounded-lg border p-6 hover:border-primary transition-colors"
          variants={fadeUp}
          {...(shouldReduceMotion ? {} : cardHover)}
        >
          <p className="text-sm text-muted-foreground">Batches</p>
          <p className="text-3xl font-bold">{stats?.batch_count ?? 0}</p>
        </motion.a>
        <motion.a
          href="/dashboard/usage"
          className="rounded-lg border p-6 hover:border-primary transition-colors"
          variants={fadeUp}
          {...(shouldReduceMotion ? {} : cardHover)}
        >
          <p className="text-sm text-muted-foreground">AI Cost</p>
          <p className="text-3xl font-bold">${spentUsd.toFixed(4)}</p>
          <p className="text-xs text-muted-foreground mt-1">
            of ${budgetUsd.toFixed(2)} budget
          </p>
        </motion.a>
      </motion.div>

      {/* Execution chart */}
      <motion.div
        className="rounded-lg border p-6 mb-8"
        variants={fadeUp}
        initial={shouldReduceMotion ? false : "initial"}
        animate={shouldReduceMotion ? false : "animate"}
      >
        <h3 className="font-semibold mb-4">Executions — Last 7 Days</h3>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12 }}
                stroke="hsl(var(--muted-foreground))"
              />
              <YAxis
                allowDecimals={false}
                tick={{ fontSize: 12 }}
                stroke="hsl(var(--muted-foreground))"
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--background))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  fontSize: 12,
                }}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar
                dataKey="successful"
                fill="#10b981"
                name="Successful"
                stackId="a"
                radius={[0, 0, 0, 0]}
              />
              <Bar
                dataKey="failed"
                fill="#ef4444"
                name="Failed"
                stackId="a"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-[300px] text-muted-foreground text-sm">
            No execution data yet. Run an agent to see activity here.
          </div>
        )}
      </motion.div>

      {/* Quick actions */}
      <motion.div
        className="rounded-lg border p-6"
        variants={fadeUp}
        initial={shouldReduceMotion ? false : "initial"}
        animate={shouldReduceMotion ? false : "animate"}
      >
        <h3 className="font-semibold mb-4">Quick Start</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <motion.a
            href="/dashboard/recipes"
            className="rounded-lg bg-muted/50 p-4 hover:bg-accent transition-colors"
            {...(shouldReduceMotion ? {} : cardHover)}
          >
            <div className="font-medium text-sm">Browse Recipes</div>
            <p className="text-xs text-muted-foreground mt-1">
              Pick a pre-built AI agent template
            </p>
          </motion.a>
          <motion.a
            href="/dashboard/agents"
            className="rounded-lg bg-muted/50 p-4 hover:bg-accent transition-colors"
            {...(shouldReduceMotion ? {} : cardHover)}
          >
            <div className="font-medium text-sm">Manage Agents</div>
            <p className="text-xs text-muted-foreground mt-1">
              Configure and test your AI agents
            </p>
          </motion.a>
          <motion.a
            href="/dashboard/batches/new"
            className="rounded-lg bg-muted/50 p-4 hover:bg-accent transition-colors"
            {...(shouldReduceMotion ? {} : cardHover)}
          >
            <div className="font-medium text-sm">New Batch</div>
            <p className="text-xs text-muted-foreground mt-1">
              Process items in bulk with CSV upload
            </p>
          </motion.a>
        </div>
      </motion.div>
    </div>
  );
}
