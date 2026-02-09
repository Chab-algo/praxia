"use client";

import { motion, useReducedMotion } from "framer-motion";
import { fadeUp } from "@/lib/motion";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    href: string;
  };
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      className="rounded-lg border border-dashed p-12 text-center"
      variants={fadeUp}
      initial={shouldReduceMotion ? false : "initial"}
      animate={shouldReduceMotion ? false : "animate"}
    >
      {icon && (
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center text-muted-foreground">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground mb-6 max-w-md mx-auto text-sm">
        {description}
      </p>
      {action && (
        <a
          href={action.href}
          className="inline-flex rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          {action.label}
        </a>
      )}
    </motion.div>
  );
}
