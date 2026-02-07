'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Search, FlaskConical, Rocket, Activity } from 'lucide-react';

const STEPS = [
  {
    icon: Search,
    title: 'Discovery',
    description: 'We analyze your process and match you with the best recipe template.',
    color: '#0ea5e9',
  },
  {
    icon: FlaskConical,
    title: 'Test',
    description: 'Customize prompts, test with your data, iterate until perfect.',
    color: '#8b5cf6',
  },
  {
    icon: Rocket,
    title: 'Deploy',
    description: 'One-click deployment to production with monitoring built in.',
    color: '#f97316',
  },
  {
    icon: Activity,
    title: 'Monitor',
    description: 'Real-time analytics, cost tracking, and continuous improvement.',
    color: '#10b981',
  },
];

export function HowItWorks() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section ref={ref} className="py-24 sm:py-32 bg-gray-50/50" id="how-it-works">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <p className="text-xs font-medium text-violet-500 uppercase tracking-[0.2em] mb-3">
            Simple Process
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            From Idea to Production in{' '}
            <span className="gradient-text">48 Hours</span>
          </h2>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            A proven 4-step process to get your AI agent live, fast.
          </p>
        </motion.div>

        <div className="relative">
          {/* Animated connector line (desktop) */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={isInView ? { scaleX: 1 } : {}}
            transition={{ duration: 1.2, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="hidden lg:block absolute top-[52px] left-[14%] right-[14%] h-px origin-left"
            style={{
              background: 'linear-gradient(90deg, #0ea5e9, #8b5cf6, #f97316, #10b981)',
              opacity: 0.3,
            }}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6">
            {STEPS.map((step, i) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={step.title}
                  initial={{ opacity: 0, y: 30 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.5, delay: 0.15 * i + 0.2 }}
                  className="relative text-center group"
                >
                  <div className="relative inline-flex items-center justify-center mb-6">
                    {/* Pulse ring on hover */}
                    <div
                      className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-ping"
                      style={{
                        backgroundColor: `${step.color}10`,
                        animationDuration: '2s',
                      }}
                    />
                    <div
                      className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-sm relative transition-transform duration-300 group-hover:scale-110"
                      style={{ backgroundColor: `${step.color}10` }}
                    >
                      <Icon className="w-7 h-7" style={{ color: step.color }} />
                    </div>
                    <span
                      className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-sm"
                      style={{ backgroundColor: step.color }}
                    >
                      {i + 1}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-gray-900 mb-2">{step.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed max-w-[220px] mx-auto">
                    {step.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
