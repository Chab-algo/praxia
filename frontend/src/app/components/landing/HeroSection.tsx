'use client';

import { useRef, useState } from 'react';
import { motion, useInView, useMotionValue, useSpring, useTransform } from 'framer-motion';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';

/* ─── Noise grain overlay for material depth ─── */
function Grain() {
  return (
    <svg className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.03] mix-blend-multiply" aria-hidden>
      <filter id="grain">
        <feTurbulence type="fractalNoise" baseFrequency="0.7" numOctaves="3" stitchTiles="stitch" />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect width="100%" height="100%" filter="url(#grain)" />
    </svg>
  );
}

/* ─── Animated stat pill ─── */
function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1 px-8 py-3">
      <span className="text-3xl font-bold tracking-tight text-praxia-black font-mono">{value}</span>
      <span className="text-[10px] text-praxia-gray-400 uppercase tracking-[0.15em] font-semibold">{label}</span>
    </div>
  );
}

/* ─── Floating UI badge ─── */
function FloatBadge({
  icon, title, sub, delay, side,
}: {
  icon: React.ReactNode; title: string; sub: string; delay: number; side: 'left' | 'right';
}) {
  const inView = useInView({ current: null } as any, { once: true });
  return (
    <motion.div
      initial={{ opacity: 0, x: side === 'left' ? -20 : 20, y: 8 }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{ delay, duration: 0.55, type: 'spring', stiffness: 180, damping: 18 }}
      className={`absolute top-6 z-10 flex items-center gap-3 rounded-2xl border border-white/60 bg-white/88 px-4 py-3 shadow-2xl shadow-black/10 backdrop-blur-xl ${side === 'left' ? 'left-6' : 'right-6'}`}
    >
      {icon}
      <div>
        <p className="text-xs font-bold leading-tight text-praxia-black">{title}</p>
        <p className="mt-0.5 text-[10px] leading-tight text-praxia-gray-400">{sub}</p>
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════
   HERO SECTION
═══════════════════════════════════════ */
export function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const imgRef = useRef(null);
  const imgInView = useInView(imgRef, { once: true, margin: '-40px' });

  /* Mouse-tracked parallax */
  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const smx = useSpring(mx, { stiffness: 40, damping: 18 });
  const smy = useSpring(my, { stiffness: 40, damping: 18 });

  /* Glow blob follows cursor */
  const glowLeft = useTransform(smx, [0, 1], ['10%', '70%']);
  const glowTop  = useTransform(smy, [0, 1], ['0%',  '50%']);

  /* Image gentle tilt */
  const imgRY = useTransform(smx, [0, 1], [ 2, -2]);
  const imgRX = useTransform(smy, [0, 1], [-1,  1]);

  function handleMouseMove(e: React.MouseEvent<HTMLElement>) {
    const r = sectionRef.current?.getBoundingClientRect();
    if (!r) return;
    mx.set((e.clientX - r.left) / r.width);
    my.set((e.clientY - r.top)  / r.height);
  }

  return (
    <section
      ref={sectionRef}
      onMouseMove={handleMouseMove}
      className="relative overflow-hidden bg-[#fafafa]"
    >
      <Grain />

      {/* ── PRIMARY AMBER GLOW — follows cursor ── */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute h-[800px] w-[800px] rounded-full"
        style={{
          left: glowLeft,
          top: glowTop,
          x: '-50%',
          y: '-30%',
          background:
            'radial-gradient(circle, rgba(251,191,36,0.22) 0%, rgba(217,119,6,0.14) 35%, rgba(217,119,6,0.04) 65%, transparent 80%)',
          filter: 'blur(72px)',
        }}
      />

      {/* ── SECONDARY STATIC GLOW — bottom-left ── */}
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-40 -left-20 h-[500px] w-[500px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(217,119,6,0.09) 0%, transparent 70%)',
          filter: 'blur(80px)',
        }}
      />

      <div className="relative z-10 container-custom">

        {/* ══════════════ HEADLINE BLOCK ══════════════ */}
        <div className="flex flex-col items-center pt-28 pb-16 text-center">

          {/* Status pill — warm amber tint */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-10 inline-flex items-center gap-2.5 rounded-full border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50/60 px-5 py-2 text-xs font-semibold text-amber-700 shadow-sm shadow-amber-100/50"
          >
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-500 opacity-60" />
              <span className="relative h-2 w-2 rounded-full bg-amber-500" />
            </span>
            5 agents prêts · zéro code
          </motion.div>

          {/* ── HEADLINE ── */}
          <motion.h1
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, delay: 0.1, ease: [0.19, 1, 0.22, 1] }}
            className="max-w-[16ch] text-[clamp(2.8rem,5.5vw,5.2rem)] font-bold leading-[1.04] tracking-[-0.035em] text-praxia-black"
          >
            Your business,{' '}
            <span
              className="bg-clip-text text-transparent"
              style={{
                backgroundImage:
                  'linear-gradient(130deg, #b45309 0%, #d97706 35%, #f59e0b 60%, #d97706 100%)',
              }}
            >
              on autopilot.
            </span>
          </motion.h1>

          {/* Subline */}
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.32, ease: [0.19, 1, 0.22, 1] }}
            className="mt-7 max-w-[44ch] text-[1.05rem] leading-[1.7] text-praxia-gray-600"
          >
            PraxIA transforme vos tâches répétitives — avis clients, factures,
            CVs — en agents IA prêts pour la production.{' '}
            <span className="font-semibold text-praxia-black">
              Déployez en 5 minutes. Économisez 20h par semaine.
            </span>
          </motion.p>

          {/* ── CTA BUTTONS ── */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5, ease: [0.19, 1, 0.22, 1] }}
            className="mt-10 flex flex-wrap items-center justify-center gap-3"
          >
            {/* Primary — dark pill with shimmer sweep */}
            <a
              href="/sign-up"
              className="group relative inline-flex items-center gap-2.5 overflow-hidden rounded-full bg-praxia-black px-8 py-[0.95rem] text-sm font-semibold text-white shadow-lg shadow-black/25 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-black/30 active:scale-[0.97]"
            >
              <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/[0.08] to-transparent transition-transform duration-700 group-hover:translate-x-full" />
              Commencer gratuitement
              <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
            </a>

            {/* Secondary — glass tinted amber */}
            <a
              href="#features"
              className="inline-flex items-center gap-2 rounded-full border border-amber-200/80 bg-white/75 px-7 py-[0.95rem] text-sm font-semibold text-praxia-gray-700 shadow-sm backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-amber-300 hover:bg-white"
            >
              Voir les fonctionnalités
            </a>
          </motion.div>

          {/* ── STATS PILL ── */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
            className="mt-14 inline-flex items-stretch divide-x divide-praxia-gray-100 rounded-2xl border border-praxia-gray-200/70 bg-white/80 shadow-sm backdrop-blur-sm"
          >
            <Stat value="5 min"  label="deploy time"  />
            <Stat value="5"      label="recipes"       />
            <Stat value="20h+"   label="saved / week"  />
          </motion.div>
        </div>

        {/* ══════════════ SCREENSHOT ══════════════ */}
        <motion.div
          ref={imgRef}
          initial={{ opacity: 0, y: 56 }}
          animate={imgInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1.1, ease: [0.19, 1, 0.22, 1], delay: 0.15 }}
          className="relative mx-auto max-w-6xl"
          style={{ perspective: '1400px' }}
        >
          {/* Amber pedestal glow */}
          <div
            aria-hidden
            className="absolute -bottom-8 left-1/2 h-16 w-3/4 -translate-x-1/2 rounded-full"
            style={{
              background:
                'radial-gradient(ellipse, rgba(217,119,6,0.3) 0%, rgba(217,119,6,0.1) 50%, transparent 80%)',
              filter: 'blur(28px)',
            }}
          />

          {/* 3D tilt wrapper */}
          <motion.div
            style={{
              rotateY: imgRY,
              rotateX: imgRX,
              transformStyle: 'preserve-3d',
            }}
            className="relative"
          >
            {/* Browser chrome + screenshot */}
            <div className="overflow-hidden rounded-t-2xl border border-praxia-gray-200 border-b-0 shadow-[0_-16px_64px_-8px_rgba(217,119,6,0.18),0_-4px_24px_-4px_rgba(0,0,0,0.07)]">

              {/* Chrome top bar */}
              <div className="flex items-center gap-2 border-b border-praxia-gray-100 bg-[#f2f3f4] px-4 py-3">
                <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
                <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
                <span className="h-3 w-3 rounded-full bg-[#28c840]" />
                <div className="mx-auto flex max-w-[280px] flex-1 items-center gap-1.5 rounded-md border border-praxia-gray-200/50 bg-white/80 px-3 py-1 shadow-inner">
                  <svg className="h-3 w-3 shrink-0 text-praxia-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <span className="text-[11px] font-mono text-praxia-gray-400">app.praxia.ai/dashboard</span>
                </div>
              </div>

              {/* Image */}
              <div className="relative">
                <Image
                  src="/hero-dashboard.jpg"
                  alt="PraxIA — tableau de bord"
                  width={1400}
                  height={900}
                  className="block w-full h-auto"
                  priority
                />

                {/* Fade bottom into next section */}
                <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#f8fafc] via-[#f8fafc]/50 to-transparent" />

                {/* Badge — left */}
                <motion.div
                  initial={{ opacity: 0, x: -18, y: 6 }}
                  animate={imgInView ? { opacity: 1, x: 0, y: 0 } : {}}
                  transition={{ delay: 0.9, duration: 0.55, type: 'spring', stiffness: 180, damping: 18 }}
                  className="absolute left-6 top-6 flex items-center gap-3 rounded-2xl border border-white/60 bg-white/90 px-4 py-3 shadow-2xl shadow-black/10 backdrop-blur-xl"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-green-50">
                    <svg className="h-4 w-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-praxia-black">Agent déployé</p>
                    <p className="mt-0.5 text-[10px] text-praxia-gray-400">Review Responder · 2 min ago</p>
                  </div>
                </motion.div>

                {/* Badge — right */}
                <motion.div
                  initial={{ opacity: 0, x: 18, y: 6 }}
                  animate={imgInView ? { opacity: 1, x: 0, y: 0 } : {}}
                  transition={{ delay: 1.1, duration: 0.55, type: 'spring', stiffness: 180, damping: 18 }}
                  className="absolute right-6 top-6 flex items-center gap-3 rounded-2xl border border-white/60 bg-white/90 px-4 py-3 shadow-2xl shadow-black/10 backdrop-blur-xl"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-50">
                    <svg className="h-4 w-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-praxia-black">247 tâches automatisées</p>
                    <p className="mt-0.5 text-[10px] text-praxia-gray-400">Cette semaine · $0.003 moy.</p>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </motion.div>

      </div>
    </section>
  );
}
