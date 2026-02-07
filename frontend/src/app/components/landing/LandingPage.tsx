'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { HeroSection } from './HeroSection';
import { SocialProof } from './SocialProof';
import { OutcomesSection } from './OutcomesSection';
import { RecipesShowcase } from './RecipesShowcase';
import { HowItWorks } from './HowItWorks';
import { FinalCTA } from './FinalCTA';

const NAV_LINKS = [
  { href: '#outcomes', label: 'Outcomes' },
  { href: '#recipes', label: 'Recipes' },
  { href: '#how-it-works', label: 'How it Works' },
];

function useScrollState() {
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('');

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 20);

      const sections = ['outcomes', 'recipes', 'how-it-works', 'cta'];
      let current = '';
      for (const id of sections) {
        const el = document.getElementById(id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 200) current = id;
        }
      }
      setActiveSection(current);
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return { scrolled, activeSection };
}

export function LandingPage() {
  const { scrolled, activeSection } = useScrollState();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <main className="min-h-screen bg-white">
      {/* Navbar */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-white/90 backdrop-blur-xl shadow-sm border-b border-gray-100'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <a href="/" className="text-xl font-bold tracking-tight">
            <span className="gradient-text">PraxIA</span>
          </a>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors duration-200 ${
                  activeSection === link.href.slice(1)
                    ? 'text-gray-900'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                {link.label}
                {activeSection === link.href.slice(1) && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="h-0.5 bg-gradient-to-r from-cyan-500 via-violet-500 to-orange-500 mt-0.5 rounded-full"
                    transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                  />
                )}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <a
              href="/sign-in"
              className="hidden sm:inline text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
            >
              Sign In
            </a>
            <a
              href="#cta"
              className="hidden sm:inline text-sm font-medium px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              Get Started
            </a>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 text-gray-600 hover:text-gray-900 transition-colors"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden bg-white/95 backdrop-blur-xl border-b border-gray-100 overflow-hidden"
            >
              <div className="px-6 py-4 space-y-3">
                {NAV_LINKS.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="block text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors py-2"
                  >
                    {link.label}
                  </a>
                ))}
                <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
                  <a
                    href="/sign-in"
                    className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    Sign In
                  </a>
                  <a
                    href="#cta"
                    onClick={() => setMobileOpen(false)}
                    className="text-sm font-medium px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
                  >
                    Get Started
                  </a>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Spacer for fixed nav */}
      <div className="h-16" />

      <HeroSection />
      <SocialProof />
      <OutcomesSection />
      <RecipesShowcase />
      <HowItWorks />
      <FinalCTA />

      {/* Footer */}
      <footer className="border-t border-gray-100 py-12 bg-gray-50/30">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="font-bold gradient-text">PraxIA</span>
              <span className="text-sm text-gray-400">
                &copy; {new Date().getFullYear()}. All rights reserved.
              </span>
            </div>
            <div className="flex items-center gap-6">
              <a href="#" className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
                Privacy
              </a>
              <a href="#" className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
                Terms
              </a>
              <a href="#" className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
                Contact
              </a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
