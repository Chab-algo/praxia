"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { useParams, useRouter } from "next/navigation";
import { getClientOverview } from "@/lib/api";

interface ClientOverview {
  organization: {
    id: string;
    name: string;
    plan: string;
    created_at: string;
  };
  agents: Array<{
    id: string;
    name: string;
    status: string;
    recipe_slug: string | null;
    created_at: string;
  }>;
  executions: {
    total: number;
    successful: number;
    success_rate: number;
    total_cost_cents: number;
    last_execution_at: string | null;
  };
  health_score: {
    score: number;
    factors: {
      adoption: number;
      usage: number;
      success_rate: number;
      engagement: number;
      total: number;
    };
    recommendations: string[];
  };
}

export default function ClientDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { getToken, isLoaded } = useAuth();
  const [overview, setOverview] = useState<ClientOverview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoaded || !params.id) return;

    const load = async () => {
      try {
        const token = await getToken();
        if (!token) return;

        const data = await getClientOverview(token, params.id as string);
        setOverview(data);
      } catch (err) {
        console.error("Failed to load client overview:", err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [isLoaded, getToken, params.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!overview) {
    return <div className="text-center py-12">Client non trouvé</div>;
  }

  const healthColor =
    overview.health_score.score >= 80
      ? "text-green-600"
      : overview.health_score.score >= 60
      ? "text-yellow-600"
      : "text-red-600";

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="text-muted-foreground hover:text-foreground mb-4"
        >
          ← Retour
        </button>
        <h2 className="text-2xl font-bold">{overview.organization.name}</h2>
        <p className="text-muted-foreground">
          Plan: {overview.organization.plan} • Créé le{" "}
          {new Date(overview.organization.created_at).toLocaleDateString("fr-FR")}
        </p>
      </div>

      {/* Health Score */}
      <div className="mb-6 border rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Score de Santé</h3>
          <div className={`text-4xl font-bold ${healthColor}`}>
            {overview.health_score.score}/100
          </div>
        </div>
        <div className="grid grid-cols-4 gap-4 mb-4">
          <div>
            <div className="text-sm text-muted-foreground">Adoption</div>
            <div className="text-2xl font-bold">
              {overview.health_score.factors.adoption}
            </div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Usage</div>
            <div className="text-2xl font-bold">
              {overview.health_score.factors.usage}
            </div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Taux de Succès</div>
            <div className="text-2xl font-bold">
              {overview.health_score.factors.success_rate.toFixed(1)}
            </div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Engagement</div>
            <div className="text-2xl font-bold">
              {overview.health_score.factors.engagement}
            </div>
          </div>
        </div>
        {overview.health_score.recommendations.length > 0 && (
          <div className="mt-4 p-4 bg-muted rounded-lg">
            <div className="font-medium mb-2">Recommandations:</div>
            <ul className="list-disc list-inside space-y-1 text-sm">
              {overview.health_score.recommendations.map((rec, i) => (
                <li key={i}>{rec}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Agents */}
        <div className="border rounded-lg p-6">
          <h3 className="font-semibold mb-4">Agents ({overview.agents.length})</h3>
          {overview.agents.length === 0 ? (
            <p className="text-sm text-muted-foreground">Aucun agent créé</p>
          ) : (
            <div className="space-y-2">
              {overview.agents.map((agent) => (
                <div
                  key={agent.id}
                  className="p-3 bg-muted rounded-lg flex items-center justify-between"
                >
                  <div>
                    <div className="font-medium">{agent.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {agent.recipe_slug || "N/A"} • {agent.status}
                    </div>
                  </div>
                  <span
                    className={`px-2 py-1 text-xs rounded ${
                      agent.status === "active"
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {agent.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Executions */}
        <div className="border rounded-lg p-6">
          <h3 className="font-semibold mb-4">Exécutions</h3>
          <div className="space-y-4">
            <div>
              <div className="text-sm text-muted-foreground">Total</div>
              <div className="text-2xl font-bold">{overview.executions.total}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Réussies</div>
              <div className="text-2xl font-bold text-green-600">
                {overview.executions.successful}
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Taux de Succès</div>
              <div className="text-2xl font-bold">
                {overview.executions.success_rate.toFixed(1)}%
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Coût Total</div>
              <div className="text-2xl font-bold">
                ${(overview.executions.total_cost_cents / 100).toFixed(4)}
              </div>
            </div>
            {overview.executions.last_execution_at && (
              <div>
                <div className="text-sm text-muted-foreground">Dernière Exécution</div>
                <div className="text-sm font-medium">
                  {new Date(overview.executions.last_execution_at).toLocaleDateString("fr-FR")}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
