'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import {
  MessageSquare,
  FileText,
  Receipt,
  ShieldCheck,
  BarChart3,
  ArrowRight,
} from 'lucide-react';

const RECIPES = [
  {
    icon: MessageSquare,
    title: 'Review Responder',
    slug: 'review-responder',
    category: 'E-commerce',
    description:
      'Automatically analyze customer reviews and generate personalized, on-brand responses.',
    color: '#0ea5e9',
  },
  {
    icon: FileText,
    title: 'CV Screener',
    slug: 'cv-screener',
    category: 'HR',
    description:
      'Screen resumes against job requirements and rank candidates with detailed scoring.',
    color: '#8b5cf6',
  },
  {
    icon: Receipt,
    title: 'Invoice Analyzer',
    slug: 'invoice-analyzer',
    category: 'Finance',
    description:
      'Extract, validate, and categorize invoice data with near-perfect accuracy.',
    color: '#f97316',
  },
  {
    icon: ShieldCheck,
    title: 'Compliance Checker',
    slug: 'compliance-checker',
    category: 'Legal',
    description:
      'Scan documents for regulatory compliance issues and generate actionable reports.',
    color: '#10b981',
  },
  {
    icon: BarChart3,
    title: 'Report Generator',
    slug: 'report-generator',
    category: 'Analytics',
    description:
      'Transform raw data into polished, insight-rich executive reports automatically.',
    color: '#ec4899',
  },
];

export function RecipesShowcase() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section ref={ref} className="py-24 sm:py-32" id="recipes">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <p className="text-xs font-medium text-violet-500 uppercase tracking-[0.2em] mb-3">
            Ready to Deploy
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            5 Battle-Tested <span className="gradient-text">Recipes</span>
          </h2>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            Ready-to-deploy AI agent templates. Pick one, customize it, go live.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {RECIPES.map((recipe, i) => {
            const Icon = recipe.icon;
            return (
              <motion.a
                key={recipe.slug}
                href={`/dashboard/recipes/${recipe.slug}`}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.45, delay: 0.08 * i }}
                className="group relative rounded-2xl border border-gray-200/80 bg-white p-6 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl"
              >
                {/* Gradient border on hover */}
                <div
                  className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"
                  style={{
                    background: `linear-gradient(135deg, ${recipe.color}15, transparent 60%)`,
                  }}
                />

                <div className="flex items-start justify-between mb-5">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
                    style={{ backgroundColor: `${recipe.color}12` }}
                  >
                    <Icon className="w-6 h-6" style={{ color: recipe.color }} />
                  </div>
                  <span
                    className="text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full"
                    style={{
                      backgroundColor: `${recipe.color}10`,
                      color: recipe.color,
                    }}
                  >
                    {recipe.category}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-gray-900 mb-2">{recipe.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed mb-5">
                  {recipe.description}
                </p>

                <div className="flex items-center gap-1.5 text-sm font-medium text-gray-400 group-hover:text-gray-700 transition-colors duration-200">
                  Learn more
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform duration-200" />
                </div>
              </motion.a>
            );
          })}
        </div>
      </div>
    </section>
  );
}
