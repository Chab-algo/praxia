"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Moon, Sun } from "lucide-react";

/**
 * Premium Dark Mode Toggle
 * Features:
 * - Smooth theme transition with Motion
 * - Icon morph animation
 * - Glow effect on active
 * - Persists preference to localStorage
 */

export function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [mounted, setMounted] = useState(false);

  // Hydration fix
  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initialTheme = savedTheme || (prefersDark ? "dark" : "light");
    setTheme(initialTheme);
    document.documentElement.classList.toggle("dark", initialTheme === "dark");
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
  };

  if (!mounted) {
    return (
      <div className="w-10 h-10 rounded-lg bg-muted animate-pulse" />
    );
  }

  const isDark = theme === "dark";

  return (
    <motion.button
      onClick={toggleTheme}
      className="relative w-10 h-10 rounded-lg flex items-center justify-center glass-card group"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{
        type: "spring",
        stiffness: 400,
        damping: 17,
      }}
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
    >
      {/* Glow effect */}
      <motion.div
        className="absolute inset-0 rounded-lg"
        initial={false}
        animate={{
          boxShadow: isDark
            ? "0 0 20px rgba(147, 197, 253, 0.3)"
            : "0 0 20px rgba(251, 191, 36, 0.3)",
        }}
        transition={{ duration: 0.3 }}
      />

      {/* Icon container with rotation */}
      <motion.div
        initial={false}
        animate={{
          rotate: isDark ? 180 : 0,
          scale: 1,
        }}
        transition={{
          type: "spring",
          stiffness: 200,
          damping: 20,
        }}
        className="relative z-10"
      >
        {isDark ? (
          <Moon className="w-5 h-5 text-blue-300" />
        ) : (
          <Sun className="w-5 h-5 text-amber-500" />
        )}
      </motion.div>

      {/* Hover ring */}
      <motion.div
        className="absolute inset-0 rounded-lg border-2"
        initial={false}
        animate={{
          borderColor: isDark
            ? "rgba(147, 197, 253, 0)"
            : "rgba(251, 191, 36, 0)",
        }}
        whileHover={{
          borderColor: isDark
            ? "rgba(147, 197, 253, 0.5)"
            : "rgba(251, 191, 36, 0.5)",
        }}
        transition={{ duration: 0.2 }}
      />
    </motion.button>
  );
}

/**
 * Compact toggle variant for mobile/sidebar
 */
export function ThemeToggleCompact() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initialTheme = savedTheme || (prefersDark ? "dark" : "light");
    setTheme(initialTheme);
    document.documentElement.classList.toggle("dark", initialTheme === "dark");
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
  };

  if (!mounted) return null;

  const isDark = theme === "dark";

  return (
    <motion.button
      onClick={toggleTheme}
      className="relative w-8 h-8 rounded-md flex items-center justify-center"
      whileTap={{ scale: 0.9 }}
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
    >
      <motion.div
        initial={false}
        animate={{ rotate: isDark ? 180 : 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        {isDark ? (
          <Moon className="w-4 h-4 text-blue-300" />
        ) : (
          <Sun className="w-4 h-4 text-amber-500" />
        )}
      </motion.div>
    </motion.button>
  );
}
