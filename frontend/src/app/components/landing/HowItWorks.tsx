'use client';

import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { Search, FlaskConical, Rocket, Activity } from 'lucide-react';
import { setupTimelineScroll } from '@/lib/gsap-animations';

const STEPS = [
  {
    icon: Search,
    number: '01',
    title: 'Discovery',
    description: 'We analyze your process and match you with the best recipe template.',
  },
  {
    icon: FlaskConical,
    number: '02',
    title: 'Test',
    description: 'Customize prompts, test with your data, iterate until perfect.',
  },
  {
    icon: Rocket,
    number: '03',
    title: 'Deploy',
    description: 'One-click deployment to production with monitoring built in.',
  },
  {
    icon: Activity,
    number: '04',
    title: 'Monitor',
    description: 'Real-time analytics, cost tracking, and continuous improvement.',
  },
];

export function HowItWorks() {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      setupTimelineScroll();
    },
    { scope: sectionRef }
  );

  return (
    <section
      ref={sectionRef}
      className="how-it-works-section section-spacing relative"
      id="how-it-works"
    >
      <div className="container-narrow">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-h1 mb-4">
            From Idea to Production in <span className="text-praxia-accent">48 Hours</span>
          </h2>
          <p className="text-body-lg text-muted-foreground">
            A proven 4-step process to get your AI agent live, fast.
          </p>
        </div>

        {/* Timeline container */}
        <div className="timeline-container relative">
          {/* Progress line */}
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-praxia-gray-200">
            <div className="timeline-progress absolute inset-0 bg-praxia-accent origin-top" />
          </div>

          {/* Steps */}
          <div className="space-y-12">
            {STEPS.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={step.number} className="timeline-step relative pl-20">
                  {/* Step number indicator */}
                  <div className="absolute left-0 w-16 h-16 rounded-full bg-praxia-gray-50 border-2 border-praxia-accent flex items-center justify-center">
                    <span className="text-lg font-mono font-bold text-praxia-accent">
                      {step.number}
                    </span>
                  </div>

                  {/* Content card */}
                  <div className="border border-border rounded-md p-6 bg-card hover:border-praxia-accent transition-colors">
                    <div className="flex items-start gap-4">
                      {/* Icon */}
                      <div className="w-12 h-12 rounded-lg bg-praxia-accent/10 flex items-center justify-center flex-shrink-0">
                        <Icon className="w-6 h-6 text-praxia-accent" />
                      </div>

                      {/* Text */}
                      <div className="flex-grow">
                        <h3 className="text-h3 mb-2">{step.title}</h3>
                        <p className="text-body text-muted-foreground">{step.description}</p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
