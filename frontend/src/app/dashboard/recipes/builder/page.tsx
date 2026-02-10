"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { generateRecipe, validateRecipe, createCustomRecipe, createAgent, getRecipe } from "@/lib/api";
import { VisualRecipeEditor } from "@/components/recipe-editor/VisualRecipeEditor";
import { recipeToVisual, visualToRecipe, validateVisualRecipe } from "@/lib/recipe-converter";
import { VisualRecipe, RecipeDetail } from "@/types/recipe-editor";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { fadeUp, staggerContainer, cardHover } from "@/lib/motion";

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
  const shouldReduceMotion = useReducedMotion();
  const [mode, setMode] = useState<"assistant" | "visual">("assistant");
  const [requirement, setRequirement] = useState("");
  const [domain, setDomain] = useState("general");
  const [generatedRecipe, setGeneratedRecipe] = useState<any>(null);
  const [validation, setValidation] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  
  // Visual editor state
  const [visualRecipe, setVisualRecipe] = useState<VisualRecipe | null>(null);
  const [visualValidation, setVisualValidation] = useState<{ valid: boolean; errors: string[]; warnings: string[] } | null>(null);

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
      // Redirect to "Mes Recipes" tab with a success parameter
      router.push("/dashboard/recipes?tab=my&saved=true");
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
    <motion.div
      className={`container mx-auto p-6 ${mode === 'visual' ? 'max-w-full' : 'max-w-4xl'}`}
      variants={staggerContainer}
      initial={shouldReduceMotion ? false : "initial"}
      animate={shouldReduceMotion ? false : "animate"}
    >
      <h1 className="text-3xl font-bold mb-6">Créer une Recipe</h1>

      {/* Mode selector */}
      <div className="mb-6 flex gap-2 border-b">
        <motion.button
          onClick={() => setMode("assistant")}
          className={`px-4 py-2 font-medium ${
            mode === "assistant"
              ? "border-b-2 border-primary text-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
          {...(shouldReduceMotion ? {} : cardHover)}
        >
          Assistant IA
        </motion.button>
        <motion.button
          onClick={() => setMode("visual")}
          className={`px-4 py-2 font-medium ${
            mode === "visual"
              ? "border-b-2 border-primary text-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
          {...(shouldReduceMotion ? {} : cardHover)}
        >
          Éditeur Visuel
        </motion.button>
      </div>

      {/* Mode Assistant IA */}
      {mode === "assistant" && (
        <motion.div className="space-y-6" variants={fadeUp}>
          <div>
            <label className="block text-sm font-medium mb-2">
              Domaine métier
            </label>
            <select
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              className="w-full p-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:border-praxia-accent transition-colors"
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
              className="w-full p-3 border border-border rounded-lg min-h-[150px] bg-background text-foreground focus:outline-none focus:border-praxia-accent transition-colors"
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

          <AnimatePresence initial={false}>
            {error && (
              <motion.div
                className="p-4 bg-destructive/10 text-destructive rounded-lg"
                variants={fadeUp}
                initial={shouldReduceMotion ? false : "initial"}
                animate={shouldReduceMotion ? false : "animate"}
                exit={shouldReduceMotion ? undefined : "exit"}
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence initial={false}>
            {generatedRecipe && (
              <motion.div
                className="space-y-4"
                variants={fadeUp}
                initial={shouldReduceMotion ? false : "initial"}
                animate={shouldReduceMotion ? false : "animate"}
                exit={shouldReduceMotion ? undefined : "exit"}
              >
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
                    <motion.button
                      onClick={handleSaveRecipe}
                      disabled={saving || (validation && !validation.valid)}
                      className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 disabled:opacity-50"
                      {...(shouldReduceMotion ? {} : cardHover)}
                    >
                      {saving ? "Sauvegarde..." : "Sauvegarder la Recipe"}
                    </motion.button>
                    <motion.button
                      onClick={handleCreateAgent}
                      disabled={saving || (validation && !validation.valid)}
                      className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50"
                      {...(shouldReduceMotion ? {} : cardHover)}
                    >
                      {saving ? "Création..." : "Créer un Agent"}
                    </motion.button>
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
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Mode Éditeur Visuel */}
      {mode === "visual" && (
        <motion.div
          className="flex flex-col"
          style={{ height: 'calc(100vh - 200px)' }}
          variants={fadeUp}
        >
          <div className="mb-4 flex items-center justify-between">
            <div className="flex gap-2">
              <motion.button
                onClick={async () => {
                  const slug = prompt("Entrez le slug de la recipe à charger (ou laissez vide pour créer une nouvelle)");
                  if (slug) {
                    try {
                      const token = await getToken();
                      if (!token) throw new Error("Non authentifié");
                      const recipe = await getRecipe(slug, token);
                      const visual = recipeToVisual(recipe as RecipeDetail);
                      setVisualRecipe(visual);
                      setVisualValidation(null);
                    } catch (err: any) {
                      setError(err.message || "Erreur lors du chargement");
                    }
                  }
                }}
                className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 text-sm"
                {...(shouldReduceMotion ? {} : cardHover)}
              >
                Charger une Recipe
              </motion.button>
              <motion.button
                onClick={() => {
                  setVisualRecipe({
                    nodes: [],
                    edges: [],
                    metadata: {
                      name: "Nouvelle Recipe",
                      description: "",
                      category: "general",
                      input_schema: {},
                      output_schema: {},
                    },
                  });
                  setVisualValidation(null);
                }}
                className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 text-sm"
                {...(shouldReduceMotion ? {} : cardHover)}
              >
                Nouvelle Recipe
              </motion.button>
            </div>
            <div className="flex gap-2">
              <motion.button
                onClick={async () => {
                  if (!visualRecipe) return;
                  const validation = validateVisualRecipe(visualRecipe);
                  setVisualValidation(validation);
                  if (!validation.valid) {
                    setError(`Le workflow contient des erreurs : ${validation.errors.join(', ')}`);
                    return;
                  }
                  
                  setSaving(true);
                  setError(null);
                  
                  try {
                    const token = await getToken();
                    if (!token) throw new Error("Non authentifié");
                    
                    const recipe = visualToRecipe(visualRecipe);
                    const fullRecipe = {
                      ...recipe.metadata,
                      steps: recipe.steps,
                      slug: recipe.metadata.name.toLowerCase().replace(/\s+/g, '-'),
                      version: "1.0.0",
                    };
                    
                    await createCustomRecipe(token, fullRecipe);
                    router.push("/dashboard/recipes?tab=my&saved=true");
                  } catch (err: any) {
                    setError(err.message || "Erreur lors de la sauvegarde");
                  } finally {
                    setSaving(false);
                  }
                }}
                disabled={!visualRecipe || saving}
                className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 disabled:opacity-50 text-sm"
                {...(shouldReduceMotion ? {} : cardHover)}
              >
                {saving ? "Sauvegarde..." : "Sauvegarder"}
              </motion.button>
              <motion.button
                onClick={async () => {
                  if (!visualRecipe) return;
                  const validation = validateVisualRecipe(visualRecipe);
                  setVisualValidation(validation);
                  if (!validation.valid) {
                    setError(`Le workflow contient des erreurs : ${validation.errors.join(', ')}`);
                    return;
                  }
                  
                  setSaving(true);
                  setError(null);
                  
                  try {
                    const token = await getToken();
                    if (!token) throw new Error("Non authentifié");
                    
                    const recipe = visualToRecipe(visualRecipe);
                    const fullRecipe = {
                      ...recipe.metadata,
                      steps: recipe.steps,
                      slug: recipe.metadata.name.toLowerCase().replace(/\s+/g, '-'),
                      version: "1.0.0",
                    };
                    
                    const savedRecipe = await createCustomRecipe(token, fullRecipe);
                    await createAgent(token, {
                      name: fullRecipe.name,
                      recipe_slug: savedRecipe.slug,
                      description: fullRecipe.description,
                    });
                    
                    router.push("/dashboard/agents");
                  } catch (err: any) {
                    setError(err.message || "Erreur lors de la création");
                  } finally {
                    setSaving(false);
                  }
                }}
                disabled={!visualRecipe || saving}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 text-sm"
                {...(shouldReduceMotion ? {} : cardHover)}
              >
                {saving ? "Création..." : "Créer un Agent"}
              </motion.button>
            </div>
          </div>

          <AnimatePresence initial={false}>
            {error && (
              <motion.div
                className="mb-4 p-4 bg-destructive/10 text-destructive rounded-lg"
                variants={fadeUp}
                initial={shouldReduceMotion ? false : "initial"}
                animate={shouldReduceMotion ? false : "animate"}
                exit={shouldReduceMotion ? undefined : "exit"}
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence initial={false}>
            {visualValidation && (
              <motion.div
                className="mb-4 space-y-2"
                variants={fadeUp}
                initial={shouldReduceMotion ? false : "initial"}
                animate={shouldReduceMotion ? false : "animate"}
                exit={shouldReduceMotion ? undefined : "exit"}
              >
                {visualValidation.errors.length > 0 && (
                  <div className="p-2 bg-destructive/10 text-destructive rounded text-sm">
                    <strong>Erreurs :</strong>
                    <ul className="list-disc list-inside mt-1">
                      {visualValidation.errors.map((e, i) => (
                        <li key={i}>{e}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {visualValidation.warnings.length > 0 && (
                  <div className="p-2 bg-yellow-100 text-yellow-800 rounded text-sm">
                    <strong>Avertissements :</strong>
                    <ul className="list-disc list-inside mt-1">
                      {visualValidation.warnings.map((w, i) => (
                        <li key={i}>{w}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {visualValidation.valid && visualValidation.errors.length === 0 && (
                  <div className="p-2 bg-green-100 text-green-800 rounded text-sm">
                    ✓ Workflow valide
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
          
          <div className="flex-1 border rounded-lg overflow-hidden">
            {visualRecipe ? (
              <VisualRecipeEditor
                initialRecipe={visualRecipe}
                onRecipeChange={(updated) => {
                  setVisualRecipe(updated);
                  setVisualValidation(null);
                }}
              />
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <div className="text-center">
                  <p className="mb-4">Commencez par créer une nouvelle recipe ou charger une existante</p>
                  <motion.button
                    onClick={() => {
                      setVisualRecipe({
                        nodes: [],
                        edges: [],
                        metadata: {
                          name: "Nouvelle Recipe",
                          description: "",
                          category: "general",
                          input_schema: {},
                          output_schema: {},
                        },
                      });
                    }}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
                    {...(shouldReduceMotion ? {} : cardHover)}
                  >
                    Créer une nouvelle Recipe
                  </motion.button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
