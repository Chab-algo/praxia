'use client';

import { useRef, useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform, useInView, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { ArrowRight, Play } from 'lucide-react';

/* ─────────────────────────────────────────────────────────────
   ANIMATED WORD — each word slides up from a clip mask
───────────────────────────────────────────────────────────── */
function RevealWord({ word, delay, accent = false }: { word: string; delay: number; accent?: boolean }) {
  return (
    <span className="inline-block overflow-hidden leading-none mr-[0.25em]">
      <motion.span
        className={`inline-block ${accent ? 'text-praxia-accent' : ''}`}
        initial={{ y: '100%', opacity: 0 }}
        animate={{ y: '0%', opacity: 1 }}
        transition={{ duration: 0.7, delay, ease: [0.19, 1, 0.22, 1] }}
      >
        {word}
      </motion.span>
    </span>
  );
}

/* ─────────────────────────────────────────────────────────────
   ROTATING WORDS — cycles through use cases
───────────────────────────────────────────────────────────── */
const USE_CASES = ['reviews', 'invoices', 'CVs', 'tickets', 'reports'];

function RotatingWord() {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setIndex((i) => (i + 1) % USE_CASES.length), 2200);
    return () => clearInterval(t);
  }, []);
  return (
    <span className="relative inline-block overflow-hidden h-[1.1em] align-bottom">
      <AnimatePresence mode="popLayout">
        <motion.span
          key={index}
          className="inline-block text-praxia-accent"
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -40, opacity: 0 }}
          transition={{ duration: 0.4, ease: [0.19, 1, 0.22, 1] }}
        >
          {USE_CASES[index]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

/* ─────────────────────────────────────────────────────────────
   STAT PILL
───────────────────────────────────────────────────────────── */
function StatPill({ value, label, delay }: { value: string; label: string; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.19, 1, 0.22, 1] }}
      className="flex flex-col"
    >
      <span className="text-3xl font-bold tracking-tight text-praxia-black">{value}</span>
      <span className="text-xs text-praxia-gray-400 mt-0.5 leading-tight">{label}</span>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────────
   FLOATING BADGE — small UI detail that floats over the image
───────────────────────────────────────────────────────────── */
function FloatingBadge({
  children, className, delay
}: { children: React.ReactNode; className: string; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay, duration: 0.5, type: 'spring', stiffness: 300, damping: 20 }}
      className={`absolute z-20 backdrop-blur-sm bg-white/90 border border-praxia-gray-200 rounded-xl shadow-lg px-4 py-3 ${className}`}
    >
      {children}
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────────
   HERO SECTION
