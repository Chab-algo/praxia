"use client";

import React from "react";

function formatKey(key: string): string {
  return key
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function renderValue(value: unknown, key: string): React.ReactNode {
  if (value === null || value === undefined) {
    return <span className="text-muted-foreground">—</span>;
  }

  if (typeof value === "boolean") {
    return (
      <span
        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
          value ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
        }`}
      >
        {value ? "Yes" : "No"}
      </span>
    );
  }

  if (typeof value === "number") {
    const isCurrency =
      key.toLowerCase().includes("price") ||
      key.toLowerCase().includes("amount") ||
      key.toLowerCase().includes("cost");
    return (
      <span className="font-semibold text-foreground">
        {isCurrency
          ? `${value.toLocaleString()} €`
          : value.toLocaleString()}
      </span>
    );
  }

  if (typeof value === "string") {
    if (value.length > 100) {
      return (
        <p className="text-sm text-foreground whitespace-pre-wrap">{value}</p>
      );
    }
    return <span className="text-foreground">{value}</span>;
  }

  if (Array.isArray(value)) {
    if (value.length === 0)
      return <span className="text-muted-foreground">—</span>;

    // Array of strings → tags
    if (typeof value[0] === "string") {
      return (
        <div className="flex flex-wrap gap-1.5">
          {value.map((item, i) => (
            <span
              key={i}
              className="rounded-full bg-blue-50 text-blue-700 px-2.5 py-0.5 text-xs font-medium"
            >
              {item}
            </span>
          ))}
        </div>
      );
    }

    // Array of objects → table
    if (typeof value[0] === "object" && value[0] !== null) {
      const columns = Object.keys(value[0] as Record<string, unknown>);
      return (
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                {columns.map((col) => (
                  <th
                    key={col}
                    className="px-3 py-2 text-left font-medium text-muted-foreground"
                  >
                    {formatKey(col)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {value.map((row, i) => (
                <tr key={i} className="border-b last:border-0">
                  {columns.map((col) => (
                    <td key={col} className="px-3 py-2">
                      {String(
                        (row as Record<string, unknown>)[col] ?? "—"
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }
  }

  // Object → nested section
  if (typeof value === "object") {
    return <GenericRenderer data={value as Record<string, unknown>} />;
  }

  return <span>{String(value)}</span>;
}

export function GenericRenderer({
  data,
}: {
  data: Record<string, unknown>;
}) {
  const entries = Object.entries(data);

  return (
    <div className="space-y-4">
      {entries.map(([key, value]) => (
        <div key={key}>
          <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
            {formatKey(key)}
          </label>
          <div>{renderValue(value, key)}</div>
        </div>
      ))}
    </div>
  );
}
