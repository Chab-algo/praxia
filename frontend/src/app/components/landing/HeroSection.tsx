'use client';

import { useRef, useEffect } from 'react';
import { useGSAP } from '@gsap/react';
import { ArrowRight } from 'lucide-react';
import Image from 'next/image';
import { motion, useInView } from 'framer-motion';
import { DiagonalPattern } from '@/components/landing/diagonal-pattern';
import { MetricCounter } from '@/components/landing/metric-counter';
import { Button } from '@/components/ui/button';
import { setupHeroParallax, setupMagneticButton } from '@/lib/gsap-animations';

export function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const ctaButtonRef = useRef<HTMLButtonElement>(null);
  const imageRef = useRef(null);
  const imageInView = useInView(imageRef, { once: true, margin: '-60px' });

  // Setup GSAP animations
  useGSAP(
    () => {
      // Hero parallax effect
      setupHeroParallax('.hero-content');
    },
    { scope: sectionRef }
  );

  // Setup magnetic button effect
  useEffect(() => {
    if (!ctaButtonRef.current) return;
    const cleanup = setupMagneticButton(ctaButtonRef.current);
    return cleanup;
  }, []);

  return (
    <section
      ref={sectionRef}
      className="hero-section relative min-h-[92vh] flex items-center justify-center overflow-hidden"
    >
      {/* Diagonal line background */}
      <DiagonalPattern />

      {/* Hero content */}
      <div className="hero-content relative z-10 container-custom text-center py-20">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-praxia-gray-50 border border-praxia-gray-200 text-praxia-gray-600 text-sm font-medium mb-8">
          <span className="w-2 h-2 bg-praxia-accent rounded-full animate-pulse" />
          AI Agent Studio — From Idea to Production
        </div>

        {/* Main headline */}
        <h1 className="text-display mb-6 max-w-4xl mx-auto">
          <span className="block">Production-Ready AI Agents.</span>
          <span className="block text-praxia-accent">Deployed in 48 Hours.</span>
        </h1>

        {/* Subheadline */}
        <p className="text-body-lg text-muted-foreground max-w-2xl mx-auto mb-10">
          PraxIA transforms business processes into production-grade AI agents. Choose a recipe,
          deploy, iterate.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <Button
            ref={ctaButtonRef}
            variant="primary"
            size="lg"
            className="cta-button group min-w-[200px]"
            onClick={() => {
              const ctaSection = document.getElementById('cta');
              ctaSection?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            Book a Demo
            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>

          <Button
            variant="secondary"
            size="lg"
            className="min-w-[200px]"
            onClick={() => {
              const recipesSection = document.getElementById('recipes');
              recipesSection?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            See Recipes
          </Button>
        </div>

        {/* Metrics */}
        <div className="metrics-container flex flex-wrap items-center justify-center gap-8 sm:gap-12 mb-20">
          <MetricCounter value={48} suffix="h" label="Time to deploy" delay={200} />
          <MetricCounter value={5} label="Ready recipes" delay={400} />
          <MetricCounter value={20} suffix="+" label="Hours saved/week" delay={600} />
        </div>

        {/* Hero Dashboard Screenshot */}
        <motion.div
          ref={imageRef}
          initial={{ opacity: 0, y: 40, scale: 0.97 }}
          animate={imageInView ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 40, scale: 0.97 }}
          transition={{ duration: 0.8, ease: [0.19, 1, 0.22, 1] }}
          className="relative mx-auto max-w-5xl"
        >
          {/* Glow effect behind image */}
          <div className="absolute -inset-4 rounded-2xl bg-praxia-accent/10 blur-3xl" />

          {/* Image container with border/shadow */}
          <div className="relative rounded-xl overflow-hidden border border-border shadow-2xl ring-1 ring-white/5">
            <Image
              src="/hero-dashboard.jpg"
              alt="PraxIA dashboard — create AI agents from recipes"
              width={1280}
              height={800}
              className="w-full h-auto object-cover"
              priority
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