───────────────────────────────────────────────────────────── */
export function HeroSection() {
  const imageRef = useRef(null);
  const imageInView = useInView(imageRef, { once: true });

  // Subtle mouse parallax on image
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 60, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 60, damping: 20 });
  const imgX = useTransform(springX, [-0.5, 0.5], [-12, 12]);
  const imgY = useTransform(springY, [-0.5, 0.5], [-8, 8]);

  function onMouseMove(e: React.MouseEvent) {
    const w = window.innerWidth, h = window.innerHeight;
    mouseX.set(e.clientX / w - 0.5);
    mouseY.set(e.clientY / h - 0.5);
  }

  return (
    <section
      className="relative overflow-hidden bg-praxia-gray-50 min-h-[100svh] flex items-center"
      onMouseMove={onMouseMove}
    >
      {/* Subtle grid background */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage: `linear-gradient(rgb(10,10,10) 1px, transparent 1px), linear-gradient(90deg, rgb(10,10,10) 1px, transparent 1px)`,
          backgroundSize: '48px 48px',
        }}
      />

      {/* Ambient glow top-right */}
      <div className="pointer-events-none absolute top-0 right-0 w-[700px] h-[500px] rounded-full bg-praxia-accent/6 blur-[120px]" />

      <div className="container-custom relative z-10 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 xl:gap-20 items-center py-20 lg:py-0 min-h-[100svh]">

          {/* ── LEFT COLUMN ── */}
          <div className="flex flex-col justify-center">

            {/* Status badge */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="inline-flex items-center gap-2 self-start mb-10 rounded-full border border-praxia-gray-200 bg-white px-4 py-1.5 text-xs font-semibold text-praxia-gray-600 shadow-sm"
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-praxia-accent opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-praxia-accent" />
              </span>
              5 agents ready to deploy now
            </motion.div>

            {/* Headline — word-by-word reveal */}
            <h1 className="text-[3.2rem] sm:text-[4rem] xl:text-[4.8rem] font-bold leading-[1.04] tracking-tight mb-6">
              <div>
                <RevealWord word="Stop" delay={0.2} />
                <RevealWord word="doing" delay={0.28} />
              </div>
              <div>
                <RevealWord word="your" delay={0.36} />
                <span className="inline-block overflow-hidden leading-none mr-[0.25em]">
                  <motion.span
                    className="inline-block"
                    initial={{ y: '100%', opacity: 0 }}
                    animate={{ y: '0%', opacity: 1 }}
                    transition={{ duration: 0.7, delay: 0.44, ease: [0.19, 1, 0.22, 1] }}
                  >
                    <RotatingWord />
                  </motion.span>
                </span>
              </div>
              <div>
                <RevealWord word="by" delay={0.52} />
                <RevealWord word="hand." delay={0.60} />
              </div>
            </h1>

            {/* Subline */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.85 }}
              className="text-lg text-praxia-gray-600 leading-relaxed max-w-md mb-10"
            >
              PraxIA turns your most repetitive tasks into production-grade AI agents.
              Pick a recipe, customize, ship — in minutes.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1.0 }}
              className="flex flex-wrap items-center gap-4 mb-14"
            >
              <a
                href="/sign-up"
                className="group relative inline-flex items-center gap-2 rounded-full bg-praxia-black px-7 py-3.5 text-sm font-semibold text-white shadow-lg transition-all duration-200 hover:bg-praxia-charcoal hover:shadow-xl hover:-translate-y-0.5 active:scale-[0.98]"
              >
                Start for free
                <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
              </a>
              <a
                href="#features"
                className="group inline-flex items-center gap-2 rounded-full border border-praxia-gray-200 bg-white px-6 py-3.5 text-sm font-semibold text-praxia-gray-700 transition-all duration-200 hover:border-praxia-gray-400 hover:-translate-y-0.5"
              >
                <Play className="h-3.5 w-3.5 fill-praxia-accent text-praxia-accent" />
                See it in action
              </a>
            </motion.div>

            {/* Stats row */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 1.15 }}
              className="flex items-center gap-8 pt-8 border-t border-praxia-gray-200"
            >
              <StatPill value="5 min" label="Average deploy time" delay={1.2} />
              <div className="h-8 w-px bg-praxia-gray-200" />
              <StatPill value="5" label="Ready-made recipes" delay={1.3} />
              <div className="h-8 w-px bg-praxia-gray-200" />
              <StatPill value="20h+" label="Saved per week" delay={1.4} />
            </motion.div>
          </div>

          {/* ── RIGHT COLUMN — image with floating badges ── */}
          <div ref={imageRef} className="relative hidden lg:flex items-center justify-center">

            {/* Subtle bg blob behind image */}
            <div className="absolute inset-8 rounded-3xl bg-praxia-accent/8 blur-2xl" />

            {/* Main image */}
            <motion.div
              style={{ x: imgX, y: imgY }}
              initial={{ opacity: 0, scale: 0.94, y: 30 }}
              animate={imageInView ? { opacity: 1, scale: 1, y: 0 } : {}}
              transition={{ duration: 0.9, ease: [0.19, 1, 0.22, 1], delay: 0.3 }}
              className="relative w-full"
            >
              <div className="rounded-2xl overflow-hidden border border-praxia-gray-200 shadow-2xl ring-1 ring-black/5">
                <Image
                  src="/hero-dashboard.jpg"
                  alt="PraxIA — AI agent dashboard"
                  width={1280}
                  height={800}
                  className="w-full h-auto block"
                  priority
                />
              </div>
            </motion.div>

            {/* Floating badge — top left */}
            <FloatingBadge className="-left-6 top-12" delay={1.1}>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-praxia-success/10 flex items-center justify-center text-base">✓</div>
                <div>
                  <p className="text-xs font-bold text-praxia-black">Agent deployed</p>
                  <p className="text-[10px] text-praxia-gray-400">Review Responder · 3 min ago</p>
                </div>
              </div>
            </FloatingBadge>

            {/* Floating badge — bottom right */}
            <FloatingBadge className="-right-4 bottom-16" delay={1.3}>
              <div className="flex items-center gap-3">
                <div className="text-xl">⚡</div>
                <div>
                  <p className="text-xs font-bold text-praxia-black">247 tasks automated</p>
                  <p className="text-[10px] text-praxia-gray-400">This week · $0.003 avg cost</p>
                </div>
              </div>
            </FloatingBadge>
          </div>

        </div>
      </div>
    </section>
  );
}
