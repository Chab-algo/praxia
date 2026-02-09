"use client";

import { AlertTriangle, Copy, Check } from "lucide-react";
import { useState } from "react";
import type { SupportTicketOutput } from "@/types/result-renderer";

const PRIORITY_COLORS: Record<string, string> = {
  low: "bg-gray-100 text-gray-700",
  medium: "bg-blue-100 text-blue-700",
  high: "bg-orange-100 text-orange-700",
  urgent: "bg-red-100 text-red-700",
};

const SENTIMENT_CONFIG: Record<
  string,
  { emoji: string; color: string }
> = {
  positive: { emoji: "😊", color: "bg-green-100 text-green-700" },
  neutral: { emoji: "😐", color: "bg-gray-100 text-gray-700" },
  negative: { emoji: "😞", color: "bg-orange-100 text-orange-700" },
  angry: { emoji: "😠", color: "bg-red-100 text-red-700" },
};

export function SupportTicketResult({
  data,
}: {
  data: Record<string, unknown>;
}) {
  const d = data as unknown as SupportTicketOutput;
  const [copied, setCopied] = useState(false);
  const sentiment =
    SENTIMENT_CONFIG[d.sentiment] || SENTIMENT_CONFIG.neutral;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(d.suggested_response || "");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-5">
      {/* Badges Row */}
      <div className="flex flex-wrap items-center gap-2">
        <span
          className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
            PRIORITY_COLORS[d.priority] || "bg-gray-100 text-gray-700"
          }`}
        >
          {d.priority?.toUpperCase()}
        </span>
        <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium">
          {d.category?.replace(/_/g, " ")}
        </span>
        <span
          className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${sentiment.color}`}
        >
          {sentiment.emoji} {d.sentiment}
        </span>
      </div>

      {/* Escalation Alert */}
      {d.requires_escalation && (
        <div className="flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 p-3">
          <AlertTriangle className="h-4 w-4 text-red-500 flex-shrink-0" />
          <span className="text-sm font-medium text-red-800">
            Requires Escalation
          </span>
        </div>
      )}

      {/* Suggested Response */}
      {d.suggested_response && (
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Suggested Response
            </label>
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              {copied ? (
                <>
                  <Check className="h-3 w-3 text-green-600" />
                  <span className="text-green-600">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="h-3 w-3" />
                  Copy
                </>
              )}
            </button>
          </div>
          <div className="rounded-lg bg-muted/50 border p-4">
            <p className="text-sm leading-relaxed whitespace-pre-wrap">
              {d.suggested_response}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
