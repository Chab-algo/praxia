"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { listAgents } from "@/lib/api";
import { Skeleton } from "@/components/skeleton";
import { EmptyState } from "@/components/empty-state";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Agent {
  id: string;
  name: string;
  description: string | null;
  status: string;
  recipe_slug: string | null;
  created_at: string;
}

export default function AgentsPage() {
  const { getToken, isLoaded } = useAuth();
  const router = useRouter();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);

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

  const getAgentType = (agent: Agent) => {
    return agent.recipe_slug ? "Recipe" : "Custom";
  };

  const getLastRun = () => {
    // TODO: Add last_run field to agent model
    return "Never";
  };

  if (loading) {
    return (
      <div>
        <Skeleton className="h-8 w-32 mb-6" />
        <Card padding="none">
          <div className="p-6 space-y-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-h1 mb-2">Your Agents</h2>
          <p className="text-body text-muted-foreground">
            Manage and test your AI agents
          </p>
        </div>
        <Button variant="accent" onClick={() => router.push("/dashboard/recipes")}>
          + New Agent
        </Button>
      </div>

      {agents.length === 0 ? (
        <EmptyState
          title="No agents yet"
          description="Create an AI agent from a recipe template to automate your workflows."
          action={{ label: "Browse Recipes", href: "/dashboard/recipes" }}
        />
      ) : (
        <Card padding="none">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Run</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {agents.map((agent) => (
                <TableRow
                  key={agent.id}
                  className="cursor-pointer"
                  onClick={() => router.push(`/dashboard/agents/${agent.id}`)}
                  tabIndex={0}
                  role="button"
                  aria-label={`View details for ${agent.name}`}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      router.push(`/dashboard/agents/${agent.id}`);
                    }
                  }}
                >
                  <TableCell className="font-medium">{agent.name}</TableCell>
                  <TableCell>
                    <span className="text-xs font-mono uppercase text-muted-foreground">
                      {getAgentType(agent)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={agent.status === "active" ? "active" : "draft"}
                      withDot
                      aria-label={`Status: ${agent.status}`}
                    >
                      {agent.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {getLastRun()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/dashboard/agents/${agent.id}`);
                        }}
                        className="text-sm text-praxia-accent hover:underline focus:outline-none focus:ring-2 focus:ring-praxia-accent focus:ring-offset-2 rounded px-1"
                        aria-label={`Test ${agent.name}`}
                      >
                        Test
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/dashboard/agents/${agent.id}/edit`);
                        }}
                        className="text-sm text-muted-foreground hover:text-foreground focus:outline-none focus:ring-2 focus:ring-praxia-accent focus:ring-offset-2 rounded px-1"
                        aria-label={`Edit ${agent.name}`}
                      >
                        Edit
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}
