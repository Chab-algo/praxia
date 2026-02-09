"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { listBatches } from "@/lib/api";
import { CardSkeleton, Skeleton } from "@/components/skeleton";
import { EmptyState } from "@/components/empty-state";
import { motion, useReducedMotion } from "framer-motion";
import { fadeUp, staggerContainer, cardHover } from "@/lib/motion";
import { BatchProgress } from "@/components/batch/BatchProgress";
import type { BatchSummary } from "@/types/batch";

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-gray-100 text-gray-700",
  processing: "bg-blue-100 text-blue-700",
  completed: "bg-green-100 text-green-700",
  partial_failure: "bg-orange-100 text-orange-700",
  failed: "bg-red-100 text-red-700",
};

const STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  processing: "Processing",
  completed: "Completed",
  partial_failure: "Partial Failure",
  failed: "Failed",
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function BatchesPage() {
  const { getToken, isLoaded } = useAuth();
  const shouldReduceMotion = useReducedMotion();
  const [batches, setBatches] = useState<BatchSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoaded) return;
    const load = async () => {
      try {
        const token = await getToken();
        if (token) {
          const data = await listBatches(token);
          setBatches(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [isLoaded, getToken]);

  // Re-poll if any batch is still processing
  useEffect(() => {
    const hasActive = batches.some(
      (b) => b.status === "processing" || b.status === "pending"
    );
    if (!hasActive) return;

    const interval = setInterval(async () => {
      try {
        const token = await getToken();
        if (token) {
          const data = await listBatches(token);
          setBatches(data);
        }
      } catch {
        // ignore
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [batches, getToken]);

  if (loading) {
    return (
      <div>
        <Skeleton className="h-8 w-32 mb-6" />
        <div className="space-y-3">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Batches</h2>
        <a
          href="/dashboard/batches/new"
          className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90"
        >
          + New Batch
        </a>
      </div>

      {batches.length === 0 ? (
        <EmptyState
          title="No batches yet"
          description="Process multiple items at once with batch executions. Upload a CSV or JSON file to get started."
          action={{ label: "Create Batch", href: "/dashboard/batches/new" }}
        />
      ) : (
        <motion.div
          className="space-y-3"
          variants={staggerContainer}
          initial={shouldReduceMotion ? false : "initial"}
          animate={shouldReduceMotion ? false : "animate"}
        >
          {batches.map((batch) => (
            <motion.a
              key={batch.id}
              href={`/dashboard/batches/${batch.id}`}
              className="block rounded-lg border p-4 hover:border-primary hover:shadow-sm transition-all"
              variants={fadeUp}
              {...(shouldReduceMotion ? {} : cardHover)}
            >
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="font-semibold">{batch.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    {batch.recipe_slug && (
                      <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs">
                        {batch.recipe_slug}
                      </span>
                    )}
                    <span className="text-xs text-muted-foreground">
                      {batch.total_items} items
                    </span>
                    <span className="text-xs text-muted-foreground">
                      &bull; ${(batch.total_cost_cents / 100).toFixed(4)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      &bull; {timeAgo(batch.created_at)}
                    </span>
                  </div>
                </div>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    STATUS_COLORS[batch.status] || STATUS_COLORS.pending
                  }`}
                >
                  {STATUS_LABELS[batch.status] || batch.status}
                </span>
              </div>
              <BatchProgress
                completed={batch.completed_items}
                failed={batch.failed_items}
                total={batch.total_items}
                status={batch.status}
              />
            </motion.a>
          ))}
        </motion.div>
      )}
    </div>
  );
}
