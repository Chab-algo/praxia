"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ThemeToggleCompact } from "./theme-toggle";

const NAV_LINKS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/dashboard/recipes", label: "Recipes" },
  { href: "/dashboard/agents", label: "Agents" },
  { href: "/dashboard/executions", label: "Executions" },
  { href: "/dashboard/batches", label: "Batches" },
  { href: "/dashboard/usage", label: "Usage" },
  { href: "/dashboard/analytics", label: "Analytics" },
  { href: "/crm/leads", label: "CRM" },
];

function NavLinks({ onClick }: { onClick?: () => void }) {
  return (
    <nav className="space-y-1">
      {NAV_LINKS.map((link) => (
        <a
          key={link.href}
          href={link.href}
          onClick={onClick}
          className="block rounded-md px-3 py-2.5 text-sm hover:bg-accent min-h-[44px] flex items-center"
        >
          {link.label}
        </a>
      ))}
    </nav>
  );
}

export function Sidebar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-64 shrink-0 border-r bg-muted/40 p-6">
        <div className="mb-8">
          <h1 className="text-xl font-bold text-primary">PraxIA</h1>
          <p className="text-xs text-muted-foreground">AI Agent Studio</p>
        </div>
        <div className="flex-1">
          <NavLinks />
        </div>
        <div className="pt-4 border-t flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Theme</span>
          <ThemeToggleCompact />
        </div>
      </aside>

      {/* Mobile hamburger */}
      <button
        onClick={() => setOpen(true)}
        className="lg:hidden fixed top-3 left-3 z-40 rounded-md border bg-background p-2.5 shadow-sm"
        aria-label="Open menu"
      >
        <svg
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
          />
        </svg>
      </button>

      {/* Mobile overlay */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              className="fixed inset-0 z-50 bg-black/50 lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
            />
            <motion.aside
              className="fixed left-0 top-0 bottom-0 z-50 w-64 bg-background p-6 shadow-xl lg:hidden flex flex-col"
              initial={{ x: -256 }}
              animate={{ x: 0 }}
              exit={{ x: -256 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
            >
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h1 className="text-xl font-bold text-primary">PraxIA</h1>
                  <p className="text-xs text-muted-foreground">
                    AI Agent Studio
                  </p>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="rounded-md p-2 hover:bg-accent"
                  aria-label="Close menu"
                >
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
              <div className="flex-1 overflow-y-auto">
                <NavLinks onClick={() => setOpen(false)} />
              </div>
              <div className="pt-4 mt-4 border-t flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Theme</span>
                <ThemeToggleCompact />
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
