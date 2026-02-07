"use client";

import { useEffect, useState } from "react";
import { listRecipes } from "@/lib/api";

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

export default function RecipesPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [filter, setFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listRecipes()
      .then(setRecipes)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

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
      <div className="mb-6">
        <h2 className="text-2xl font-bold">Recipe Catalogue</h2>
        <p className="text-muted-foreground mt-1">
          Pre-built AI agent templates. Pick one and customize it for your client.
        </p>
      </div>

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
    </div>
  );
}
