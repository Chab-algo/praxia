"use client";

import { Globe, Clock, FileText, Copy, Check } from "lucide-react";
import { useState } from "react";
import type { AudioTranscriberOutput } from "@/types/result-renderer";

export function AudioTranscriberResult({
  data,
}: {
  data: Record<string, unknown>;
}) {
  const d = data as unknown as AudioTranscriberOutput;
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(d.transcript || "");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-5">
      {/* Meta row */}
      <div className="flex items-center gap-3">
        {d.language && (
          <div className="flex items-center gap-1.5">
            <Globe className="h-4 w-4 text-muted-foreground" />
            <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium uppercase">
              {d.language}
            </span>
          </div>
        )}
        {d.duration_estimate !== undefined &&
          d.duration_estimate !== null && (
            <div className="flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {Math.round(d.duration_estimate)}s
              </span>
            </div>
          )}
      </div>

      {/* Summary */}
      {d.summary && (
        <div>
          <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
            Summary
          </label>
          <div className="rounded-lg bg-blue-50 border border-blue-100 p-4">
            <p className="text-sm text-blue-900 leading-relaxed">
              {d.summary}
            </p>
          </div>
        </div>
      )}

      {/* Transcript */}
      {d.transcript && (
        <div>
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5 text-muted-foreground" />
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Transcript
              </label>
            </div>
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
          <div className="rounded-lg border bg-muted/30 p-4 max-h-64 overflow-y-auto">
            <p className="text-sm leading-relaxed whitespace-pre-wrap">
              {d.transcript}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
