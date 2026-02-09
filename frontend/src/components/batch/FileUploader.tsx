"use client";

import { Upload, FileText, X } from "lucide-react";
import { useCallback, useState } from "react";

export interface ParsedFile {
  headers: string[];
  rows: Record<string, string>[];
  fileType: "csv" | "json" | "jsonl";
  fileName: string;
}

interface FileUploaderProps {
  onFileParsed: (result: ParsedFile) => void;
  onError: (message: string) => void;
}

function parseCsv(text: string): { headers: string[]; rows: Record<string, string>[] } {
  const lines = text.trim().split("\n");
  if (lines.length < 2) throw new Error("CSV must have a header row and at least one data row");

  const headers = lines[0].split(",").map((h) => h.trim().replace(/^"|"$/g, ""));
  const rows = lines.slice(1).map((line) => {
    const values = line.split(",").map((v) => v.trim().replace(/^"|"$/g, ""));
    const row: Record<string, string> = {};
    headers.forEach((h, i) => {
      row[h] = values[i] || "";
    });
    return row;
  });

  return { headers, rows };
}

function parseJsonArray(text: string): { headers: string[]; rows: Record<string, string>[] } {
  const data = JSON.parse(text);
  if (!Array.isArray(data)) throw new Error("JSON must be an array of objects");
  if (data.length === 0) throw new Error("JSON array is empty");
  if (typeof data[0] !== "object" || data[0] === null) throw new Error("Each item must be an object");

  const headers = Object.keys(data[0]);
  const rows = data.map((item: Record<string, unknown>) => {
    const row: Record<string, string> = {};
    headers.forEach((h) => {
      const val = item[h];
      row[h] = typeof val === "object" ? JSON.stringify(val) : String(val ?? "");
    });
    return row;
  });

  return { headers, rows };
}

function parseJsonl(text: string): { headers: string[]; rows: Record<string, string>[] } {
  const lines = text.trim().split("\n").filter(Boolean);
  if (lines.length === 0) throw new Error("JSONL file is empty");

  const items = lines.map((line, i) => {
    try {
      return JSON.parse(line);
    } catch {
      throw new Error(`Invalid JSON on line ${i + 1}`);
    }
  });

  const headers = Object.keys(items[0]);
  const rows = items.map((item: Record<string, unknown>) => {
    const row: Record<string, string> = {};
    headers.forEach((h) => {
      const val = item[h];
      row[h] = typeof val === "object" ? JSON.stringify(val) : String(val ?? "");
    });
    return row;
  });

  return { headers, rows };
}

export function FileUploader({ onFileParsed, onError }: FileUploaderProps) {
  const [dragOver, setDragOver] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const processFile = useCallback(
    async (f: File) => {
      const ext = f.name.split(".").pop()?.toLowerCase();
      if (!ext || !["csv", "json", "jsonl"].includes(ext)) {
        onError("Unsupported file type. Please upload a .csv, .json, or .jsonl file.");
        return;
      }

      const text = await f.text();
      try {
        let result: { headers: string[]; rows: Record<string, string>[] };
        let fileType: ParsedFile["fileType"];

        if (ext === "csv") {
          result = parseCsv(text);
          fileType = "csv";
        } else if (ext === "jsonl") {
          result = parseJsonl(text);
          fileType = "jsonl";
        } else {
          result = parseJsonArray(text);
          fileType = "json";
        }

        if (result.rows.length > 100) {
          onError(`File contains ${result.rows.length} items. Maximum is 100.`);
          return;
        }

        setFile(f);
        onFileParsed({
          headers: result.headers,
          rows: result.rows,
          fileType,
          fileName: f.name,
        });
      } catch (e: any) {
        onError(e.message || "Failed to parse file");
      }
    },
    [onFileParsed, onError]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const f = e.dataTransfer.files[0];
      if (f) processFile(f);
    },
    [processFile]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const f = e.target.files?.[0];
      if (f) processFile(f);
    },
    [processFile]
  );

  const clearFile = () => {
    setFile(null);
  };

  if (file) {
    return (
      <div className="rounded-lg border p-4 flex items-center gap-3">
        <FileText className="h-5 w-5 text-blue-600" />
        <div className="flex-1">
          <p className="text-sm font-medium">{file.name}</p>
          <p className="text-xs text-muted-foreground">
            {(file.size / 1024).toFixed(1)} KB
          </p>
        </div>
        <button
          onClick={clearFile}
          className="rounded-md p-1 hover:bg-muted transition-colors"
        >
          <X className="h-4 w-4 text-muted-foreground" />
        </button>
      </div>
    );
  }

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
      className={`rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
        dragOver
          ? "border-primary bg-primary/5"
          : "border-muted-foreground/25 hover:border-muted-foreground/50"
      }`}
    >
      <Upload className="h-8 w-8 mx-auto mb-3 text-muted-foreground" />
      <p className="text-sm font-medium mb-1">
        Drop your file here or{" "}
        <label className="text-primary cursor-pointer hover:underline">
          browse
          <input
            type="file"
            accept=".csv,.json,.jsonl"
            onChange={handleChange}
            className="hidden"
          />
        </label>
      </p>
      <p className="text-xs text-muted-foreground">
        CSV, JSON, or JSONL — max 100 items
      </p>
    </div>
  );
}
