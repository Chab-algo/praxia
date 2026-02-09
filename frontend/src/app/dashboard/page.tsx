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
import {
  fadeInUp,
  fadeInScale,
  staggerContainer,
  staggerSlow,
  cardHoverPremium,
  premiumCard,
} from "@/lib/motion-premium";
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
  TrendingUp,
  Zap,
  Activity,
  Layers,
  DollarSign,
  ArrowUpRight,
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

export default function DashboardPagePremium() {
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
  const budgetPercent = (spentUsd / budgetUsd) * 100;

  const totalExecutions = timeline.reduce(
    (acc, day) => acc + day.executions,
    0
  );
  const successRate =
    totalExecutions > 0
      ? Number((
          (timeline.reduce((acc, day) => acc + day.successful, 0) /
            totalExecutions) *
          100
        ).toFixed(1))
      : 0;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <motion.div
        className="mb-8"
        variants={fadeInUp}
        initial={shouldReduceMotion ? false : "initial"}
        animate={shouldReduceMotion ? false : "animate"}
      >
        <h2 className="text-3xl font-bold mb-2 gradient-text">Dashboard</h2>
        <p className="text-sm text-muted-foreground">
          Welcome back! Here's your AI agent activity overview.
        </p>
      </motion.div>

      {/* Stats cards */}
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        variants={staggerContainer}
        initial={shouldReduceMotion ? false : "initial"}
        animate={shouldReduceMotion ? false : "animate"}
      >
        {/* Agent count card */}
        <motion.a
          href="/dashboard/agents"
          className="relative group glass-card rounded-xl p-6 overflow-hidden hover-lift"
          variants={fadeInScale}
          whileHover={shouldReduceMotion ? {} : cardHoverPremium.hover}
          whileTap={shouldReduceMotion ? {} : cardHoverPremium.tap}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          {/* Background gradient glow */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Layers className="w-5 h-5 text-blue-500" />
              </div>
              <ArrowUpRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <p className="text-sm text-muted-foreground mb-1">Agents</p>
            <p className="text-4xl font-bold">{stats?.agent_count ?? 0}</p>
          </div>
        </motion.a>

        {/* Executions card */}
        <motion.a
          href="/dashboard/executions"
          className="relative group glass-card rounded-xl p-6 overflow-hidden hover-lift"
          variants={fadeInScale}
          whileHover={shouldReduceMotion ? {} : cardHoverPremium.hover}
          whileTap={shouldReduceMotion ? {} : cardHoverPremium.tap}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                <Activity className="w-5 h-5 text-green-500" />
              </div>
              <ArrowUpRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <p className="text-sm text-muted-foreground mb-1">
              Executions (7d)
            </p>
            <p className="text-4xl font-bold">
              {stats?.recent_execution_count ?? 0}
            </p>
            {successRate > 0 && (
              <div className="flex items-center gap-1 mt-2">
                <TrendingUp className="w-3 h-3 text-green-500" />
                <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                  {successRate}% success rate
                </span>
              </div>
            )}
          </div>
        </motion.a>

        {/* Batches card */}
        <motion.a
          href="/dashboard/batches"
          className="relative group glass-card rounded-xl p-6 overflow-hidden hover-lift"
          variants={fadeInScale}
          whileHover={shouldReduceMotion ? {} : cardHoverPremium.hover}
          whileTap={shouldReduceMotion ? {} : cardHoverPremium.tap}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <Zap className="w-5 h-5 text-purple-500" />
              </div>
              <ArrowUpRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <p className="text-sm text-muted-foreground mb-1">Batches</p>
            <p className="text-4xl font-bold">{stats?.batch_count ?? 0}</p>
          </div>
        </motion.a>

        {/* AI Cost card */}
        <motion.a
          href="/dashboard/usage"
          className="relative group glass-card rounded-xl p-6 overflow-hidden hover-lift"
          variants={fadeInScale}
          whileHover={shouldReduceMotion ? {} : cardHoverPremium.hover}
          whileTap={shouldReduceMotion ? {} : cardHoverPremium.tap}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-orange-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-amber-500" />
              </div>
              <ArrowUpRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <p className="text-sm text-muted-foreground mb-1">AI Cost</p>
            <p className="text-4xl font-bold">${spentUsd.toFixed(4)}</p>
            <div className="mt-3">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-muted-foreground">
                  {budgetPercent.toFixed(1)}% used
                </span>
                <span className="text-muted-foreground">
                  ${budgetUsd.toFixed(2)}
                </span>
              </div>
              <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-amber-500 to-orange-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${budgetPercent}%` }}
                  transition={{
                    duration: 1,
                    ease: [0.16, 1, 0.3, 1],
                    delay: 0.5,
                  }}
                />
              </div>
            </div>
          </div>
        </motion.a>
      </motion.div>

      {/* Execution chart */}
      <motion.div
        className="glass-card rounded-xl p-6 mb-8"
        variants={fadeInUp}
        initial={shouldReduceMotion ? false : "initial"}
        animate={shouldReduceMotion ? false : "animate"}
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold">Execution Activity</h3>
            <p className="text-sm text-muted-foreground">Last 7 days</p>
          </div>
        </div>

        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={chartData}>
              <defs>
                <linearGradient id="successGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity={0.8} />
                  <stop offset="100%" stopColor="#10b981" stopOpacity={0.3} />
                </linearGradient>
                <linearGradient id="failGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ef4444" stopOpacity={0.8} />
                  <stop offset="100%" stopColor="#ef4444" stopOpacity={0.3} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--border))"
                strokeOpacity={0.3}
              />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                stroke="hsl(var(--border))"
              />
              <YAxis
                allowDecimals={false}
                tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                stroke="hsl(var(--border))"
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--background))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "12px",
                  fontSize: 12,
                  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                }}
                cursor={{ fill: "hsl(var(--muted))", opacity: 0.1 }}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar
                dataKey="successful"
                fill="url(#successGradient)"
                name="Successful"
                stackId="a"
                radius={[0, 0, 0, 0]}
              />
              <Bar
                dataKey="failed"
                fill="url(#failGradient)"
                name="Failed"
                stackId="a"
                radius={[6, 6, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-[320px]">
            <div className="text-center">
              <Activity className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">
                No execution data yet
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Run an agent to see activity here
              </p>
            </div>
          </div>
        )}
      </motion.div>

      {/* Quick actions */}
      <motion.div
        className="glass-card rounded-xl p-6"
        variants={fadeInUp}
        initial={shouldReduceMotion ? false : "initial"}
        animate={shouldReduceMotion ? false : "animate"}
      >
        <h3 className="text-lg font-semibold mb-4">Quick Start</h3>
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-3 gap-4"
          variants={staggerSlow}
          initial={shouldReduceMotion ? false : "initial"}
          animate={shouldReduceMotion ? false : "animate"}
        >
          <motion.a
            href="/dashboard/recipes"
            className="relative group rounded-lg bg-gradient-to-br from-blue-500/10 to-blue-500/5 p-5 border border-transparent hover:border-blue-500/30 transition-colors"
            variants={fadeInScale}
            whileHover={shouldReduceMotion ? {} : { scale: 1.02, y: -2 }}
            whileTap={shouldReduceMotion ? {} : { scale: 0.98 }}
          >
            <div className="font-medium mb-2 flex items-center gap-2">
              <span>Browse Recipes</span>
              <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <p className="text-sm text-muted-foreground">
              Pick a pre-built AI agent template
            </p>
          </motion.a>

          <motion.a
            href="/dashboard/agents"
            className="relative group rounded-lg bg-gradient-to-br from-purple-500/10 to-purple-500/5 p-5 border border-transparent hover:border-purple-500/30 transition-colors"
            variants={fadeInScale}
            whileHover={shouldReduceMotion ? {} : { scale: 1.02, y: -2 }}
            whileTap={shouldReduceMotion ? {} : { scale: 0.98 }}
          >
            <div className="font-medium mb-2 flex items-center gap-2">
              <span>Manage Agents</span>
              <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <p className="text-sm text-muted-foreground">
              Configure and test your AI agents
            </p>
          </motion.a>

          <motion.a
            href="/dashboard/batches/new"
            className="relative group rounded-lg bg-gradient-to-br from-amber-500/10 to-amber-500/5 p-5 border border-transparent hover:border-amber-500/30 transition-colors"
            variants={fadeInScale}
            whileHover={shouldReduceMotion ? {} : { scale: 1.02, y: -2 }}
            whileTap={shouldReduceMotion ? {} : { scale: 0.98 }}
          >
            <div className="font-medium mb-2 flex items-center gap-2">
              <span>New Batch</span>
              <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <p className="text-sm text-muted-foreground">
              Process items in bulk with CSV upload
            </p>
          </motion.a>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
