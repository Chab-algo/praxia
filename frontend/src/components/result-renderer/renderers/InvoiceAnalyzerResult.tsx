"use client";

import { AlertTriangle } from "lucide-react";
import type { InvoiceAnalyzerOutput } from "@/types/result-renderer";

export function InvoiceAnalyzerResult({
  data,
}: {
  data: Record<string, unknown>;
}) {
  const d = data as unknown as InvoiceAnalyzerOutput;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h4 className="text-lg font-semibold">{d.vendor || "Vendor"}</h4>
          <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
            <span>Invoice #{d.invoice_number}</span>
            <span>{d.date}</span>
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold">
            {d.total_amount?.toLocaleString()} {d.currency || "EUR"}
          </p>
        </div>
      </div>

      {/* Line Items */}
      {d.line_items && d.line_items.length > 0 && (
        <div>
          <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
            Line Items
          </label>
          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-3 py-2 text-left font-medium text-muted-foreground">
                    Description
                  </th>
                  <th className="px-3 py-2 text-right font-medium text-muted-foreground">
                    Qty
                  </th>
                  <th className="px-3 py-2 text-right font-medium text-muted-foreground">
                    Unit Price
                  </th>
                  <th className="px-3 py-2 text-right font-medium text-muted-foreground">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody>
                {d.line_items.map((item, i) => (
                  <tr
                    key={i}
                    className="border-b last:border-0 even:bg-muted/20"
                  >
                    <td className="px-3 py-2">{item.description}</td>
                    <td className="px-3 py-2 text-right">{item.quantity}</td>
                    <td className="px-3 py-2 text-right">
                      {item.unit_price?.toLocaleString()}{" "}
                      {d.currency || "€"}
                    </td>
                    <td className="px-3 py-2 text-right font-medium">
                      {item.total?.toLocaleString()} {d.currency || "€"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Anomalies */}
      {d.anomalies && d.anomalies.length > 0 && (
        <div>
          <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
            Anomalies
          </label>
          <div className="space-y-2">
            {d.anomalies.map((anomaly, i) => (
              <div
                key={i}
                className="flex items-start gap-2 rounded-lg bg-orange-50 border border-orange-200 p-3"
              >
                <AlertTriangle className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-orange-800">{anomaly}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
