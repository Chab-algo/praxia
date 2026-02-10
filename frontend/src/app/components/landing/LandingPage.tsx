'use client';

import { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { HeroSection } from './HeroSection';
import { FeaturesSection } from './FeaturesSection';
import { HowItWorks } from './HowItWorks';
import { FinalCTA } from './FinalCTA';
import { SmoothScrollProvider } from '@/components/smooth-scroll-provider';
import { useGSAP } from '@gsap/react';
import { setupNavbarAutoHide } from '@/lib/gsap-animations';

const NAV_LINKS = [
  { href: '#features', label: 'Features' },
  { href: '#how-it-works', label: 'How it Works' },
];

function useScrollState() {
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('');

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 20);

      const sections = ['features', 'how-it-works', 'cta'];
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
  const navRef = useRef<HTMLElement>(null);

  // Setup navbar auto-hide
  useGSAP(() => {
    setupNavbarAutoHide('nav');
  });

  return (
    <SmoothScrollProvider>
      <main className="min-h-screen bg-background">
        {/* Navbar */}
        <nav
          ref={navRef}
          className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
            scrolled
              ? 'bg-background/90 backdrop-blur-xl border-b border-border'
              : 'bg-transparent'
          }`}
        >
          <div className="container-custom h-16 flex items-center justify-between">
            <a href="/" className="text-xl font-bold tracking-tight">
              <span className="text-praxia-accent">PraxIA</span>
            </a>

            {/* Desktop nav */}
            <div className="hidden md:flex items-center gap-8">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className={`text-sm font-medium transition-colors duration-200 relative ${
                    activeSection === link.href.slice(1)
                      ? 'text-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {link.label}
                  {activeSection === link.href.slice(1) && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-praxia-accent" />
                  )}
                </a>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <a
                href="/sign-in"
                className="hidden sm:inline text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Sign In
              </a>
              <a
                href="#cta"
                className="hidden sm:inline text-sm font-medium px-4 py-2 bg-praxia-black text-white rounded-md hover:bg-praxia-gray-800 transition-colors active:scale-95"
              >
                Get Started
              </a>

              {/* Mobile hamburger */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="md:hidden p-2 text-muted-foreground hover:text-foreground transition-colors"
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
                className="md:hidden bg-background/95 backdrop-blur-xl border-b border-border overflow-hidden"
              >
                <div className="px-6 py-4 space-y-3">
                  {NAV_LINKS.map((link) => (
                    <a
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      className="block text-sm font-medium text-muted-foreground hover:text-foreground transition-colors py-2"
                    >
                      {link.label}
                    </a>
                  ))}
                  <div className="flex items-center gap-3 pt-2 border-t border-border">
                    <a
                      href="/sign-in"
                      className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Sign In
                    </a>
                    <a
                      href="#cta"
                      onClick={() => setMobileOpen(false)}
                      className="text-sm font-medium px-4 py-2 bg-praxia-black text-white rounded-md hover:bg-praxia-gray-800 transition-colors"
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
        <FeaturesSection />
        <HowItWorks />
        <FinalCTA />

        {/* Footer */}
        <footer className="border-t border-border py-8 bg-praxia-gray-50">
          <div className="container-custom">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="font-bold text-praxia-accent">PraxIA</span>
                <span className="text-sm text-muted-foreground">
                  &copy; {new Date().getFullYear()}. All rights reserved.
                </span>
              </div>
              <div className="flex items-center gap-6">
                <a
                  href="#"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Privacy
                </a>
                <a
                  href="#"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Terms
                </a>
                <a
                  href="#"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Contact
                </a>
              </div>
            </div>
          </div>
        </footer>
      </main>
    </SmoothScrollProvider>
  );
}
