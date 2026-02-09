"use client";

import type { BatchStatus } from "@/types/batch";

interface BatchProgressProps {
  completed: number;
  failed: number;
  total: number;
  status: BatchStatus;
}

const STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  processing: "Processing",
  completed: "Completed",
  partial_failure: "Partial Failure",
  failed: "Failed",
};

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-gray-100 text-gray-700",
  processing: "bg-blue-100 text-blue-700",
  completed: "bg-green-100 text-green-700",
  partial_failure: "bg-orange-100 text-orange-700",
  failed: "bg-red-100 text-red-700",
};

export function BatchProgress({ completed, failed, total, status }: BatchProgressProps) {
  const processed = completed + failed;
  const pct = total > 0 ? Math.round((processed / total) * 100) : 0;
  const completedPct = total > 0 ? (completed / total) * 100 : 0;
  const failedPct = total > 0 ? (failed / total) * 100 : 0;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span
          className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
            STATUS_COLORS[status] || STATUS_COLORS.pending
          }`}
        >
          {STATUS_LABELS[status] || status}
        </span>
        <span className="text-sm text-muted-foreground">
          {processed}/{total} items ({pct}%)
        </span>
      </div>
      <div className="h-2.5 rounded-full bg-muted overflow-hidden flex">
        {completedPct > 0 && (
          <div
            className="h-full bg-green-500 transition-all duration-500"
            style={{ width: `${completedPct}%` }}
          />
        )}
        {failedPct > 0 && (
          <div
            className="h-full bg-red-500 transition-all duration-500"
            style={{ width: `${failedPct}%` }}
          />
        )}
      </div>
    </div>
  );
}
