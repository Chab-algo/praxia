"use client";

import type { ColorTesterOutput } from "@/types/result-renderer";

function ProgressBar({ value, max = 100 }: { value: number; max?: number }) {
  const pct = Math.min((value / max) * 100, 100);
  const color =
    pct >= 70 ? "bg-green-500" : pct >= 40 ? "bg-orange-500" : "bg-red-500";
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs font-medium w-8 text-right">{value}</span>
    </div>
  );
}

function ColorSwatch({ color }: { color: string }) {
  return (
    <div className="flex items-center gap-2">
      <div
        className="h-6 w-6 rounded border"
        style={{ backgroundColor: color }}
      />
      <span className="text-xs font-mono">{color}</span>
    </div>
  );
}

export function ColorTesterResult({
  data,
}: {
  data: Record<string, unknown>;
}) {
  const d = data as unknown as ColorTesterOutput;

  return (
    <div className="space-y-5">
      {/* Color Analysis */}
      {d.color_analysis && d.color_analysis.length > 0 && (
        <div>
          <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
            Color Analysis
          </label>
          <div className="space-y-3">
            {d.color_analysis.map((item, i) => (
              <div key={i} className="rounded-lg border p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <ColorSwatch color={item.color} />
                  <span className="text-xs text-muted-foreground">
                    {item.element}
                  </span>
                </div>
                <ProgressBar value={item.visual_harmony_score} />
                <p className="text-xs text-muted-foreground">
                  {item.recommendation}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Best Combinations */}
      {d.best_combinations && d.best_combinations.length > 0 && (
        <div>
          <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
            Best Combinations
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {d.best_combinations.map((combo, i) => (
              <div key={i} className="rounded-lg border p-3 space-y-2">
                <div className="flex items-center gap-1">
                  {combo.colors.map((c, j) => (
                    <div
                      key={j}
                      className="h-8 flex-1 rounded"
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
                <ProgressBar value={combo.score} />
                <p className="text-xs text-muted-foreground">
                  {combo.reasoning}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Summary */}
      {d.summary && (
        <div>
          <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
            Summary
          </label>
          <p className="text-sm text-foreground leading-relaxed">
            {d.summary}
          </p>
        </div>
      )}
    </div>
  );
}
