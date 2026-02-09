"use client";

import { useEffect, useState } from "react";

interface SchemaField {
  name: string;
  type: string;
  required: boolean;
}

interface ColumnMapperProps {
  headers: string[];
  schemaFields: SchemaField[];
  rows: Record<string, string>[];
  onMappingChange: (mapping: Record<string, string>) => void;
}

export function ColumnMapper({
  headers,
  schemaFields,
  rows,
  onMappingChange,
}: ColumnMapperProps) {
  const [mapping, setMapping] = useState<Record<string, string>>({});

  // Auto-map on mount: match headers to fields (case-insensitive)
  useEffect(() => {
    const autoMap: Record<string, string> = {};
    for (const field of schemaFields) {
      const match = headers.find(
        (h) => h.toLowerCase().replace(/[_\s-]/g, "") === field.name.toLowerCase().replace(/[_\s-]/g, "")
      );
      if (match) {
        autoMap[field.name] = match;
      }
    }
    setMapping(autoMap);
    onMappingChange(autoMap);
  }, [headers, schemaFields]); // eslint-disable-line react-hooks/exhaustive-deps

  const updateMapping = (fieldName: string, header: string) => {
    const next = { ...mapping, [fieldName]: header };
    if (!header) delete next[fieldName];
    setMapping(next);
    onMappingChange(next);
  };

  // Preview: first 3 rows with current mapping
  const previewRows = rows.slice(0, 3);

  return (
    <div className="space-y-6">
      {/* Mapping Controls */}
      <div className="space-y-3">
        <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Column Mapping
        </label>
        {schemaFields.map((field) => (
          <div key={field.name} className="flex items-center gap-3">
            <div className="w-1/3">
              <span className="text-sm font-medium">
                {field.name}
                {field.required && <span className="text-red-500 ml-0.5">*</span>}
              </span>
              <span className="text-xs text-muted-foreground ml-2">({field.type})</span>
            </div>
            <span className="text-muted-foreground">&rarr;</span>
            <select
              value={mapping[field.name] || ""}
              onChange={(e) => updateMapping(field.name, e.target.value)}
              className="flex-1 rounded-md border bg-background px-3 py-2 text-sm"
            >
              <option value="">— Select column —</option>
              {headers.map((h) => (
                <option key={h} value={h}>
                  {h}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>

      {/* Preview Table */}
      {previewRows.length > 0 && Object.keys(mapping).length > 0 && (
        <div>
          <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
            Preview (first {previewRows.length} rows)
          </label>
          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  {schemaFields
                    .filter((f) => mapping[f.name])
                    .map((f) => (
                      <th key={f.name} className="px-3 py-2 text-left font-medium text-muted-foreground">
                        {f.name}
                      </th>
                    ))}
                </tr>
              </thead>
              <tbody>
                {previewRows.map((row, i) => (
                  <tr key={i} className="border-b last:border-0">
                    {schemaFields
                      .filter((f) => mapping[f.name])
                      .map((f) => (
                        <td key={f.name} className="px-3 py-2 text-xs">
                          {row[mapping[f.name]] || "—"}
                        </td>
                      ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
