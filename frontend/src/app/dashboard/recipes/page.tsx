"use client";

import { useEffect, useState, Suspense } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter, useSearchParams } from "next/navigation";
import { listRecipes, listMyRecipes } from "@/lib/api";
import { motion, useReducedMotion, AnimatePresence } from "framer-motion";
import {
  fadeInUp,
  fadeInScale,
  staggerContainer,
  staggerFast,
  cardHoverPremium,
} from "@/lib/motion-premium";
import {
  Sparkles,
  Clock,
  TrendingUp,
  ArrowUpRight,
  Plus,
  CheckCircle2,
} from "lucide-react";

interface Recipe {
  slug: string;
  name: string;
  description: string;
  category: string;
  icon: string | null;
  estimated_cost_per_run: number | null;
  roi_metrics: Record<string, string>;
}

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

// Premium category colors with gradients
const CATEGORY_STYLES: Record<
  string,
  { bg: string; text: string; icon: string; gradient: string }
> = {
  ecommerce: {
    bg: "bg-blue-500/10",
    text: "text-blue-600 dark:text-blue-400",
    icon: "text-blue-500",
    gradient: "from-blue-500/10 to-blue-500/5",
  },
  hr: {
    bg: "bg-green-500/10",
    text: "text-green-600 dark:text-green-400",
    icon: "text-green-500",
    gradient: "from-green-500/10 to-green-500/5",
  },
  finance: {
    bg: "bg-purple-500/10",
    text: "text-purple-600 dark:text-purple-400",
    icon: "text-purple-500",
    gradient: "from-purple-500/10 to-purple-500/5",
  },
  marketing: {
    bg: "bg-orange-500/10",
    text: "text-orange-600 dark:text-orange-400",
    icon: "text-orange-500",
    gradient: "from-orange-500/10 to-orange-500/5",
  },
  support: {
    bg: "bg-teal-500/10",
    text: "text-teal-600 dark:text-teal-400",
    icon: "text-teal-500",
    gradient: "from-teal-500/10 to-teal-500/5",
  },
  design: {
    bg: "bg-pink-500/10",
    text: "text-pink-600 dark:text-pink-400",
    icon: "text-pink-500",
    gradient: "from-pink-500/10 to-pink-500/5",
  },
};

function RecipesPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { getToken, isLoaded } = useAuth();
  const shouldReduceMotion = useReducedMotion();
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

  useEffect(() => {
    if (searchParams?.get("saved") === "true") {
      setShowSuccess(true);
      router.replace("/dashboard/recipes?tab=my", { scroll: false });
      setTimeout(() => setShowSuccess(false), 3000);
    }
  }, [searchParams, router]);

  useEffect(() => {
    const tabParam = searchParams?.get("tab");
    if (tabParam === "my" || tabParam === "catalog") {
      setTab(tabParam);
    }
  }, [searchParams]);

  const filtered =
    filter === "all" ? recipes : recipes.filter((r) => r.category === filter);
  const categories = [
    "all",
    ...Array.from(new Set(recipes.map((r) => r.category))),
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <motion.div
          className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
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
        className="mb-6 flex items-center justify-between"
        variants={fadeInUp}
        initial={shouldReduceMotion ? false : "initial"}
        animate={shouldReduceMotion ? false : "animate"}
      >
        <div>
          <h2 className="text-3xl font-bold mb-2 gradient-text">Recipes</h2>
          <p className="text-sm text-muted-foreground">
            Pre-built AI agent templates ready to deploy
          </p>
        </div>
        <motion.button
          onClick={() => router.push("/dashboard/recipes/builder")}
          className="relative group glass-card px-6 py-2.5 rounded-lg font-medium hover-lift overflow-hidden"
          whileHover={shouldReduceMotion ? {} : { scale: 1.02 }}
          whileTap={shouldReduceMotion ? {} : { scale: 0.98 }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative flex items-center gap-2">
            <Plus className="w-4 h-4" />
            <span>Create Recipe</span>
          </div>
        </motion.button>
      </motion.div>

      {/* Success notification */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="mb-6 glass-card rounded-xl p-4 border-green-500/50"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
              </div>
              <span className="font-medium text-green-600 dark:text-green-400">
                Recipe saved successfully!
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tabs */}
      <motion.div
        className="mb-6 flex gap-2 border-b border-border/50"
        variants={fadeInUp}
        initial={shouldReduceMotion ? false : "initial"}
        animate={shouldReduceMotion ? false : "animate"}
      >
        <motion.button
          onClick={() => {
            setTab("catalog");
            router.replace("/dashboard/recipes?tab=catalog", { scroll: false });
          }}
          className={`relative px-6 py-3 font-medium transition-colors ${
            tab === "catalog"
              ? "text-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
          whileHover={shouldReduceMotion ? {} : { y: -1 }}
        >
          <span className="relative z-10">Catalog ({recipes.length})</span>
          {tab === "catalog" && (
            <motion.div
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary to-purple-500"
              layoutId="activeTab"
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />
          )}
        </motion.button>
        <motion.button
          onClick={async () => {
            setTab("my");
            router.replace("/dashboard/recipes?tab=my", { scroll: false });
            if (isLoaded) {
              await loadData(false);
            }
          }}
          className={`relative px-6 py-3 font-medium transition-colors ${
            tab === "my"
              ? "text-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
          whileHover={shouldReduceMotion ? {} : { y: -1 }}
        >
          <span className="relative z-10">My Recipes ({myRecipes.length})</span>
          {tab === "my" && (
            <motion.div
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary to-purple-500"
              layoutId="activeTab"
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />
          )}
        </motion.button>
      </motion.div>

      {tab === "catalog" && (
        <>
          {/* Category filter pills */}
          <motion.div
            className="flex gap-2 mb-8 flex-wrap"
            variants={staggerFast}
            initial={shouldReduceMotion ? false : "initial"}
            animate={shouldReduceMotion ? false : "animate"}
          >
            {categories.map((cat) => {
              const isActive = filter === cat;
              const styles = CATEGORY_STYLES[cat] || CATEGORY_STYLES.support;

              return (
                <motion.button
                  key={cat}
                  onClick={() => setFilter(cat)}
                  className={`relative rounded-full px-5 py-2 text-sm font-medium transition-all ${
                    isActive
                      ? `${styles.bg} ${styles.text} shadow-lg`
                      : "bg-muted text-muted-foreground hover:bg-accent"
                  }`}
                  variants={fadeInScale}
                  whileHover={shouldReduceMotion ? {} : { scale: 1.05, y: -2 }}
                  whileTap={shouldReduceMotion ? {} : { scale: 0.95 }}
                  layout
                >
                  {isActive && (
                    <motion.div
                      className="absolute inset-0 rounded-full bg-gradient-to-r opacity-20"
                      style={{
                        background: `linear-gradient(135deg, ${styles.gradient})`,
                      }}
                      layoutId="activeFilter"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10">
                    {cat === "all"
                      ? "All"
                      : cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </span>
                </motion.button>
              );
            })}
          </motion.div>

          {/* Recipe cards grid */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={staggerContainer}
            initial={shouldReduceMotion ? false : "initial"}
            animate={shouldReduceMotion ? false : "animate"}
            layout
          >
            <AnimatePresence mode="popLayout">
              {filtered.map((recipe) => {
                const styles =
                  CATEGORY_STYLES[recipe.category] || CATEGORY_STYLES.support;

                return (
                  <motion.a
                    key={recipe.slug}
                    href={`/dashboard/recipes/${recipe.slug}`}
                    className="relative group glass-card rounded-xl p-6 overflow-hidden hover-lift"
                    variants={fadeInScale}
                    whileHover={shouldReduceMotion ? {} : cardHoverPremium.hover}
                    whileTap={shouldReduceMotion ? {} : cardHoverPremium.tap}
                    layout
                    exit={{ opacity: 0, scale: 0.9 }}
                  >
                    {/* Background gradient */}
                    <div
                      className={`absolute inset-0 bg-gradient-to-br ${styles.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
                    />

                    <div className="relative z-10">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg mb-1 group-hover:text-primary transition-colors">
                            {recipe.name}
                          </h3>
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${styles.bg} ${styles.text}`}
                          >
                            <Sparkles className="w-3 h-3" />
                            {recipe.category}
                          </span>
                        </div>
                        <ArrowUpRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>

                      {/* Description */}
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                        {recipe.description}
                      </p>

                      {/* Metrics */}
                      <div className="space-y-2">
                        {recipe.estimated_cost_per_run && (
                          <div className="flex items-center gap-2 text-xs">
                            <div className="w-5 h-5 rounded bg-amber-500/10 flex items-center justify-center">
                              <span className="text-amber-500">$</span>
                            </div>
                            <span className="text-muted-foreground">
                              Cost:{" "}
                            </span>
                            <span className="font-semibold">
                              ${recipe.estimated_cost_per_run.toFixed(4)}/run
                            </span>
                          </div>
                        )}
                        {recipe.roi_metrics?.time_saved && (
                          <div className="flex items-center gap-2 text-xs">
                            <div className="w-5 h-5 rounded bg-green-500/10 flex items-center justify-center">
                              <Clock className="w-3 h-3 text-green-500" />
                            </div>
                            <span className="text-muted-foreground">Saves: </span>
                            <span className="font-semibold">
                              {recipe.roi_metrics.time_saved}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.a>
                );
              })}
            </AnimatePresence>
          </motion.div>
        </>
      )}

      {tab === "my" && (
        <div>
          {myRecipes.length === 0 ? (
            <motion.div
              className="glass-card rounded-xl p-12 text-center"
              variants={fadeInScale}
              initial={shouldReduceMotion ? false : "initial"}
              animate={shouldReduceMotion ? false : "animate"}
            >
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">
                No custom recipes yet
              </h3>
              <p className="text-sm text-muted-foreground mb-6">
                Create your first custom recipe to get started
              </p>
              <motion.button
                onClick={() => router.push("/dashboard/recipes/builder")}
                className="glass-card px-6 py-2.5 rounded-lg font-medium hover-lift inline-flex items-center gap-2"
                whileHover={shouldReduceMotion ? {} : { scale: 1.05 }}
                whileTap={shouldReduceMotion ? {} : { scale: 0.95 }}
              >
                <Plus className="w-4 h-4" />
                Create your first recipe
              </motion.button>
            </motion.div>
          ) : (
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              variants={staggerContainer}
              initial={shouldReduceMotion ? false : "initial"}
              animate={shouldReduceMotion ? false : "animate"}
            >
              {myRecipes.map((recipe) => (
                <motion.a
                  key={recipe.id}
                  href={`/dashboard/recipes/${recipe.slug}`}
                  className="relative group glass-card rounded-xl p-6 overflow-hidden hover-lift"
                  variants={fadeInScale}
                  whileHover={shouldReduceMotion ? {} : cardHoverPremium.hover}
                  whileTap={shouldReduceMotion ? {} : cardHoverPremium.tap}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-1 group-hover:text-primary transition-colors">
                          {recipe.name}
                        </h3>
                        <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium bg-purple-500/10 text-purple-600 dark:text-purple-400">
                          <Sparkles className="w-3 h-3" />
                          Custom
                        </span>
                      </div>
                      <ArrowUpRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>

                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {recipe.description || "No description"}
                    </p>

                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      <span>
                        Created{" "}
                        {new Date(recipe.created_at).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  </div>
                </motion.a>
              ))}
            </motion.div>
          )}
        </div>
      )}
    </motion.div>
  );
}

export default function RecipesPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center p-12">
          <motion.div
            className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
        </div>
      }
    >
      <RecipesPageContent />
    </Suspense>
  );
}
