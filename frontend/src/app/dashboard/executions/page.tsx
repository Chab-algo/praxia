"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { listExecutions } from "@/lib/api";
import { Skeleton, TableRowSkeleton } from "@/components/skeleton";
import { EmptyState } from "@/components/empty-state";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  accordionItem,
  fadeInUp,
  fadeInScale,
  staggerContainer,
  layoutTransitionSmooth,
} from "@/lib/motion-premium";
import { ResultRenderer } from "@/components/result-renderer/ResultRenderer";
import {
  CheckCircle2,
  XCircle,
  Clock,
  ChevronDown,
  Zap,
  Database,
  Timer,
  User,
  DollarSign,
} from "lucide-react";

interface Execution {
  id: string;
  agent_id: string;
  recipe_slug: string | null;
  status: string;
  total_cost_cents: number;
  cache_hits: number;
  models_used: string[];
  duration_ms: number | null;
  triggered_by: string;
  created_at: string;
  output_data: any;
  error_data: any;
}

const STATUS_CONFIG: Record<
  string,
  { bg: string; text: string; icon: any; gradient: string }
> = {
  completed: {
    bg: "bg-green-500/10",
    text: "text-green-600 dark:text-green-400",
    icon: CheckCircle2,
    gradient: "from-green-500/10 to-green-500/5",
  },
  failed: {
    bg: "bg-red-500/10",
    text: "text-red-600 dark:text-red-400",
    icon: XCircle,
    gradient: "from-red-500/10 to-red-500/5",
  },
  running: {
    bg: "bg-blue-500/10",
    text: "text-blue-600 dark:text-blue-400",
    icon: Clock,
    gradient: "from-blue-500/10 to-blue-500/5",
  },
  pending: {
    bg: "bg-gray-500/10",
    text: "text-gray-600 dark:text-gray-400",
    icon: Clock,
    gradient: "from-gray-500/10 to-gray-500/5",
  },
};

