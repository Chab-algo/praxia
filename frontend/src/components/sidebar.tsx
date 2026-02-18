"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ThemeToggleCompact } from "./theme-toggle";
import { LanguageSwitcher } from "./language-switcher";
import {
  LayoutDashboard,
  BookOpen,
  Bot,
  MessageCircle,
  Play,
  Layers,
  PieChart,
  BarChart3,
} from "lucide-react";

const NAV_LINKS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/recipes", label: "Recipes", icon: BookOpen },
  { href: "/dashboard/agents", label: "Agents", icon: Bot },
  { href: "/dashboard/agent-ia", label: "Agent IA", icon: MessageCircle },
  { href: "/dashboard/executions", label: "Executions", icon: Play },
  { href: "/dashboard/batches", label: "Batches", icon: Layers },
  { href: "/dashboard/usage", label: "Usage", icon: PieChart },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
];

function NavLinks({
  onClick,
  isCollapsed,
}: {
  onClick?: () => void;
  isCollapsed?: boolean;
}) {
  return (
    <nav className="space-y-1">
      {NAV_LINKS.map((link) => {
        const Icon = link.icon;
        return (
          <a
            key={link.href}
            href={link.href}
            onClick={onClick}
            className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm hover:bg-accent min-h-[44px] group relative"
            title={isCollapsed ? link.label : undefined}
          >
            <Icon className="w-5 h-5 shrink-0" />
            {!isCollapsed && <span>{link.label}</span>}

            {/* Tooltip for collapsed state */}
            {isCollapsed && (
              <span className="absolute left-full ml-2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded-md opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap transition-opacity z-50 border shadow-md">
                {link.label}
              </span>
            )}
          </a>
        );
      })}
    </nav>
  );
}

export function Sidebar() {
  const [open, setOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(true);

  return (
    <>
      {/* Desktop sidebar - collapsible with hover */}
      <motion.aside
        className="hidden lg:flex flex-col shrink-0 border-r bg-muted/40"
        initial={false}
        animate={{ width: isCollapsed ? 80 : 256 }}
        transition={{ duration: 0.2, ease: "easeInOut" }}
        onMouseEnter={() => setIsCollapsed(false)}
        onMouseLeave={() => setIsCollapsed(true)}
      >
        <div className="p-6 overflow-hidden">
          <div className="mb-8">
            <motion.div
              initial={false}
              animate={{ opacity: isCollapsed ? 0 : 1 }}
              transition={{ duration: 0.15 }}
            >
              {!isCollapsed && (
                <>
                  <h1 className="text-xl font-bold text-primary whitespace-nowrap">
                    PraxIA
                  </h1>
                  <p className="text-xs text-muted-foreground whitespace-nowrap">
                    AI Agent Studio
                  </p>
                </>
              )}
            </motion.div>
            {isCollapsed && (
              <div className="flex justify-center">
                <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-sm">
                    P
                  </span>
                </div>
              </div>
            )}
          </div>
          <div className="flex-1">
            <NavLinks isCollapsed={isCollapsed} />
          </div>
        </div>
        <div className="p-6 border-t space-y-2">
          <div className="flex items-center justify-center gap-3">
            {!isCollapsed && (
              <span className="text-xs text-muted-foreground">Theme</span>
            )}
            <ThemeToggleCompact />
          </div>
          <LanguageSwitcher isCollapsed={isCollapsed} />
        </div>
      </motion.aside>

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
              <div className="pt-4 mt-4 border-t space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Theme</span>
                  <ThemeToggleCompact />
                </div>
                <LanguageSwitcher />
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
