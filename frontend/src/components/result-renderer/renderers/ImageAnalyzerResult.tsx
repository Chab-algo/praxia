"use client";

import { Tag, Package, DollarSign } from "lucide-react";
import type { ImageAnalyzerOutput } from "@/types/result-renderer";

export function ImageAnalyzerResult({
  data,
}: {
  data: Record<string, unknown>;
}) {
  const d = data as unknown as ImageAnalyzerOutput;

  return (
    <div className="space-y-5">
      {/* Description */}
      {d.description && (
        <div>
          <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
            Description
          </label>
          <p className="text-sm text-foreground leading-relaxed">
            {d.description}
          </p>
        </div>
      )}

      {/* Category + Price Row */}
      <div className="flex items-center gap-4">
        {d.category && (
          <div className="flex items-center gap-1.5">
            <Package className="h-4 w-4 text-muted-foreground" />
            <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium">
              {d.category}
            </span>
          </div>
        )}
        {d.price_estimate !== undefined && d.price_estimate !== null && (
          <div className="flex items-center gap-1.5">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            <span className="text-lg font-bold">
              {d.price_estimate.toLocaleString()} €
            </span>
          </div>
        )}
      </div>

      {/* Tags */}
      {d.tags && d.tags.length > 0 && (
        <div>
          <div className="flex items-center gap-1.5 mb-2">
            <Tag className="h-3.5 w-3.5 text-muted-foreground" />
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Tags
            </label>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {d.tags.map((tag, i) => (
              <span
                key={i}
                className="rounded-full bg-blue-50 text-blue-700 px-2.5 py-0.5 text-xs font-medium"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
