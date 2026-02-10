'use client';

import { useRef } from 'react';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useGSAP } from '@gsap/react';
import { setupSectionReveal } from '@/lib/gsap-animations';

export function FinalCTA() {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      setupSectionReveal('.cta-content');
    },
    { scope: sectionRef }
  );

  return (
    <section ref={sectionRef} className="section-spacing" id="cta">
      <div className="container-narrow">
        <div className="cta-content text-center border border-border rounded-lg p-12 md:p-16 bg-praxia-gray-50">
          {/* Headline */}
          <h2 className="text-h1 mb-4">
            Ready to Build Your First AI Agent?
          </h2>

          {/* Subheadline */}
          <p className="text-body-lg text-muted-foreground max-w-xl mx-auto mb-10">
            Join companies saving 20+ hours per week with custom AI agents. Start with a free consultation.
          </p>

          {/* CTA Button */}
          <Button
            variant="accent"
            size="lg"
            className="group"
            onClick={() => {
              window.location.href = '/dashboard/onboarding';
            }}
          >
            Book a Demo
            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>

          {/* Subtext */}
          <p className="text-sm text-muted-foreground mt-6">
            No credit card required · 7-day sandbox access · 5 ready recipes
          </p>
        </div>
      </div>
    </section>
  );
}
