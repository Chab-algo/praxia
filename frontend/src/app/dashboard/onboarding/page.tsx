"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { listRecipes, createAgent, createExecution } from "@/lib/api";

interface Recipe {
  slug: string;
  name: string;
  description: string;
  category: string;
  estimated_cost_per_run: number | null;
  roi_metrics: { time_saved?: string; cost_saved?: string; use_case?: string };
  input_schema: { properties?: Record<string, { type: string; description?: string; enum?: string[]; default?: string }> };
}

const CATEGORY_COLORS: Record<string, string> = {
  ecommerce: "bg-blue-100 text-blue-800",
  hr: "bg-green-100 text-green-800",
  finance: "bg-purple-100 text-purple-800",
  marketing: "bg-orange-100 text-orange-800",
  support: "bg-teal-100 text-teal-800",
};

export default function OnboardingPage() {
  const router = useRouter();
  const { getToken, isLoaded } = useAuth();
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [agentName, setAgentName] = useState("");
  const [createdAgent, setCreatedAgent] = useState<{ id: string; name: string } | null>(null);
  const [testInputs, setTestInputs] = useState<Record<string, string>>({});
  const [testResult, setTestResult] = useState<{ output_data?: Record<string, unknown>; steps?: { step_name: string; model_used: string | null; cost_cents: number; duration_ms: number | null }[] } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listRecipes().then(setRecipes).catch(console.error);
  }, []);

  // Step 2: When recipe is selected, prefill agent name and test inputs
  useEffect(() => {
    if (selectedRecipe) {
      setAgentName(`Mon ${selectedRecipe.name}`);
      const defaults: Record<string, string> = {};
      const props = selectedRecipe.input_schema?.properties || {};
      for (const [key, val] of Object.entries(props)) {
        defaults[key] = (val.default as string) || "";
      }
      setTestInputs(defaults);
    }
  }, [selectedRecipe]);

  const handleCreateAgent = async () => {
    if (!selectedRecipe || !agentName.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const token = await getToken();
      if (!token) throw new Error("Non authentifie");
      const agent = await createAgent(token, {
        name: agentName.trim(),
        recipe_slug: selectedRecipe.slug,
      });
      setCreatedAgent(agent);
      setStep(4);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de la creation");
    } finally {
      setLoading(false);
    }
  };

  const handleTestAgent = async () => {
    if (!createdAgent) return;
    setLoading(true);
    setError(null);
    setTestResult(null);
    try {
      const token = await getToken();
      if (!token) throw new Error("Non authentifie");
      const result = await createExecution(token, {
        agent_id: createdAgent.id,
        input_data: testInputs,
      });
      setTestResult(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors du test");
    } finally {
      setLoading(false);
    }
  };

  const handleFinish = () => {
    localStorage.setItem("praxia_onboarded", "true");
    router.push("/dashboard");
  };

  return (
    <div className="max-w-3xl mx-auto py-8">
      {/* Progress bar */}
      <div className="flex items-center justify-center gap-2 mb-10">
        {([1, 2, 3, 4, 5] as const).map((s) => (
          <div
            key={s}
            className={`h-2 w-14 rounded-full transition-colors ${
              s <= step ? "bg-primary" : "bg-muted"
            }`}
          />
        ))}
      </div>

      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Step 1: Welcome */}
      {step === 1 && (
        <div className="text-center py-12">
          <h2 className="text-3xl font-bold mb-4">Bienvenue sur PraxIA</h2>
          <p className="text-lg text-muted-foreground mb-2">
            Votre studio d&apos;agents IA pour automatiser les taches metier.
          </p>
          <p className="text-muted-foreground mb-8">
            En quelques etapes, vous allez creer et tester votre premier agent IA.
          </p>
          <button
            onClick={() => setStep(2)}
            className="rounded-md bg-primary px-8 py-3 text-primary-foreground font-medium hover:bg-primary/90"
          >
            Commencer
          </button>
        </div>
      )}

      {/* Step 2: Choose Recipe or Builder */}
      {step === 2 && (
        <div>
          <h2 className="text-2xl font-bold mb-2">Créez votre agent</h2>
          <p className="text-muted-foreground mb-6">
            Choisissez une recipe prédéfinie ou créez votre propre agent avec l'Assistant IA.
          </p>
          
          {/* Option: Recipe Builder */}
          <div className="mb-6 p-6 border-2 border-primary rounded-lg bg-primary/5">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-lg">Assistant IA - Créer une Recipe Personnalisée</h3>
              <span className="px-2 py-1 text-xs bg-primary text-primary-foreground rounded">Nouveau</span>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Décrivez votre besoin métier en langage naturel et notre IA générera une recipe complète pour vous.
            </p>
            <button
              onClick={() => router.push("/dashboard/recipes/builder")}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 font-medium"
            >
              Utiliser l'Assistant IA
            </button>
          </div>

          <div className="mb-4">
            <h3 className="font-semibold mb-4">Ou choisissez une Recipe prédéfinie</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {recipes.map((recipe) => (
              <button
                key={recipe.slug}
                onClick={() => setSelectedRecipe(recipe)}
                className={`rounded-lg border p-5 text-left transition-all ${
                  selectedRecipe?.slug === recipe.slug
                    ? "border-primary ring-2 ring-primary/20"
                    : "hover:border-primary/50"
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-semibold">{recipe.name}</h3>
                  <span
                    className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                      CATEGORY_COLORS[recipe.category] || "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {recipe.category}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mb-3">{recipe.description}</p>
                {recipe.estimated_cost_per_run && (
                  <p className="text-xs text-muted-foreground">
                    ~${recipe.estimated_cost_per_run.toFixed(4)} / execution
                  </p>
                )}
              </button>
            ))}
          </div>
          <div className="flex justify-between">
            <button
              onClick={() => setStep(1)}
              className="rounded-md border px-6 py-2.5 text-sm font-medium hover:bg-accent"
            >
              Retour
            </button>
            <button
              onClick={() => selectedRecipe && setStep(3)}
              disabled={!selectedRecipe}
              className="rounded-md bg-primary px-6 py-2.5 text-sm text-primary-foreground font-medium hover:bg-primary/90 disabled:opacity-50"
            >
              Suivant
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Create Agent */}
      {step === 3 && selectedRecipe && (
        <div>
          <h2 className="text-2xl font-bold mb-2">Creez votre agent</h2>
          <p className="text-muted-foreground mb-6">
            Donnez un nom a votre agent base sur <strong>{selectedRecipe.name}</strong>.
          </p>
          <div className="rounded-lg border p-6 mb-6">
            <label className="block text-sm font-medium mb-2">
              Nom de l&apos;agent
            </label>
            <input
              type="text"
              value={agentName}
              onChange={(e) => setAgentName(e.target.value)}
              className="w-full rounded-md border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Ex: Mon Review Responder"
            />
            <p className="mt-2 text-xs text-muted-foreground">
              Recipe: {selectedRecipe.name} ({selectedRecipe.category})
            </p>
          </div>
          <div className="flex justify-between">
            <button
              onClick={() => setStep(2)}
              className="rounded-md border px-6 py-2.5 text-sm font-medium hover:bg-accent"
            >
              Retour
            </button>
            <button
              onClick={handleCreateAgent}
              disabled={loading || !agentName.trim()}
              className="rounded-md bg-primary px-6 py-2.5 text-sm text-primary-foreground font-medium hover:bg-primary/90 disabled:opacity-50"
            >
              {loading ? "Creation..." : "Creer l'agent"}
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Test Agent */}
      {step === 4 && selectedRecipe && createdAgent && (
        <div>
          <h2 className="text-2xl font-bold mb-2">Testez votre agent</h2>
          <p className="text-muted-foreground mb-6">
            Remplissez les champs ci-dessous pour lancer un test de <strong>{createdAgent.name}</strong>.
          </p>
          <div className="rounded-lg border p-6 mb-6 space-y-4">
            {Object.entries(selectedRecipe.input_schema?.properties || {}).map(
              ([key, field]) => (
                <div key={key}>
                  <label className="block text-sm font-medium mb-1.5">
                    {key.replace(/_/g, " ")}
                    {(selectedRecipe.input_schema as { required?: string[] })?.required?.includes(key) && (
                      <span className="text-red-500 ml-1">*</span>
                    )}
                  </label>
                  {field.enum ? (
                    <select
                      value={testInputs[key] || field.default || ""}
                      onChange={(e) =>
                        setTestInputs((p) => ({ ...p, [key]: e.target.value }))
                      }
                      className="w-full rounded-md border px-3 py-2 text-sm"
                    >
                      {field.enum.map((opt: string) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  ) : field.type === "string" ? (
                    <textarea
                      value={testInputs[key] || ""}
                      onChange={(e) =>
                        setTestInputs((p) => ({ ...p, [key]: e.target.value }))
                      }
                      rows={3}
                      className="w-full rounded-md border px-3 py-2 text-sm"
                      placeholder={field.description}
                    />
                  ) : (
                    <input
                      type={field.type === "integer" || field.type === "number" ? "number" : "text"}
                      value={testInputs[key] || ""}
                      onChange={(e) =>
                        setTestInputs((p) => ({ ...p, [key]: e.target.value }))
                      }
                      className="w-full rounded-md border px-3 py-2 text-sm"
                      placeholder={field.description}
                    />
                  )}
                </div>
              )
            )}
          </div>

          <button
            onClick={handleTestAgent}
            disabled={loading}
            className="w-full rounded-md bg-primary px-6 py-3 text-sm text-primary-foreground font-medium hover:bg-primary/90 disabled:opacity-50 mb-6"
          >
            {loading ? "Execution en cours..." : "Lancer le test"}
          </button>

          {testResult && (
            <div className="rounded-lg border p-6 mb-6">
              <h4 className="font-semibold text-green-700 mb-3">Resultat</h4>
              {testResult.output_data && (
                <pre className="bg-muted p-4 rounded text-xs overflow-auto max-h-64 mb-4">
                  {JSON.stringify(testResult.output_data, null, 2)}
                </pre>
              )}
              {testResult.steps && testResult.steps.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-2">
                    Steps ({testResult.steps.length}):
                  </p>
                  <div className="space-y-1">
                    {testResult.steps.map((s, i) => (
                      <div
                        key={i}
                        className="flex justify-between text-xs bg-muted/50 rounded px-3 py-1.5"
                      >
                        <span>{s.step_name}</span>
                        <span className="text-muted-foreground">
                          {s.model_used || "transform"} ·{" "}
                          {s.duration_ms}ms ·{" "}
                          ${(s.cost_cents / 100).toFixed(6)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="flex justify-between">
            <button
              onClick={() => {
                setStep(3);
                setTestResult(null);
              }}
              className="rounded-md border px-6 py-2.5 text-sm font-medium hover:bg-accent"
            >
              Retour
            </button>
            <button
              onClick={() => setStep(5)}
              disabled={!testResult}
              className="rounded-md bg-primary px-6 py-2.5 text-sm text-primary-foreground font-medium hover:bg-primary/90 disabled:opacity-50"
            >
              Suivant
            </button>
          </div>
        </div>
      )}

      {/* Step 5: Success */}
      {step === 5 && (
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 text-green-600 text-3xl mb-6">
            &#10003;
          </div>
          <h2 className="text-3xl font-bold mb-4">
            Votre premier agent est pret !
          </h2>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            Vous pouvez maintenant explorer le dashboard, creer d&apos;autres agents,
            ou consulter vos analytics.
          </p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={handleFinish}
              className="rounded-md bg-primary px-6 py-2.5 text-primary-foreground font-medium hover:bg-primary/90"
            >
              Aller au Dashboard
            </button>
            <a
              href="/dashboard/analytics"
              onClick={() => localStorage.setItem("praxia_onboarded", "true")}
              className="rounded-md border px-6 py-2.5 font-medium hover:bg-accent"
            >
              Voir les Analytics
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
