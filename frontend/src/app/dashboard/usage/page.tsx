"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { getBudgetStatus } from "@/lib/api";
import { motion, useReducedMotion } from "framer-motion";
import { fadeUp, staggerContainer } from "@/lib/motion";

interface BudgetStatus {
  spent_usd: number;
  budget_usd: number;
  remaining_usd: number;
  usage_percent: number;
}

export default function UsagePage() {
  const { getToken, isLoaded } = useAuth();
  const shouldReduceMotion = useReducedMotion();
  const [budget, setBudget] = useState<BudgetStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoaded) return;
    const load = async () => {
      try {
        const token = await getToken();
        if (token) {
          const data = await getBudgetStatus(token);
          setBudget(data);
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

  const barColor =
    (budget?.usage_percent || 0) > 90
      ? "bg-red-500"
      : (budget?.usage_percent || 0) > 75
        ? "bg-yellow-500"
        : "bg-green-500";

  return (
    <motion.div
      variants={staggerContainer}
      initial={shouldReduceMotion ? false : "initial"}
      animate={shouldReduceMotion ? false : "animate"}
    >
      <h2 className="text-2xl font-bold mb-6">Usage & Costs</h2>

      {budget ? (
        <div className="space-y-6">
          <motion.div className="rounded-lg border p-6" variants={fadeUp}>
            <h3 className="font-semibold mb-4">OpenAI Budget</h3>
            <div className="grid grid-cols-3 gap-6 mb-6">
              <div>
                <p className="text-sm text-muted-foreground">Spent</p>
                <p className="text-3xl font-bold">${budget.spent_usd.toFixed(4)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Budget</p>
                <p className="text-3xl font-bold">${budget.budget_usd.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Remaining</p>
                <p className="text-3xl font-bold text-green-600">${budget.remaining_usd.toFixed(4)}</p>
              </div>
            </div>
            <div className="w-full bg-muted rounded-full h-4">
              <motion.div
                className={`h-4 rounded-full ${barColor}`}
                initial={shouldReduceMotion ? false : { width: 0 }}
                animate={
                  shouldReduceMotion
                    ? false
                    : { width: `${Math.min(budget.usage_percent, 100)}%` }
                }
                transition={{ duration: 0.4, ease: "easeOut" }}
              />
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              {budget.usage_percent.toFixed(1)}% of budget used
            </p>
          </motion.div>

          <motion.div className="rounded-lg border p-6" variants={fadeUp}>
            <h3 className="font-semibold mb-4">Model Pricing</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <div>
                  <span className="font-medium">gpt-4.1-nano</span>
                  <span className="text-muted-foreground ml-2">Classification, extraction</span>
                </div>
                <span className="font-mono">$0.10 / $0.40 per 1M tokens</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div>
                  <span className="font-medium">gpt-4.1-mini</span>
                  <span className="text-muted-foreground ml-2">Text generation, analysis</span>
                </div>
                <span className="font-mono">$0.40 / $1.60 per 1M tokens</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div>
                  <span className="font-medium">gpt-4.1</span>
                  <span className="text-muted-foreground ml-2">Complex reasoning</span>
                </div>
                <span className="font-mono">$2.00 / $8.00 per 1M tokens</span>
              </div>
            </div>
          </motion.div>
        </div>
      ) : (
        <motion.div className="rounded-lg border p-8 text-center text-muted-foreground" variants={fadeUp}>
          Could not load budget data. Make sure Redis is running.
        </motion.div>
      )}
    </motion.div>
  );
}
