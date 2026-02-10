'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';

/* ─── Rotating verb ─────────────────────────────────────── */
const VERBS = ['reviews', 'invoices', 'CVs', 'tickets', 'reports'];

function RotatingVerb() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((n) => (n + 1) % VERBS.length), 2000);
    return () => clearInterval(t);
  }, []);
  return (
    <span className="relative inline-flex h-[1.1em] overflow-hidden align-bottom">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={i}
          className="absolute inset-0 flex items-center text-praxia-accent"
          initial={{ y: '110%' }}
          animate={{ y: '0%' }}
          exit={{ y: '-110%' }}
          transition={{ duration: 0.38, ease: [0.19, 1, 0.22, 1] }}
        >
          {VERBS[i]}
        </motion.span>
      </AnimatePresence>
      {/* Invisible spacer: widest word */}
      <span className="invisible">invoices</span>
    </span>
  );
}

/* ─── Floating badge ────────────────────────────────────── */
function Badge({ icon, title, sub, className, delay }: {
  icon: string; title: string; sub: string; className: string; delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, duration: 0.5, type: 'spring', stiffness: 260, damping: 22 }}
      className={`absolute z-10 flex items-center gap-3 rounded-2xl border border-white/60 bg-white/80 px-4 py-3 shadow-xl backdrop-blur-md ${className}`}
    >
      <span className="text-xl leading-none">{icon}</span>
      <div>
        <p className="text-xs font-bold text-praxia-black leading-tight">{title}</p>
        <p className="text-[10px] text-praxia-gray-400 leading-tight mt-0.5">{sub}</p>
      </div>
    </motion.div>
  );
}

/* ─── Main ──────────────────────────────────────────────── */
export function HeroSection() {
  const imgRef = useRef(null);
  const imgInView = useInView(imgRef, { once: true, margin: '-40px' });

  return (
    <section className="relative overflow-hidden bg-white">

      {/* ── very subtle dot-grid background ── */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: 'radial-gradient(circle, #0a0a0a 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
      />

      {/* ── top amber glow ── */}
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[520px] w-[900px] -translate-x-1/2 rounded-full bg-praxia-accent/10 blur-[140px]" />

      <div className="relative z-10">

        {/* ════════════════════════════════════
            TOP — centred headline block
        ════════════════════════════════════ */}
        <div className="container-custom pt-28 pb-16 text-center">

          {/* Status pill */}
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.19, 1, 0.22, 1] }}
            className="mx-auto mb-10 inline-flex items-center gap-2 rounded-full border border-praxia-gray-200 bg-praxia-gray-50 px-4 py-1.5 text-xs font-semibold text-praxia-gray-600"
          >
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-praxia-accent opacity-70" />
              <span className="relative h-2 w-2 rounded-full bg-praxia-accent" />
            </span>
            5 agents ready to deploy · no code required
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15, ease: [0.19, 1, 0.22, 1] }}
            className="mx-auto max-w-4xl text-[3.6rem] sm:text-[5rem] xl:text-[5.8rem] font-bold leading-[1.0] tracking-[-0.03em] text-praxia-black"
          >
            Automate your
            <br />
            <span className="inline-flex items-baseline gap-3">
              <RotatingVerb />
              <span className="text-praxia-black">— today.</span>
            </span>
          </motion.h1>

          {/* Sub */}
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4, ease: [0.19, 1, 0.22, 1] }}
            className="mx-auto mt-7 max-w-xl text-lg text-praxia-gray-600 leading-relaxed"
          >
            PraxIA turns your most repetitive business tasks into
            production-grade AI agents. Pick a recipe, deploy in minutes,
            save hours every week.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6, ease: [0.19, 1, 0.22, 1] }}
            className="mt-10 flex flex-wrap items-center justify-center gap-4"
          >
            <a
              href="/sign-up"
              className="group inline-flex items-center gap-2 rounded-full bg-praxia-black px-8 py-4 text-sm font-semibold text-white shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl active:scale-[0.97]"
            >
              Start for free
              <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
            </a>
            <a
              href="#features"
              className="inline-flex items-center gap-2 rounded-full border border-praxia-gray-200 bg-white px-8 py-4 text-sm font-semibold text-praxia-gray-700 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-praxia-gray-400"
            >
              See features
            </a>
          </motion.div>

          {/* Social proof row */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.85 }}
            className="mt-10 flex flex-wrap items-center justify-center gap-6 text-xs text-praxia-gray-400"
          >
            <span className="flex items-center gap-1.5">
              <span className="text-praxia-success font-bold text-sm">✓</span>
              Deploy in 5 minutes
            </span>
            <span className="h-3 w-px bg-praxia-gray-200" />
            <span className="flex items-center gap-1.5">
              <span className="text-praxia-success font-bold text-sm">✓</span>
              No code required
            </span>
            <span className="h-3 w-px bg-praxia-gray-200" />
            <span className="flex items-center gap-1.5">
              <span className="text-praxia-success font-bold text-sm">✓</span>
              From $0.001 per task
            </span>
          </motion.div>
        </div>

        {/* ════════════════════════════════════
            BOTTOM — full-width dashboard shot
        ════════════════════════════════════ */}
        <div className="container-custom pb-0">
          <motion.div
            ref={imgRef}
            initial={{ opacity: 0, y: 48 }}
            animate={imgInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.9, ease: [0.19, 1, 0.22, 1], delay: 0.2 }}
            className="relative"
          >
            {/* Glow under image */}
            <div className="absolute -bottom-8 left-1/2 h-24 w-3/4 -translate-x-1/2 rounded-full bg-praxia-accent/15 blur-3xl" />

            {/* Frame */}
            <div className="relative rounded-t-2xl overflow-hidden border border-b-0 border-praxia-gray-200 shadow-[0_-8px_40px_-12px_rgba(0,0,0,0.15)] ring-1 ring-black/[0.04]">

              {/* Fake browser chrome */}
              <div className="flex items-center gap-2 border-b border-praxia-gray-100 bg-praxia-gray-50 px-5 py-3">
                <span className="h-3 w-3 rounded-full bg-red-400/80" />
                <span className="h-3 w-3 rounded-full bg-yellow-400/80" />
                <span className="h-3 w-3 rounded-full bg-green-400/80" />
                <div className="mx-4 flex-1 max-w-xs rounded-md bg-praxia-gray-200/60 px-3 py-1 text-[11px] text-praxia-gray-400 font-mono">
                  app.praxia.ai/dashboard
                </div>
              </div>

              <Image
                src="/hero-dashboard.jpg"
                alt="PraxIA dashboard"
                width={1400}
                height={900}
                className="w-full h-auto block"
                priority
              />

              {/* Badge: top-left over image */}
              <Badge
                icon="✅"
                title="Agent deployed"
                sub="Review Responder · just now"
                className="left-8 top-16"
                delay={1.1}
              />

              {/* Badge: bottom-right over image */}
              <Badge
                icon="⚡"
                title="247 tasks automated"
                sub="This week · avg $0.003 / task"
                className="right-8 bottom-8"
                delay={1.3}
              />
            </div>
          </motion.div>
        </div>

      </div>
    </section>
  );
}
