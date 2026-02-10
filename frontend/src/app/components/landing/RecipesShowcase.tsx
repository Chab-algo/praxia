'use client';

import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { RecipeCard } from '@/components/landing/recipe-card';
import { setupSectionReveal } from '@/lib/gsap-animations';
import { ArrowRight } from 'lucide-react';

const RECIPES = [
  {
    title: 'Review Responder',
    slug: 'review-responder',
    description:
      'Automatically respond to customer reviews with personalized, sentiment-aware messages that maintain brand voice.',
    category: 'E-commerce',
    estimatedTime: '~2min/review',
  },
  {
    title: 'CV Screener',
    slug: 'cv-screener',
    description:
      'Screen resumes against job requirements, extracting key qualifications and ranking candidates automatically.',
    category: 'HR',
    estimatedTime: '~30s/CV',
  },
  {
    title: 'Support Ticket Classifier',
    slug: 'support-ticket-classifier',
    description:
      'Intelligently categorize and route support tickets to the right team based on content and urgency.',
    category: 'Support',
    estimatedTime: '~10s/ticket',
  },
  {
    title: 'Invoice Analyzer',
    slug: 'invoice-analyzer',
    description:
      'Extract and validate invoice data automatically, flagging discrepancies and routing for approval.',
    category: 'Finance',
    estimatedTime: '~1min/invoice',
  },
  {
    title: 'Social Post Generator',
    slug: 'social-post-generator',
    description:
      'Generate engaging social media content from blog posts or product descriptions across multiple platforms.',
    category: 'Marketing',
    estimatedTime: '~2min/post',
  },
];

export function RecipesShowcase() {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      setupSectionReveal('.recipes-header');
    },
    { scope: sectionRef }
  );

  return (
    <section ref={sectionRef} className="section-spacing bg-praxia-gray-50" id="recipes">
      <div className="container-custom">
        {/* Header */}
        <div className="recipes-header text-center mb-12">
          <h2 className="text-h1 mb-4">Battle-Tested Recipes</h2>
          <p className="text-body-lg text-muted-foreground max-w-2xl mx-auto">
            Pre-built AI agents ready to deploy. Customize to your needs in minutes.
          </p>
        </div>

        {/* Horizontal scroll container */}
        <div className="relative">
          <div className="overflow-x-auto scrollbar-hide">
            <div className="flex gap-6 pb-6 snap-x snap-mandatory min-w-max">
              {RECIPES.map((recipe) => (
                <RecipeCard key={recipe.slug} {...recipe} />
              ))}
            </div>
          </div>

          {/* Scroll hint */}
          <div className="flex items-center justify-center mt-6 text-sm text-muted-foreground">
            <span className="mr-2">Scroll to explore</span>
            <ArrowRight className="w-4 h-4 animate-pulse" />
          </div>
        </div>

        {/* View all link */}
        <div className="text-center mt-12">
          <a
            href="/dashboard/recipes"
            className="inline-flex items-center gap-2 text-praxia-accent font-medium hover:gap-3 transition-all"
          >
            View all recipes
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    </section>
  );
}
