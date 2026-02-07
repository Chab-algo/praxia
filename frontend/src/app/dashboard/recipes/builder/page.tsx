"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { generateRecipe, validateRecipe, createCustomRecipe, createAgent } from "@/lib/api";

const DOMAINS = [
  { value: "ecommerce", label: "E-commerce" },
  { value: "hr", label: "Ressources Humaines" },
  { value: "finance", label: "Finance" },
  { value: "marketing", label: "Marketing" },
  { value: "support", label: "Support Client" },
  { value: "general", label: "Général" },
];

export default function RecipeBuilderPage() {
  const router = useRouter();
  const { getToken, isLoaded } = useAuth();
  const [mode, setMode] = useState<"assistant" | "visual">("assistant");
  const [requirement, setRequirement] = useState("");
  const [domain, setDomain] = useState("general");
  const [generatedRecipe, setGeneratedRecipe] = useState<any>(null);
  const [validation, setValidation] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const handleGenerate = async () => {
    if (!requirement.trim()) {
      setError("Veuillez décrire votre besoin métier");
      return;
    }

    setLoading(true);
    setError(null);
    setGeneratedRecipe(null);
    setValidation(null);

    try {
      const token = await getToken();
      if (!token) throw new Error("Non authentifié");

      const result = await generateRecipe(token, {
        requirement: requirement.trim(),
        domain,
      });

      setGeneratedRecipe(result.recipe);

      // Validate automatically
      const validationResult = await validateRecipe(token, result.recipe);
      setValidation(validationResult);
    } catch (err: any) {
      setError(err.message || "Erreur lors de la génération");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveRecipe = async () => {
    if (!generatedRecipe) return;

    setSaving(true);
    setError(null);

    try {
      const token = await getToken();
      if (!token) throw new Error("Non authentifié");

      await createCustomRecipe(token, generatedRecipe);
      router.push("/dashboard/recipes");
    } catch (err: any) {
      setError(err.message || "Erreur lors de la sauvegarde");
    } finally {
      setSaving(false);
    }
  };

  const handleCreateAgent = async () => {
    if (!generatedRecipe) return;

    setSaving(true);
    setError(null);

    try {
      const token = await getToken();
      if (!token) throw new Error("Non authentifié");

      // First save the recipe
      const savedRecipe = await createCustomRecipe(token, generatedRecipe);

      // Then create an agent from it
      await createAgent(token, {
        name: generatedRecipe.name || "Mon Agent",
        recipe_slug: savedRecipe.slug,
        description: generatedRecipe.description,
      });

      router.push("/dashboard/agents");
    } catch (err: any) {
      setError(err.message || "Erreur lors de la création");
    } finally {
      setSaving(false);
    }
  };

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Créer une Recipe</h1>

      {/* Mode selector */}
      <div className="mb-6 flex gap-2 border-b">
        <button
          onClick={() => setMode("assistant")}
          className={`px-4 py-2 font-medium ${
            mode === "assistant"
              ? "border-b-2 border-primary text-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Assistant IA
        </button>
        <button
          onClick={() => setMode("visual")}
          className={`px-4 py-2 font-medium ${
            mode === "visual"
              ? "border-b-2 border-primary text-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
          disabled
        >
          Éditeur Visuel (Bientôt)
        </button>
      </div>

      {/* Mode Assistant IA */}
      {mode === "assistant" && (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">
              Domaine métier
            </label>
            <select
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              className="w-full p-2 border rounded-lg"
            >
              {DOMAINS.map((d) => (
                <option key={d.value} value={d.value}>
                  {d.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Décrivez votre besoin métier
            </label>
            <textarea
              value={requirement}
              onChange={(e) => setRequirement(e.target.value)}
              placeholder="Ex: Je veux un agent qui analyse les avis clients et génère des réponses personnalisées selon le sentiment..."
              className="w-full p-3 border rounded-lg min-h-[150px]"
              rows={6}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Décrivez en langage naturel ce que vous voulez que votre agent fasse
            </p>
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading || !requirement.trim()}
            className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Génération en cours..." : "Générer la Recipe"}
          </button>

          {error && (
            <div className="p-4 bg-destructive/10 text-destructive rounded-lg">
              {error}
            </div>
          )}

          {generatedRecipe && (
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <h3 className="font-semibold mb-2">Recipe générée : {generatedRecipe.name}</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {generatedRecipe.description}
                </p>

                {validation && (
                  <div className="mb-4">
                    {validation.errors.length > 0 && (
                      <div className="mb-2 p-2 bg-destructive/10 text-destructive rounded text-sm">
                        <strong>Erreurs :</strong>
                        <ul className="list-disc list-inside mt-1">
                          {validation.errors.map((e: string, i: number) => (
                            <li key={i}>{e}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {validation.warnings.length > 0 && (
                      <div className="mb-2 p-2 bg-yellow-100 text-yellow-800 rounded text-sm">
                        <strong>Avertissements :</strong>
                        <ul className="list-disc list-inside mt-1">
                          {validation.warnings.map((w: string, i: number) => (
                            <li key={i}>{w}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {validation.suggestions.length > 0 && (
                      <div className="mb-2 p-2 bg-blue-100 text-blue-800 rounded text-sm">
                        <strong>Suggestions :</strong>
                        <ul className="list-disc list-inside mt-1">
                          {validation.suggestions.map((s: string, i: number) => (
                            <li key={i}>{s}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {validation.valid && (
                      <div className="p-2 bg-green-100 text-green-800 rounded text-sm">
                        ✓ Recipe valide
                      </div>
                    )}
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={handleSaveRecipe}
                    disabled={saving || (validation && !validation.valid)}
                    className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 disabled:opacity-50"
                  >
                    {saving ? "Sauvegarde..." : "Sauvegarder la Recipe"}
                  </button>
                  <button
                    onClick={handleCreateAgent}
                    disabled={saving || (validation && !validation.valid)}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50"
                  >
                    {saving ? "Création..." : "Créer un Agent"}
                  </button>
                </div>
              </div>

              {/* Recipe preview */}
              <details className="border rounded-lg">
                <summary className="p-4 cursor-pointer font-medium">
                  Voir les détails de la recipe
                </summary>
                <div className="p-4 border-t">
                  <pre className="text-xs overflow-auto bg-muted p-4 rounded">
                    {JSON.stringify(generatedRecipe, null, 2)}
                  </pre>
                </div>
              </details>
            </div>
          )}
        </div>
      )}

      {/* Mode Éditeur Visuel - Coming soon */}
      {mode === "visual" && (
        <div className="text-center py-12 text-muted-foreground">
          <p>L'éditeur visuel sera disponible prochainement.</p>
        </div>
      )}
    </div>
  );
}
