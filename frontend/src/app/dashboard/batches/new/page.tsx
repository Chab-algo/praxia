"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { listAgents, getRecipe, createBatch } from "@/lib/api";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { fadeUp } from "@/lib/motion";
import { FileUploader, type ParsedFile } from "@/components/batch/FileUploader";
import { ColumnMapper } from "@/components/batch/ColumnMapper";
import { ChevronRight, Check } from "lucide-react";

interface Agent {
  id: string;
  name: string;
  description: string | null;
  recipe_slug: string | null;
}

interface SchemaField {
  name: string;
  type: string;
  required: boolean;
}

const STEPS = [
  { label: "Select Agent", description: "Choose the agent to process your batch" },
  { label: "Upload File", description: "Upload a CSV, JSON, or JSONL file" },
  { label: "Map Columns", description: "Map your file columns to recipe fields" },
  { label: "Confirm", description: "Review and launch the batch" },
];

export default function NewBatchPage() {
  const { getToken, isLoaded } = useAuth();
  const router = useRouter();
  const shouldReduceMotion = useReducedMotion();

  const [step, setStep] = useState(0);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Step 1: Agent selection
  const [selectedAgentId, setSelectedAgentId] = useState<string>("");
  const [schemaFields, setSchemaFields] = useState<SchemaField[]>([]);

  // Step 2: File upload
  const [parsedFile, setParsedFile] = useState<ParsedFile | null>(null);

  // Step 3: Column mapping
  const [mapping, setMapping] = useState<Record<string, string>>({});

  // Load agents
  useEffect(() => {
    if (!isLoaded) return;
    const load = async () => {
      try {
        const token = await getToken();
        if (token) {
          const data = await listAgents(token);
          setAgents(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [isLoaded, getToken]);

  // Load recipe schema when agent changes
  useEffect(() => {
    const agent = agents.find((a) => a.id === selectedAgentId);
    if (!agent?.recipe_slug) {
      setSchemaFields([]);
      return;
    }

    const loadRecipe = async () => {
      try {
        const token = await getToken();
        const recipe = await getRecipe(agent.recipe_slug!, token || undefined);
        if (recipe.input_schema?.properties) {
          const fields: SchemaField[] = Object.entries(
            recipe.input_schema.properties as Record<string, any>
          ).map(([name, schema]: [string, any]) => ({
            name,
            type: schema.type || "string",
            required: recipe.input_schema.required?.includes(name) ?? false,
          }));
          setSchemaFields(fields);
        } else {
          setSchemaFields([]);
        }
      } catch {
        setSchemaFields([]);
      }
    };
    loadRecipe();
  }, [selectedAgentId, agents, getToken]);

  const selectedAgent = agents.find((a) => a.id === selectedAgentId);

  // Determine if column mapping step is needed (only for CSV)
  const needsMapping = parsedFile?.fileType === "csv" && schemaFields.length > 0;

  // Build final items from parsed data + mapping
  function buildItems(): Record<string, unknown>[] {
    if (!parsedFile) return [];

    if (parsedFile.fileType !== "csv" || schemaFields.length === 0) {
      // JSON/JSONL: rows are already keyed correctly
      return parsedFile.rows;
    }

    // CSV with mapping: remap columns
    return parsedFile.rows.map((row) => {
      const mapped: Record<string, unknown> = {};
      for (const [fieldName, headerName] of Object.entries(mapping)) {
        mapped[fieldName] = row[headerName] ?? "";
      }
      return mapped;
    });
  }

  // Validate current step before advancing
  function canAdvance(): boolean {
    switch (step) {
      case 0:
        return !!selectedAgentId;
      case 1:
        return !!parsedFile;
      case 2:
        if (!needsMapping) return true;
        // All required fields must be mapped
        return schemaFields
          .filter((f) => f.required)
          .every((f) => mapping[f.name]);
      default:
        return true;
    }
  }

  function handleNext() {
    if (!canAdvance()) return;

    // Skip mapping step if not needed
    if (step === 1 && !needsMapping) {
      setStep(3);
    } else {
      setStep(step + 1);
    }
  }

  function handleBack() {
    if (step === 3 && !needsMapping) {
      setStep(1);
    } else {
      setStep(step - 1);
    }
  }

  async function handleSubmit() {
    if (submitting) return;
    setSubmitting(true);
    setError(null);

    try {
      const token = await getToken();
      if (!token) throw new Error("Not authenticated");

      const items = buildItems();
      const result = await createBatch(token, {
        agent_id: selectedAgentId,
        name: parsedFile?.fileName || "Untitled batch",
        items,
        file_type: parsedFile?.fileType,
      });

      router.push(`/dashboard/batches/${result.id}`);
    } catch (err: any) {
      setError(err.message || "Failed to create batch");
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  const items = buildItems();

  return (
    <div className="max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">New Batch</h2>

      {/* Stepper */}
      <div className="flex items-center mb-8">
        {STEPS.map((s, i) => {
          // Skip mapping step indicator if not needed
          if (i === 2 && !needsMapping && parsedFile) return null;

          const isActive = i === step;
          const isDone = i < step || (i === 2 && step === 3 && !needsMapping);

          return (
            <div key={i} className="flex items-center">
              {i > 0 && !(i === 2 && !needsMapping && parsedFile) && (
                <ChevronRight className="h-4 w-4 mx-2 text-muted-foreground" />
              )}
              <div
                className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : isDone
                    ? "bg-green-100 text-green-700"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {isDone ? <Check className="h-3 w-3" /> : <span>{i + 1}</span>}
                <span className="hidden sm:inline">{s.label}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Step Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          variants={fadeUp}
          initial={shouldReduceMotion ? false : "initial"}
          animate={shouldReduceMotion ? false : "animate"}
          exit={shouldReduceMotion ? undefined : "exit"}
        >
          {/* Step 0: Select Agent */}
          {step === 0 && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">{STEPS[0].description}</p>
              <div className="space-y-2">
                {agents.length === 0 ? (
                  <div className="rounded-lg border p-6 text-center text-muted-foreground">
                    <p className="mb-2">No agents found.</p>
                    <a href="/dashboard/recipes" className="text-primary hover:underline text-sm">
                      Create an agent first &rarr;
                    </a>
                  </div>
                ) : (
                  agents.map((agent) => (
                    <button
                      key={agent.id}
                      onClick={() => setSelectedAgentId(agent.id)}
                      className={`w-full text-left rounded-lg border p-4 transition-all ${
                        selectedAgentId === agent.id
                          ? "border-primary bg-primary/5 shadow-sm"
                          : "hover:border-muted-foreground/50"
                      }`}
                    >
                      <div className="font-medium">{agent.name}</div>
                      {agent.description && (
                        <p className="text-sm text-muted-foreground mt-0.5">
                          {agent.description}
                        </p>
                      )}
                      {agent.recipe_slug && (
                        <span className="rounded-full bg-muted px-2 py-0.5 text-xs mt-2 inline-block">
                          {agent.recipe_slug}
                        </span>
                      )}
                    </button>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Step 1: Upload File */}
          {step === 1 && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">{STEPS[1].description}</p>
              <FileUploader
                onFileParsed={(result) => {
                  setParsedFile(result);
                  setError(null);
                }}
                onError={(msg) => setError(msg)}
              />
              {parsedFile && (
                <div className="rounded-lg bg-muted/50 p-3 text-sm">
                  <span className="font-medium">{parsedFile.rows.length}</span> items detected
                  &bull; Format: <span className="font-medium uppercase">{parsedFile.fileType}</span>
                  &bull; <span className="font-medium">{parsedFile.headers.length}</span> columns
                </div>
              )}
            </div>
          )}

          {/* Step 2: Column Mapping (CSV only) */}
          {step === 2 && needsMapping && parsedFile && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">{STEPS[2].description}</p>
              <ColumnMapper
                headers={parsedFile.headers}
                schemaFields={schemaFields}
                rows={parsedFile.rows}
                onMappingChange={setMapping}
              />
            </div>
          )}

          {/* Step 3: Confirmation */}
          {step === 3 && (
            <div className="space-y-6">
              <p className="text-sm text-muted-foreground">{STEPS[3].description}</p>

              <div className="rounded-lg border divide-y">
                <div className="flex justify-between p-4">
                  <span className="text-sm text-muted-foreground">Agent</span>
                  <span className="text-sm font-medium">{selectedAgent?.name}</span>
                </div>
                <div className="flex justify-between p-4">
                  <span className="text-sm text-muted-foreground">Recipe</span>
                  <span className="text-sm font-medium">
                    {selectedAgent?.recipe_slug || "—"}
                  </span>
                </div>
                <div className="flex justify-between p-4">
                  <span className="text-sm text-muted-foreground">File</span>
                  <span className="text-sm font-medium">{parsedFile?.fileName}</span>
                </div>
                <div className="flex justify-between p-4">
                  <span className="text-sm text-muted-foreground">Items</span>
                  <span className="text-sm font-medium">{items.length}</span>
                </div>
                <div className="flex justify-between p-4">
                  <span className="text-sm text-muted-foreground">Format</span>
                  <span className="text-sm font-medium uppercase">
                    {parsedFile?.fileType}
                  </span>
                </div>
              </div>

              {/* Preview first 3 items */}
              {items.length > 0 && (
                <div>
                  <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                    Preview (first {Math.min(3, items.length)} items)
                  </h4>
                  <div className="overflow-x-auto rounded-lg border">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b bg-muted/50">
                          <th className="px-3 py-2 text-left font-medium text-muted-foreground">#</th>
                          {Object.keys(items[0]).map((key) => (
                            <th
                              key={key}
                              className="px-3 py-2 text-left font-medium text-muted-foreground"
                            >
                              {key}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {items.slice(0, 3).map((item, i) => (
                          <tr key={i} className="border-b last:border-0">
                            <td className="px-3 py-2 text-xs text-muted-foreground">{i + 1}</td>
                            {Object.values(item).map((val, j) => (
                              <td key={j} className="px-3 py-2 text-xs max-w-[200px] truncate">
                                {typeof val === "object" ? JSON.stringify(val) : String(val ?? "")}
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
          )}
        </motion.div>
      </AnimatePresence>

      {/* Error */}
      {error && (
        <div className="mt-4 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between mt-8">
        <button
          onClick={handleBack}
          disabled={step === 0}
          className="rounded-md border px-4 py-2 text-sm disabled:opacity-50 hover:bg-muted transition-colors"
        >
          Back
        </button>

        {step < 3 ? (
          <button
            onClick={handleNext}
            disabled={!canAdvance()}
            className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            Continue
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="rounded-md bg-primary px-6 py-2 text-sm text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            {submitting ? "Launching..." : "Launch Batch"}
          </button>
        )}
      </div>
    </div>
  );
}
