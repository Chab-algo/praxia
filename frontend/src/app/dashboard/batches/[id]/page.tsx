"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { getBatch, exportBatch } from "@/lib/api";
import { Skeleton, CardSkeleton } from "@/components/skeleton";
import { useToast } from "@/components/toast";
import { motion, useReducedMotion } from "framer-motion";
import { fadeUp } from "@/lib/motion";
import { BatchProgress } from "@/components/batch/BatchProgress";
import { ResultsTable } from "@/components/batch/ResultsTable";
import { Download } from "lucide-react";
import type { BatchDetail, BatchItem } from "@/types/batch";

function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  const mins = Math.floor(ms / 60000);
  const secs = Math.round((ms % 60000) / 1000);
  return `${mins}m ${secs}s`;
}

export default function BatchDetailPage() {
  const params = useParams();
  const { getToken, isLoaded } = useAuth();
  const shouldReduceMotion = useReducedMotion();
  const batchId = params.id as string;
  const { addToast } = useToast();

  const [batch, setBatch] = useState<BatchDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"results" | "errors">("results");
  const [exporting, setExporting] = useState(false);

  const fetchBatch = useCallback(async () => {
    try {
      const token = await getToken();
      if (token) {
        const data = await getBatch(token, batchId, 0, 200);
        setBatch(data);
      }
    } catch (err) {
      console.error(err);
    }
  }, [getToken, batchId]);

  // Initial load
  useEffect(() => {
    if (!isLoaded) return;
    const load = async () => {
      await fetchBatch();
      setLoading(false);
    };
    load();
  }, [isLoaded, fetchBatch]);

  // Polling every 3s when active
  useEffect(() => {
    if (!batch) return;
    if (batch.status !== "processing" && batch.status !== "pending") return;

    const interval = setInterval(fetchBatch, 3000);
    return () => clearInterval(interval);
  }, [batch?.status, fetchBatch]);

  async function handleExport(format: "csv" | "json") {
    setExporting(true);
    try {
      const token = await getToken();
      if (!token) return;

      const content = await exportBatch(token, batchId, format);
      const blob = new Blob([content], {
        type: format === "csv" ? "text/csv" : "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${batch?.name || "batch"}-results.${format}`;
      a.click();
      URL.revokeObjectURL(url);
      addToast(`Exported as ${format.toUpperCase()}`, "success");
    } catch (err) {
      console.error("Export failed:", err);
      addToast("Export failed", "error");
    } finally {
      setExporting(false);
    }
  }

  if (loading) {
    return (
      <div>
        <Skeleton className="h-4 w-20 mb-2" />
        <Skeleton className="h-8 w-64 mb-6" />
        <Skeleton className="h-6 w-full mb-6" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </div>
    );
  }

  if (!batch) {
    return (
      <div className="rounded-lg border p-8 text-center text-muted-foreground">
        Batch not found.
      </div>
    );
  }

  const completedItems = batch.items.filter((i) => i.status === "completed");
  const failedItems = batch.items.filter((i) => i.status === "failed");
  const totalDuration = batch.items.reduce(
    (sum, i) => sum + (i.duration_ms || 0),
    0
  );
  const successRate =
    batch.completed_items + batch.failed_items > 0
      ? Math.round(
          (batch.completed_items /
            (batch.completed_items + batch.failed_items)) *
            100
        )
      : 0;

  return (
    <motion.div
      variants={fadeUp}
      initial={shouldReduceMotion ? false : "initial"}
      animate={shouldReduceMotion ? false : "animate"}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <a
              href="/dashboard/batches"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Batches
            </a>
            <span className="text-sm text-muted-foreground">/</span>
          </div>
          <h2 className="text-2xl font-bold">{batch.name}</h2>
          <div className="flex items-center gap-2 mt-1">
            {batch.recipe_slug && (
              <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs">
                {batch.recipe_slug}
              </span>
            )}
            <span className="text-xs text-muted-foreground">
              {new Date(batch.created_at).toLocaleString()}
            </span>
          </div>
        </div>

        {/* Export buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => handleExport("csv")}
            disabled={exporting || completedItems.length === 0}
            className="flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs hover:bg-muted transition-colors disabled:opacity-50"
          >
            <Download className="h-3.5 w-3.5" />
            CSV
          </button>
          <button
            onClick={() => handleExport("json")}
            disabled={exporting || completedItems.length === 0}
            className="flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs hover:bg-muted transition-colors disabled:opacity-50"
          >
            <Download className="h-3.5 w-3.5" />
            JSON
          </button>
        </div>
      </div>

      {/* Progress */}
      <div className="mb-6">
        <BatchProgress
          completed={batch.completed_items}
          failed={batch.failed_items}
          total={batch.total_items}
          status={batch.status}
        />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        <div className="rounded-lg border p-3">
          <p className="text-xs text-muted-foreground">Total Items</p>
          <p className="text-lg font-semibold">{batch.total_items}</p>
        </div>
        <div className="rounded-lg border p-3">
          <p className="text-xs text-muted-foreground">Completed</p>
          <p className="text-lg font-semibold text-green-600">
            {batch.completed_items}
          </p>
        </div>
        <div className="rounded-lg border p-3">
          <p className="text-xs text-muted-foreground">Failed</p>
          <p className="text-lg font-semibold text-red-600">
            {batch.failed_items}
          </p>
        </div>
        <div className="rounded-lg border p-3">
          <p className="text-xs text-muted-foreground">Success Rate</p>
          <p className="text-lg font-semibold">{successRate}%</p>
        </div>
        <div className="rounded-lg border p-3">
          <p className="text-xs text-muted-foreground">Total Cost</p>
          <p className="text-lg font-semibold">
            ${(batch.total_cost_cents / 100).toFixed(4)}
          </p>
        </div>
        <div className="rounded-lg border p-3">
          <p className="text-xs text-muted-foreground">Duration</p>
          <p className="text-lg font-semibold">
            {totalDuration > 0 ? formatDuration(totalDuration) : "—"}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-4 border-b">
        <button
          onClick={() => setTab("results")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            tab === "results"
              ? "border-primary text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Results
        </button>
        {failedItems.length > 0 && (
          <button
            onClick={() => setTab("errors")}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              tab === "errors"
                ? "border-red-500 text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Errors ({failedItems.length})
          </button>
        )}
      </div>

      {/* Tab Content */}
      {tab === "results" ? (
        <ResultsTable items={batch.items} recipeSlug={batch.recipe_slug} />
      ) : (
        <div className="space-y-3">
          {failedItems.map((item) => (
            <div
              key={item.id}
              className="rounded-lg border border-red-200 bg-red-50/50 p-4"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">
                  Item #{item.item_index + 1}
                </span>
                <span className="rounded-full bg-red-100 text-red-700 px-2 py-0.5 text-xs font-medium">
                  failed
                </span>
              </div>
              <div className="text-xs text-muted-foreground mb-2">
                Input:{" "}
                {Object.entries(item.input_data)
                  .slice(0, 3)
                  .map(([k, v]) => `${k}="${String(v).slice(0, 40)}"`)
                  .join(", ")}
              </div>
              {item.error_data && (
                <pre className="rounded-md bg-red-100/50 p-2 text-xs font-mono text-red-800 whitespace-pre-wrap">
                  {typeof item.error_data === "object"
                    ? JSON.stringify(item.error_data, null, 2)
                    : String(item.error_data)}
                </pre>
              )}
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
