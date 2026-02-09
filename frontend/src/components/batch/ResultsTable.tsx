"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { expandCollapse } from "@/lib/motion";
import { ResultRenderer } from "@/components/result-renderer/ResultRenderer";
import type { BatchItem, BatchItemStatus } from "@/types/batch";

interface ResultsTableProps {
  items: BatchItem[];
  recipeSlug: string | null;
}

const STATUS_COLORS: Record<string, string> = {
  completed: "bg-green-100 text-green-700",
  failed: "bg-red-100 text-red-700",
  processing: "bg-blue-100 text-blue-700",
  pending: "bg-gray-100 text-gray-700",
};

type SortKey = "item_index" | "status" | "cost_cents" | "duration_ms";
type SortDir = "asc" | "desc";

export function ResultsTable({ items, recipeSlug }: ResultsTableProps) {
  const shouldReduceMotion = useReducedMotion();
  const [expanded, setExpanded] = useState<string | null>(null);
  const [filter, setFilter] = useState<BatchItemStatus | "all">("all");
  const [sortKey, setSortKey] = useState<SortKey>("item_index");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [page, setPage] = useState(0);
  const pageSize = 20;

  const filtered = items.filter((item) => filter === "all" || item.status === filter);

  const sorted = [...filtered].sort((a, b) => {
    const av = a[sortKey] ?? 0;
    const bv = b[sortKey] ?? 0;
    if (typeof av === "string" && typeof bv === "string") {
      return sortDir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
    }
    return sortDir === "asc" ? Number(av) - Number(bv) : Number(bv) - Number(av);
  });

  const paginated = sorted.slice(page * pageSize, (page + 1) * pageSize);
  const totalPages = Math.ceil(sorted.length / pageSize);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  // Get output column keys from the first completed item
  const outputKeys: string[] = [];
  const firstCompleted = items.find((i) => i.status === "completed" && i.output_data);
  if (firstCompleted?.output_data) {
    const keys = Object.keys(firstCompleted.output_data);
    outputKeys.push(...keys.slice(0, 3));
  }

  return (
    <div className="space-y-3">
      {/* Filter */}
      <div className="flex items-center gap-2">
        {(["all", "completed", "failed", "processing", "pending"] as const).map((f) => (
          <button
            key={f}
            onClick={() => {
              setFilter(f);
              setPage(0);
            }}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              filter === f
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {f === "all" ? `All (${items.length})` : `${f} (${items.filter((i) => i.status === f).length})`}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th
                onClick={() => toggleSort("item_index")}
                className="px-3 py-2 text-left font-medium text-muted-foreground cursor-pointer hover:text-foreground"
              >
                # {sortKey === "item_index" && (sortDir === "asc" ? "↑" : "↓")}
              </th>
              <th
                onClick={() => toggleSort("status")}
                className="px-3 py-2 text-left font-medium text-muted-foreground cursor-pointer hover:text-foreground"
              >
                Status {sortKey === "status" && (sortDir === "asc" ? "↑" : "↓")}
              </th>
              {outputKeys.map((key) => (
                <th key={key} className="px-3 py-2 text-left font-medium text-muted-foreground">
                  {key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                </th>
              ))}
              <th
                onClick={() => toggleSort("cost_cents")}
                className="px-3 py-2 text-right font-medium text-muted-foreground cursor-pointer hover:text-foreground"
              >
                Cost {sortKey === "cost_cents" && (sortDir === "asc" ? "↑" : "↓")}
              </th>
              <th
                onClick={() => toggleSort("duration_ms")}
                className="px-3 py-2 text-right font-medium text-muted-foreground cursor-pointer hover:text-foreground"
              >
                Duration {sortKey === "duration_ms" && (sortDir === "asc" ? "↑" : "↓")}
              </th>
            </tr>
          </thead>
          <tbody>
            {paginated.map((item) => (
              <tr key={item.id} className="border-b last:border-0 group">
                <td className="px-3 py-2">{item.item_index + 1}</td>
                <td className="px-3 py-2">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      STATUS_COLORS[item.status] || STATUS_COLORS.pending
                    }`}
                  >
                    {item.status}
                  </span>
                </td>
                {outputKeys.map((key) => (
                  <td key={key} className="px-3 py-2 text-xs max-w-[200px] truncate">
                    {item.output_data
                      ? typeof item.output_data[key] === "object"
                        ? JSON.stringify(item.output_data[key])
                        : String(item.output_data[key] ?? "—")
                      : item.error_data
                      ? "Error"
                      : "—"}
                  </td>
                ))}
                <td className="px-3 py-2 text-right text-xs">
                  ${(item.cost_cents / 100).toFixed(6)}
                </td>
                <td className="px-3 py-2 text-right text-xs">
                  {item.duration_ms ? `${item.duration_ms}ms` : "—"}
                </td>
                {/* Expand button */}
                <td className="px-2 py-2">
                  {item.output_data && (
                    <button
                      onClick={() =>
                        setExpanded(expanded === item.id ? null : item.id)
                      }
                      className="text-xs text-muted-foreground hover:text-foreground"
                    >
                      {expanded === item.id ? "▲" : "▼"}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Expanded Result */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            key={expanded}
            className="rounded-lg border p-4 bg-muted/20"
            variants={expandCollapse}
            initial={shouldReduceMotion ? false : "initial"}
            animate={shouldReduceMotion ? false : "animate"}
            exit={shouldReduceMotion ? undefined : "exit"}
          >
            {(() => {
              const item = items.find((i) => i.id === expanded);
              if (!item?.output_data) return null;
              return (
                <ResultRenderer
                  outputData={item.output_data}
                  recipeSlug={recipeSlug}
                />
              );
            })()}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            Page {page + 1} of {totalPages}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(Math.max(0, page - 1))}
              disabled={page === 0}
              className="rounded-md border px-3 py-1 text-xs disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
              disabled={page >= totalPages - 1}
              className="rounded-md border px-3 py-1 text-xs disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
