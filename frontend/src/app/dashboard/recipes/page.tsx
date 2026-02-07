"use client";

import { useEffect, useState, Suspense } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter, useSearchParams } from "next/navigation";
import { listRecipes, listMyRecipes } from "@/lib/api";

interface Recipe {
  slug: string;
  name: string;
  description: string;
  category: string;
  icon: string | null;
  estimated_cost_per_run: number | null;
  roi_metrics: Record<string, string>;
}

const CATEGORY_COLORS: Record<string, string> = {
  ecommerce: "bg-blue-100 text-blue-800",
  hr: "bg-green-100 text-green-800",
  finance: "bg-purple-100 text-purple-800",
  marketing: "bg-orange-100 text-orange-800",
  support: "bg-teal-100 text-teal-800",
};

interface MyRecipe {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  category: string;
  version: string;
  is_custom: boolean;
  created_at: string;
}

function RecipesPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { getToken, isLoaded } = useAuth();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [myRecipes, setMyRecipes] = useState<MyRecipe[]>([]);
  const [filter, setFilter] = useState<string>("all");
  const [tab, setTab] = useState<"catalog" | "my">(
    (searchParams?.get("tab") as "catalog" | "my") || "catalog"
  );
  const [loading, setLoading] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);

  const loadData = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const [publicRecipes, token] = await Promise.all([
        listRecipes(),
        getToken(),
      ]);
      setRecipes(publicRecipes);

      if (token) {
        try {
          const custom = await listMyRecipes(token);
          setMyRecipes(custom);
        } catch (err) {
          // Ignore if endpoint doesn't exist yet
          console.error("Failed to load custom recipes:", err);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    if (!isLoaded) return;
    loadData();
  }, [isLoaded, getToken]);

  // Check for success parameter and show message
  useEffect(() => {
    if (searchParams?.get("saved") === "true") {
      setShowSuccess(true);
      // Clear the parameter from URL
      router.replace("/dashboard/recipes?tab=my", { scroll: false });
      // Hide message after 3 seconds
      setTimeout(() => setShowSuccess(false), 3000);
    }
  }, [searchParams, router]);

  // Update tab when URL parameter changes
  useEffect(() => {
    const tabParam = searchParams?.get("tab");
    if (tabParam === "my" || tabParam === "catalog") {
      setTab(tabParam);
    }
  }, [searchParams]);

  const filtered =
    filter === "all" ? recipes : recipes.filter((r) => r.category === filter);
  const categories = ["all", ...Array.from(new Set(recipes.map((r) => r.category)))];

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Recipes</h2>
          <p className="text-muted-foreground mt-1">
            Pre-built AI agent templates and your custom recipes
          </p>
        </div>
        <button
          onClick={() => router.push("/dashboard/recipes/builder")}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
        >
          Créer une Recipe
        </button>
      </div>

      {showSuccess && (
        <div className="mb-4 p-4 bg-green-100 text-green-800 rounded-lg border border-green-200">
          ✓ Recipe sauvegardée avec succès !
        </div>
      )}

      {/* Tabs */}
      <div className="mb-6 flex gap-2 border-b">
        <button
          onClick={() => {
            setTab("catalog");
            router.replace("/dashboard/recipes?tab=catalog", { scroll: false });
          }}
          className={`px-4 py-2 font-medium ${
            tab === "catalog"
              ? "border-b-2 border-primary text-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Catalogue ({recipes.length})
        </button>
        <button
          onClick={async () => {
            setTab("my");
            router.replace("/dashboard/recipes?tab=my", { scroll: false });
            // Reload data when switching to "my" tab
            if (isLoaded) {
              await loadData(false);
            }
          }}
          className={`px-4 py-2 font-medium ${
            tab === "my"
              ? "border-b-2 border-primary text-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Mes Recipes ({myRecipes.length})
        </button>
      </div>

      {tab === "catalog" && (
        <>
          {/* Category filter */}
          <div className="flex gap-2 mb-6">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                  filter === cat
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-accent"
                }`}
              >
                {cat === "all" ? "All" : cat.charAt(0).toUpperCase() + cat.slice(1)}
              </button>
            ))}
          </div>

          {/* Recipe cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((recipe) => (
              <a
                key={recipe.slug}
                href={`/dashboard/recipes/${recipe.slug}`}
                className="group rounded-lg border p-6 hover:border-primary hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-semibold group-hover:text-primary">
                    {recipe.name}
                  </h3>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      CATEGORY_COLORS[recipe.category] || "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {recipe.category}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  {recipe.description}
                </p>
                <div className="space-y-1 text-xs text-muted-foreground">
                  {recipe.estimated_cost_per_run && (
                    <div>
                      Cost:{" "}
                      <span className="font-medium text-foreground">
                        ${recipe.estimated_cost_per_run.toFixed(4)}/run
                      </span>
                    </div>
                  )}
                  {recipe.roi_metrics?.time_saved && (
                    <div>
                      Time saved:{" "}
                      <span className="font-medium text-foreground">
                        {recipe.roi_metrics.time_saved}
                      </span>
                    </div>
                  )}
                </div>
              </a>
            ))}
          </div>
        </>
      )}

      {tab === "my" && (
        <div>
          {myRecipes.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p className="mb-4">Vous n'avez pas encore de recipes personnalisées.</p>
              <button
                onClick={() => router.push("/dashboard/recipes/builder")}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
              >
                Créer votre première recipe
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {myRecipes.map((recipe) => (
                <a
                  key={recipe.id}
                  href={`/dashboard/recipes/${recipe.slug}`}
                  className="group rounded-lg border p-6 hover:border-primary hover:shadow-md transition-all"
                >
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-semibold group-hover:text-primary">
                      {recipe.name}
                    </h3>
                    <span className="rounded-full px-2.5 py-0.5 text-xs font-medium bg-purple-100 text-purple-800">
                      Custom
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    {recipe.description || "Aucune description"}
                  </p>
                  <div className="text-xs text-muted-foreground">
                    Créée le {new Date(recipe.created_at).toLocaleDateString("fr-FR")}
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function RecipesPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center p-12">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      }
    >
      <RecipesPageContent />
    </Suspense>
  );
}
