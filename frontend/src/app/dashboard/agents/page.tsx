"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { listAgents } from "@/lib/api";

interface Agent {
  id: string;
  name: string;
  description: string | null;
  status: string;
  recipe_slug: string | null;
  created_at: string;
}

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-gray-100 text-gray-700",
  active: "bg-green-100 text-green-700",
  paused: "bg-yellow-100 text-yellow-700",
  archived: "bg-red-100 text-red-700",
};

export default function AgentsPage() {
  const { getToken, isLoaded } = useAuth();
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

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Agents</h2>
        <a
          href="/dashboard/recipes"
          className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90"
        >
          + New from Recipe
        </a>
      </div>

      {agents.length === 0 ? (
        <div className="rounded-lg border p-8 text-center">
          <p className="text-muted-foreground mb-4">
            No agents yet. Create one from a recipe to get started.
          </p>
          <a
            href="/dashboard/recipes"
            className="text-primary hover:underline text-sm"
          >
            Browse Recipes &rarr;
          </a>
        </div>
      ) : (
        <div className="space-y-3">
          {agents.map((agent) => (
            <a
              key={agent.id}
              href={`/dashboard/agents/${agent.id}`}
              className="block rounded-lg border p-4 hover:border-primary hover:shadow-sm transition-all"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">{agent.name}</h3>
                  {agent.description && (
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {agent.description}
                    </p>
                  )}
                  <div className="flex gap-2 mt-2">
                    {agent.recipe_slug && (
                      <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs">
                        {agent.recipe_slug}
                      </span>
                    )}
                    <span className="text-xs text-muted-foreground">
                      Created{" "}
                      {new Date(agent.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    STATUS_COLORS[agent.status] || STATUS_COLORS.draft
                  }`}
                >
                  {agent.status}
                </span>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
