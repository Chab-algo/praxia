"use client";

import { Download, Table, Copy, Check } from "lucide-react";
import { useState } from "react";

interface ExportButtonsProps {
  outputData: Record<string, unknown>;
  recipeSlug?: string | null;
}

function flattenForCsv(data: Record<string, unknown>): string {
  const arrayField = Object.entries(data).find(
    ([, v]) =>
      Array.isArray(v) &&
      v.length > 0 &&
      typeof v[0] === "object" &&
      v[0] !== null
  );

  if (arrayField) {
    const [arrayKey, arrayValue] = arrayField;
    const items = arrayValue as Record<string, unknown>[];
    const scalarFields = Object.entries(data)
      .filter(([k]) => k !== arrayKey)
      .map(([k]) => k);
    const itemFields = Object.keys(items[0]);
    const headers = [...scalarFields, ...itemFields];

    const rows = items.map((item) => {
      const scalarValues = scalarFields.map((k) =>
        JSON.stringify(data[k] ?? "")
      );
      const itemValues = itemFields.map((k) =>
        JSON.stringify(item[k] ?? "")
      );
      return [...scalarValues, ...itemValues].join(",");
    });

    return [headers.join(","), ...rows].join("\n");
  }

  const headers = Object.keys(data);
  const values = Object.values(data).map((v) =>
    typeof v === "object" ? JSON.stringify(v) : String(v ?? "")
  );
  return [headers.join(","), values.join(",")].join("\n");
}

function downloadFile(content: string, filename: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function ExportButtons({ outputData, recipeSlug }: ExportButtonsProps) {
  const [copied, setCopied] = useState(false);
  const prefix = recipeSlug || "result";

  const handleJsonExport = () => {
    downloadFile(
      JSON.stringify(outputData, null, 2),
      `${prefix}-${Date.now()}.json`,
      "application/json"
    );
  };

  const handleCsvExport = () => {
    const csv = flattenForCsv(outputData);
    downloadFile(csv, `${prefix}-${Date.now()}.csv`, "text/csv");
  };

  const handleCopy = async () => {
    const text = Object.entries(outputData)
      .map(([key, value]) => {
        const label = key
          .replace(/_/g, " ")
          .replace(/\b\w/g, (c) => c.toUpperCase());
        if (Array.isArray(value)) {
          if (value.length > 0 && typeof value[0] === "string")
            return `${label}: ${value.join(", ")}`;
          return `${label}:\n${JSON.stringify(value, null, 2)}`;
        }
        if (typeof value === "object" && value !== null) {
          return `${label}:\n${JSON.stringify(value, null, 2)}`;
        }
        return `${label}: ${value}`;
      })
      .join("\n\n");

    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center gap-2 mt-4 pt-3 border-t">
      <span className="text-xs text-muted-foreground mr-1">Export</span>
      <button
        onClick={handleJsonExport}
        className="inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
      >
        <Download className="h-3.5 w-3.5" />
        JSON
      </button>
      <button
        onClick={handleCsvExport}
        className="inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
      >
        <Table className="h-3.5 w-3.5" />
        CSV
      </button>
      <button
        onClick={handleCopy}
        className="inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
      >
        {copied ? (
          <>
            <Check className="h-3.5 w-3.5 text-green-600" />
            <span className="text-green-600">Copied!</span>
          </>
        ) : (
          <>
            <Copy className="h-3.5 w-3.5" />
            Copy
          </>
        )}
      </button>
    </div>
  );
}
