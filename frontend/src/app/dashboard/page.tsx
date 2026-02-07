"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { listAgents, listExecutions, getBudgetStatus, listRecipes } from "@/lib/api";
import { CardSkeleton, Skeleton } from "@/components/skeleton";
import { motion, useReducedMotion } from "framer-motion";
import { fadeUp, staggerContainer, cardHover } from "@/lib/motion";

export default function DashboardPage() {
  const router = useRouter();
  const { getToken, isLoaded } = useAuth();
  const shouldReduceMotion = useReducedMotion();
  const [stats, setStats] = useState({
    agents: 0,
    executions: 0,
    recipes: 0,
    spent: 0,
    budget: 15,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoaded) return;

    // Check onboarding
    if (typeof window !== "undefined" && !localStorage.getItem("praxia_onboarded")) {
      router.push("/dashboard/onboarding");
      return;
    }

    const load = async () => {
      try {
        const token = await getToken();
        const [recipes, agents, executions, budget] = await Promise.allSettled([
          listRecipes(),
          token ? listAgents(token) : Promise.resolve([]),
          token ? listExecutions(token) : Promise.resolve([]),
          token ? getBudgetStatus(token) : Promise.resolve(null),
        ]);

        setStats({
          recipes: recipes.status === "fulfilled" ? recipes.value.length : 0,
          agents: agents.status === "fulfilled" ? agents.value.length : 0,
          executions: executions.status === "fulfilled" ? executions.value.length : 0,
          spent: budget.status === "fulfilled" && budget.value ? budget.value.spent_usd : 0,
          budget: budget.status === "fulfilled" && budget.value ? budget.value.budget_usd : 15,
        });
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
      <div>
        <Skeleton className="h-8 w-48 mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Dashboard</h2>

      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
        variants={staggerContainer}
        initial={shouldReduceMotion ? false : "initial"}
        animate={shouldReduceMotion ? false : "animate"}
      >
        <motion.a
          href="/dashboard/recipes"
          className="rounded-lg border p-6 hover:border-primary transition-colors"
          variants={fadeUp}
          {...(shouldReduceMotion ? {} : cardHover)}
        >
          <p className="text-sm text-muted-foreground">Recipes Available</p>
          <p className="text-3xl font-bold">{stats.recipes}</p>
        </motion.a>
        <motion.a
          href="/dashboard/agents"
          className="rounded-lg border p-6 hover:border-primary transition-colors"
          variants={fadeUp}
          {...(shouldReduceMotion ? {} : cardHover)}
        >
          <p className="text-sm text-muted-foreground">Agents</p>
          <p className="text-3xl font-bold">{stats.agents}</p>
        </motion.a>
        <motion.a
          href="/dashboard/executions"
          className="rounded-lg border p-6 hover:border-primary transition-colors"
          variants={fadeUp}
          {...(shouldReduceMotion ? {} : cardHover)}
        >
          <p className="text-sm text-muted-foreground">Executions</p>
          <p className="text-3xl font-bold">{stats.executions}</p>
        </motion.a>
        <motion.a
          href="/dashboard/usage"
          className="rounded-lg border p-6 hover:border-primary transition-colors"
          variants={fadeUp}
          {...(shouldReduceMotion ? {} : cardHover)}
        >
          <p className="text-sm text-muted-foreground">AI Cost</p>
          <p className="text-3xl font-bold">${stats.spent.toFixed(4)}</p>
          <p className="text-xs text-muted-foreground mt-1">
            of ${stats.budget.toFixed(2)} budget
          </p>
        </motion.a>
      </motion.div>

      {/* Quick actions */}
      <motion.div
        className="rounded-lg border p-6"
        variants={fadeUp}
        initial={shouldReduceMotion ? false : "initial"}
        animate={shouldReduceMotion ? false : "animate"}
      >
        <h3 className="font-semibold mb-4">Quick Start</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
            href="/dashboard/usage"
            className="rounded-lg bg-muted/50 p-4 hover:bg-accent transition-colors"
            {...(shouldReduceMotion ? {} : cardHover)}
          >
            <div className="font-medium text-sm">Monitor Usage</div>
            <p className="text-xs text-muted-foreground mt-1">
              Track costs and budget consumption
            </p>
          </motion.a>
        </div>
      </motion.div>
    </div>
  );
}
