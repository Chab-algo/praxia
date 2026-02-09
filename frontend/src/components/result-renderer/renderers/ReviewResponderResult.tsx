"use client";

import {
  ThumbsUp,
  ThumbsDown,
  Minus,
  Copy,
  Check,
  CheckCircle,
} from "lucide-react";
import { useState } from "react";
import type { ReviewResponderOutput } from "@/types/result-renderer";

const SENTIMENT_CONFIG: Record<
  string,
  {
    icon: React.FC<{ className?: string }>;
    color: string;
    bgColor: string;
  }
> = {
  positive: {
    icon: ThumbsUp,
    color: "text-green-600",
    bgColor: "bg-green-100 text-green-700",
  },
  neutral: {
    icon: Minus,
    color: "text-gray-500",
    bgColor: "bg-gray-100 text-gray-700",
  },
  negative: {
    icon: ThumbsDown,
    color: "text-red-600",
    bgColor: "bg-red-100 text-red-700",
  },
};

export function ReviewResponderResult({
  data,
}: {
  data: Record<string, unknown>;
}) {
  const d = data as unknown as ReviewResponderOutput;
  const [copied, setCopied] = useState(false);
  const config = SENTIMENT_CONFIG[d.sentiment] || SENTIMENT_CONFIG.neutral;
  const SentimentIcon = config.icon;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(d.response || "");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-5">
      {/* Sentiment */}
      <div className="flex items-center gap-3">
        <SentimentIcon className={`h-6 w-6 ${config.color}`} />
        <span
          className={`rounded-full px-3 py-1 text-sm font-medium ${config.bgColor}`}
        >
          {d.sentiment?.charAt(0).toUpperCase() + d.sentiment?.slice(1)}
        </span>
      </div>

      {/* Key Points */}
      {d.key_points && d.key_points.length > 0 && (
        <div>
          <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
            Key Points
          </label>
          <ul className="space-y-1.5">
            {d.key_points.map((point, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Response */}
      {d.response && (
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Generated Response
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
              {d.response}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
