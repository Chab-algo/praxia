'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Search, FlaskConical, Rocket, Activity } from 'lucide-react';

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

function StepCard({ step, index }: { step: typeof STEPS[0]; index: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  const Icon = step.icon;

  return (
    <motion.div
      ref={ref}
      className="timeline-step relative pl-20"
      initial={{ opacity: 0, x: -40 }}
      animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -40 }}
      transition={{ duration: 0.5, delay: index * 0.1, ease: [0.19, 1, 0.22, 1] }}
    >
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
    </motion.div>
  );
}

export function HowItWorks() {
  const headerRef = useRef(null);
  const headerInView = useInView(headerRef, { once: true, margin: '-80px' });

  return (
    <section className="section-spacing relative" id="how-it-works">
      <div className="container-narrow">
        {/* Header */}
        <motion.div
          ref={headerRef}
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={headerInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5, ease: [0.19, 1, 0.22, 1] }}
        >
          <h2 className="text-h1 mb-4">
            From Idea to Production in{' '}
            <span className="text-praxia-accent">48 Hours</span>
          </h2>
          <p className="text-body-lg text-muted-foreground">
            A proven 4-step process to get your AI agent live, fast.
          </p>
        </motion.div>

        {/* Timeline container */}
        <div className="relative">
          {/* Progress line */}
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-praxia-gray-200" />

          {/* Steps */}
          <div className="space-y-12">
            {STEPS.map((step, index) => (
              <StepCard key={step.number} step={step} index={index} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
