'use client';

import { motion, useInView } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';
import { TrendingUp, Clock, Zap } from 'lucide-react';

const OUTCOMES = [
  {
    icon: TrendingUp,
    title: 'Review Responder',
    category: 'E-commerce',
    metric: 15,
    metricSuffix: 'h/week',
    metricLabel: 'saved per operator',
    description: 'Automated review responses with sentiment analysis and personalized messaging.',
    barWidths: [45, 60, 72, 80, 88, 92],
    color: '#0ea5e9',
  },
  {
    icon: Clock,
    title: 'CV Screener',
    category: 'HR',
    metric: 20,
    metricSuffix: 'h/week',
    metricLabel: 'saved per recruiter',
    description: 'Intelligent resume screening matching candidates to job requirements with precision.',
    barWidths: [50, 65, 70, 82, 90, 95],
    color: '#8b5cf6',
  },
  {
    icon: Zap,
    title: 'Invoice Analyzer',
    category: 'Finance',
    metric: 10,
    metricSuffix: 'h/week',
    metricLabel: 'saved per accountant',
    description: 'Automated invoice parsing, validation, and data extraction with 99% accuracy.',
    barWidths: [40, 55, 68, 78, 85, 90],
    color: '#f97316',
  },
];

function AnimatedBar({ width, color, delay, animate }: { width: number; color: string; delay: number; animate: boolean }) {
  return (
    <div
      className="flex-1 rounded-sm transition-all"
      style={{
        height: animate ? `${width}%` : '8%',
        backgroundColor: color,
        opacity: animate ? 0.3 + (width / 100) * 0.7 : 0.1,
        transitionDuration: '800ms',
        transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        transitionDelay: `${delay}ms`,
      }}
    />
  );
}

function MiniChart({ widths, color, animate }: { widths: number[]; color: string; animate: boolean }) {
  return (
    <div className="flex items-end gap-1.5 h-20 mt-4">
      {widths.map((w, i) => (
        <AnimatedBar key={i} width={w} color={color} delay={i * 80} animate={animate} />
      ))}
    </div>
  );
}

export function OutcomesSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section ref={ref} className="py-24 sm:py-32 bg-gray-50/50" id="outcomes">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <p className="text-xs font-medium text-violet-500 uppercase tracking-[0.2em] mb-3">
            Real Results
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Measurable <span className="gradient-text">Outcomes</span>
          </h2>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            Enterprise AI agents delivered with measurable outcomes from day one
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {OUTCOMES.map((outcome, i) => {
            const Icon = outcome.icon;
            return (
              <motion.div
                key={outcome.title}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.15 * i }}
                className="group glass-card rounded-2xl p-6 sm:p-8 hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 relative overflow-hidden"
              >
                {/* Hover gradient glow */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{
                    background: `radial-gradient(circle at 50% 100%, ${outcome.color}08, transparent 70%)`,
                  }}
                />

                <div className="relative">
                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: `${outcome.color}15` }}
                    >
                      <Icon className="w-5 h-5" style={{ color: outcome.color }} />
                    </div>
                    <span
                      className="text-xs font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full"
                      style={{
                        backgroundColor: `${outcome.color}10`,
                        color: outcome.color,
                      }}
                    >
                      {outcome.category}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 mb-2">{outcome.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed mb-2">
                    {outcome.description}
                  </p>

                  <MiniChart widths={outcome.barWidths} color={outcome.color} animate={isInView} />

                  <div className="mt-4 pt-4 border-t border-gray-100 flex items-baseline gap-1">
                    <span className="text-2xl font-bold" style={{ color: outcome.color }}>
                      {outcome.metric}{outcome.metricSuffix}
                    </span>
                    <span className="text-sm text-gray-400">{outcome.metricLabel}</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
