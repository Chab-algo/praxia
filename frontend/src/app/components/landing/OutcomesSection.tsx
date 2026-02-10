'use client';

import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { TrendingUp, Clock, Zap } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { setupSectionReveal } from '@/lib/gsap-animations';

const OUTCOMES = [
  {
    icon: TrendingUp,
    title: 'Review Responder',
    category: 'E-commerce',
    metric: '15h/week saved',
    description: 'Automated review responses with sentiment analysis and personalized messaging.',
  },
  {
    icon: Clock,
    title: 'CV Screener',
    category: 'HR',
    metric: '20h/week saved',
    description: 'Intelligent resume screening matching candidates to job requirements.',
  },
  {
    icon: Zap,
    title: 'Invoice Analyzer',
    category: 'Finance',
    metric: '10h/week saved',
    description: 'Automated invoice parsing, validation, and extraction with 99% accuracy.',
  },
];

export function OutcomesSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      setupSectionReveal('.outcome-card');
    },
    { scope: sectionRef }
  );

  return (
    <section ref={sectionRef} className="section-spacing" id="outcomes">
      <div className="container-custom">
        {/* Header */}
        <div className="text-center mb-12 reveal-section">
          <h2 className="text-h1 mb-4">Real Impact, Measurable Results</h2>
          <p className="text-body-lg text-muted-foreground max-w-2xl mx-auto">
            See how PraxIA agents transform operations across industries.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {OUTCOMES.map((outcome, index) => {
            const Icon = outcome.icon;
            return (
              <Card
                key={outcome.title}
                accent="left"
                hoverable
                className="outcome-card group"
              >
                {/* Icon & Category */}
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-lg bg-praxia-gray-50 flex items-center justify-center group-hover:bg-praxia-accent/10 transition-colors">
                    <Icon className="w-6 h-6 text-praxia-accent" />
                  </div>
                  <span className="text-xs font-mono uppercase text-muted-foreground">
                    {outcome.category}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-h4 mb-2">{outcome.title}</h3>

                {/* Description */}
                <p className="text-body-sm text-muted-foreground mb-4">
                  {outcome.description}
                </p>

                {/* Metric */}
                <div className="mt-auto pt-4 border-t border-border">
                  <div className="font-mono text-2xl font-bold text-praxia-accent">
                    {outcome.metric}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