export default function ExecutionsPage() {
  const { getToken, isLoaded } = useAuth();
  const shouldReduceMotion = useReducedMotion();
  const [executions, setExecutions] = useState<Execution[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoaded) return;
    const load = async () => {
      try {
        const token = await getToken();
        if (token) {
          const data = await listExecutions(token);
          setExecutions(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [isLoaded, getToken]);

  if (loading) {
    return (
      <div>
        <Skeleton className="h-10 w-48 mb-8" />
        <div className="space-y-3">
          <TableRowSkeleton cols={4} />
          <TableRowSkeleton cols={4} />
          <TableRowSkeleton cols={4} />
          <TableRowSkeleton cols={4} />
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <motion.div
        className="mb-8"
        variants={fadeInUp}
        initial={shouldReduceMotion ? false : "initial"}
        animate={shouldReduceMotion ? false : "animate"}
      >
        <h2 className="text-3xl font-bold mb-2 gradient-text">Executions</h2>
        <p className="text-sm text-muted-foreground">
          View detailed execution logs and results
        </p>
      </motion.div>

      {executions.length === 0 ? (
        <motion.div
          variants={fadeInScale}
          initial={shouldReduceMotion ? false : "initial"}
          animate={shouldReduceMotion ? false : "animate"}
        >
          <EmptyState
            title="No executions yet"
            description="Run an agent to see execution results and analytics here."
            action={{ label: "Browse Agents", href: "/dashboard/agents" }}
          />
        </motion.div>
      ) : (
        <motion.div
          className="space-y-3"
          variants={staggerContainer}
          initial={shouldReduceMotion ? false : "initial"}
          animate={shouldReduceMotion ? false : "animate"}
        >
          {executions.map((exec) => {
            const statusConfig =
              STATUS_CONFIG[exec.status] || STATUS_CONFIG.pending;
            const StatusIcon = statusConfig.icon;
            const isExpanded = expanded === exec.id;

            return (
              <motion.div
                key={exec.id}
                className="glass-card rounded-xl overflow-hidden"
                variants={fadeInScale}
                layout
                transition={layoutTransitionSmooth}
              >
                <motion.button
                  onClick={() =>
                    setExpanded(isExpanded ? null : exec.id)
                  }
                  className="w-full p-5 text-left hover:bg-muted/30 transition-colors"
                  whileHover={shouldReduceMotion ? {} : { backgroundColor: "rgba(var(--muted) / 0.3)" }}
                >
                  <div className="flex items-center justify-between">
                    {/* Left: Status + ID */}
                    <div className="flex items-center gap-4">
                      <div
                        className={`flex items-center gap-2 rounded-full px-3 py-1.5 ${statusConfig.bg} ${statusConfig.text}`}
                      >
                        <StatusIcon className="w-4 h-4" />
                        <span className="text-sm font-medium capitalize">
                          {exec.status}
                        </span>
                      </div>
                      <span className="text-sm font-mono text-muted-foreground">
                        {exec.id.slice(0, 8)}...
                      </span>
                    </div>

                    {/* Right: Metrics + Chevron */}
                    <div className="flex items-center gap-6">
                      <div className="hidden sm:flex items-center gap-4 text-xs text-muted-foreground">
                        {exec.duration_ms && (
                          <div className="flex items-center gap-1.5">
                            <Timer className="w-3.5 h-3.5" />
                            <span>{exec.duration_ms}ms</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1.5">
                          <DollarSign className="w-3.5 h-3.5" />
                          <span>
                            ${(exec.total_cost_cents / 100).toFixed(6)}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5" />
                          <span>
                            {new Date(exec.created_at).toLocaleDateString(
                              "en-US",
                              { month: "short", day: "numeric" }
                            )}
                          </span>
                        </div>
                      </div>
                      <motion.div
                        animate={{ rotate: isExpanded ? 180 : 0 }}
                        transition={{
                          type: "spring",
                          stiffness: 300,
                          damping: 30,
                        }}
                      >
                        <ChevronDown className="w-5 h-5 text-muted-foreground" />
                      </motion.div>
                    </div>
                  </div>
                </motion.button>

                {/* Expanded content with layout animation */}
                <AnimatePresence initial={false}>
                  {isExpanded && (
                    <motion.div
                      variants={accordionItem}
                      initial="collapsed"
                      animate="expanded"
                      exit="collapsed"
                      className="border-t border-border/50"
                    >
                      <div className="p-5 bg-muted/20">
                        {/* Metrics grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Zap className="w-3.5 h-3.5" />
                              <span>Models</span>
                            </div>
                            <p className="text-sm font-medium">
                              {exec.models_used?.join(", ") || "—"}
                            </p>
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Database className="w-3.5 h-3.5" />
                              <span>Cache Hits</span>
                            </div>
                            <p className="text-sm font-medium">{exec.cache_hits}</p>
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Timer className="w-3.5 h-3.5" />
                              <span>Duration</span>
                            </div>
                            <p className="text-sm font-medium">
                              {exec.duration_ms ? `${exec.duration_ms}ms` : "—"}
                            </p>
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <User className="w-3.5 h-3.5" />
                              <span>Triggered</span>
                            </div>
                            <p className="text-sm font-medium capitalize">
                              {exec.triggered_by}
                            </p>
                          </div>
                        </div>

                        {/* Output */}
                        {exec.output_data && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                          >
                            <div className="mb-2 flex items-center gap-2">
                              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
                              <span className="text-xs font-medium text-muted-foreground">
                                OUTPUT
                              </span>
                              <div className="h-px flex-1 bg-gradient-to-r from-border via-transparent to-transparent" />
                            </div>
                            <div className="glass-card rounded-lg p-4">
                              <ResultRenderer
                                outputData={exec.output_data}
                                recipeSlug={exec.recipe_slug}
                              />
                            </div>
                          </motion.div>
                        )}

                        {/* Error */}
                        {exec.error_data && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="mt-4"
                          >
                            <div className="flex items-center gap-2 mb-2">
                              <XCircle className="w-4 h-4 text-red-500" />
                              <span className="text-sm font-medium text-red-600 dark:text-red-400">
                                Error Details
                              </span>
                            </div>
                            <pre className="rounded-lg bg-red-500/10 border border-red-500/20 p-4 text-xs font-mono text-red-600 dark:text-red-400 overflow-x-auto">
                              {JSON.stringify(exec.error_data, null, 2)}
                            </pre>
                          </motion.div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </motion.div>
  );
}
