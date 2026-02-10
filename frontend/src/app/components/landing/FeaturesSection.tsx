'use client';

import { motion, useInView, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useRef, useState } from 'react';
import { CheckCircle2, Zap, TrendingUp, Users, FileText, Megaphone } from 'lucide-react';

/* ─────────────────────────────────────────────────────────────
   TILT CARD WRAPPER — magnetic 3D tilt on hover
───────────────────────────────────────────────────────────── */
function TiltCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 300, damping: 30 });
  const sy = useSpring(y, { stiffness: 300, damping: 30 });
  const rotateX = useTransform(sy, [-0.5, 0.5], ['6deg', '-6deg']);
  const rotateY = useTransform(sx, [-0.5, 0.5], ['-6deg', '6deg']);

  function onMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    x.set((e.clientX - rect.left) / rect.width - 0.5);
    y.set((e.clientY - rect.top) / rect.height - 0.5);
  }
  function onMouseLeave() { x.set(0); y.set(0); }

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      style={{ rotateX, rotateY, transformStyle: 'preserve-3d', perspective: 1000 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────────
   SPOT-LIGHT CARD — cursor-following glow
───────────────────────────────────────────────────────────── */
function SpotlightCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const [pos, setPos] = useState({ x: 0, y: 0, opacity: 0 });
  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    setPos({ x: e.clientX - rect.left, y: e.clientY - rect.top, opacity: 1 });
  }
  return (
    <div
      className={`relative overflow-hidden ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setPos((p) => ({ ...p, opacity: 0 }))}
    >
      <div
        className="pointer-events-none absolute inset-0 transition-opacity duration-300 rounded-2xl"
        style={{
          opacity: pos.opacity,
          background: `radial-gradient(600px circle at ${pos.x}px ${pos.y}px, rgba(217,119,6,0.08), transparent 40%)`,
        }}
      />
      {children}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   REVIEW PREVIEW — animated streaming tokens
───────────────────────────────────────────────────────────── */
function ReviewPreview() {
  const words = ['Thank', 'you', 'for', 'your', 'kind', 'words!', "We're", 'thrilled', 'you', 'had', 'a', 'great', 'experience.', 'See', 'you', 'next', 'time!', '🎉'];
  return (
    <div className="mt-8 space-y-3">
      <div className="rounded-xl border border-praxia-gray-200 bg-praxia-gray-50 p-4 text-sm text-praxia-gray-600 italic">
        "Great product, fast delivery. Would definitely buy again!"
        <div className="mt-2 flex items-center gap-1.5">
          <span className="inline-flex h-5 items-center gap-1 rounded-full bg-amber-50 px-2 text-[10px] font-semibold text-amber-600">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" /> Positive
          </span>
          <span className="text-[10px] text-praxia-gray-400">★ 5/5</span>
        </div>
      </div>
      <div className="rounded-xl border border-praxia-gray-200 bg-white p-4">
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-praxia-gray-400">AI Response</p>
        <p className="text-sm leading-relaxed text-praxia-gray-800">
          {words.map((word, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 + i * 0.06, duration: 0.2 }}
              className="mr-1"
            >
              {word}
            </motion.span>
          ))}
        </p>
        <div className="mt-3 flex items-center justify-between text-[10px] text-praxia-gray-400">
          <span className="flex items-center gap-1"><Zap className="h-3 w-3 text-amber-500" /> 1.2s</span>
          <span className="text-praxia-success font-semibold">✓ Published</span>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   CV PREVIEW — animated score bars
───────────────────────────────────────────────────────────── */
const candidates = [
  { name: 'Alice Martin', score: 94, color: 'bg-praxia-success' },
  { name: 'Bob Chen', score: 81, color: 'bg-praxia-technical' },
  { name: 'Sara Dupont', score: 67, color: 'bg-praxia-gray-400' },
  { name: 'James Park', score: 55, color: 'bg-praxia-gray-200' },
];

function CVPreview() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  return (
    <div ref={ref} className="mt-8 space-y-2.5">
      {candidates.map((c, i) => (
        <div key={c.name} className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-full bg-praxia-gray-100 flex items-center justify-center text-[10px] font-bold text-praxia-gray-600 flex-shrink-0">
            {c.name[0]}
          </div>
          <div className="flex-1">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-praxia-gray-700 font-medium">{c.name}</span>
              <span className="font-mono font-bold text-praxia-gray-800">{c.score}%</span>
            </div>
            <div className="h-1.5 rounded-full bg-praxia-gray-100 overflow-hidden">
              <motion.div
                className={`h-full rounded-full ${c.color}`}
                initial={{ width: 0 }}
                animate={inView ? { width: `${c.score}%` } : { width: 0 }}
                transition={{ duration: 0.8, delay: i * 0.15, ease: [0.19, 1, 0.22, 1] }}
              />
            </div>
          </div>
        </div>
      ))}
      <div className="pt-2 flex items-center gap-1.5 text-[11px] text-praxia-gray-400">
        <Users className="h-3 w-3" /> 24 CVs · <span className="text-praxia-success font-semibold">4 shortlisted</span>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   INVOICE PREVIEW — check-animation rows
───────────────────────────────────────────────────────────── */
const invoiceFields = [
  { label: 'Vendor', value: 'Acme Corp' },
  { label: 'Amount', value: '$12,450.00' },
  { label: 'Due Date', value: '2024-03-15' },
  { label: 'GL Account', value: '6200 — Software' },
];

function InvoicePreview() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  return (
    <div ref={ref} className="mt-8">
      <div className="rounded-xl border border-praxia-gray-200 overflow-hidden bg-white">
        <div className="flex items-center justify-between bg-praxia-gray-50 px-4 py-2.5 text-xs border-b border-praxia-gray-200">
          <span className="font-mono text-praxia-gray-600">INV-2024-0892.pdf</span>
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            animate={inView ? { opacity: 1, scale: 1 } : {}}
            transition={{ delay: 0.8, type: 'spring', stiffness: 400, damping: 17 }}
            className="flex items-center gap-1 text-praxia-success font-semibold"
          >
            <CheckCircle2 className="h-3.5 w-3.5" /> Validated
          </motion.span>
        </div>
        <div className="divide-y divide-praxia-gray-100">
          {invoiceFields.map((row, i) => (
            <motion.div
              key={row.label}
              initial={{ opacity: 0, x: -10 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ delay: 0.2 + i * 0.1, ease: [0.19, 1, 0.22, 1], duration: 0.4 }}
              className="flex items-center justify-between px-4 py-2.5"
            >
              <span className="text-[10px] uppercase tracking-widest text-praxia-gray-400">{row.label}</span>
              <span className="text-xs font-semibold text-praxia-gray-800">{row.value}</span>
            </motion.div>
          ))}
        </div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 1, duration: 0.4 }}
          className="px-4 py-2.5 bg-amber-50 border-t border-amber-100 text-xs font-medium text-amber-700"
        >
          → Routed to CFO for approval
        </motion.div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   SOCIAL PREVIEW — platform tabs
───────────────────────────────────────────────────────────── */
const platforms = [
  { name: 'LinkedIn', color: 'bg-blue-500', post: '🚀 Excited to announce our new real-time AI analytics dashboard. Data-driven decisions, faster than ever. #AI #Analytics' },
  { name: 'Twitter', color: 'bg-sky-400', post: 'We just shipped real-time AI analytics 📊 Instant insights, zero lag. Try it now → praxia.ai #ProductUpdate' },
  { name: 'Instagram', color: 'bg-pink-500', post: '✨ New drop: AI analytics dashboard that thinks as fast as you do. Link in bio.' },
];

function SocialPreview() {
  const [active, setActive] = useState(0);
  return (
    <div className="mt-8">
      <div className="flex gap-2 mb-3">
        {platforms.map((p, i) => (
          <button
            key={p.name}
            onClick={() => setActive(i)}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold transition-all duration-200 ${
              active === i ? 'bg-praxia-black text-white' : 'bg-praxia-gray-100 text-praxia-gray-500 hover:bg-praxia-gray-200'
            }`}
          >
            <span className={`h-2 w-2 rounded-full ${p.color}`} />
            {p.name}
          </button>
        ))}
      </div>
      <div className="rounded-xl border border-praxia-gray-200 bg-white p-4 min-h-[80px]">
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-praxia-gray-400">Generated post</p>
        <motion.p
          key={active}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: [0.19, 1, 0.22, 1] }}
          className="text-sm leading-relaxed text-praxia-gray-800"
        >
          {platforms[active].post}
        </motion.p>
      </div>
      <div className="mt-2 flex items-center gap-1.5 text-[11px] text-praxia-gray-400">
        <Megaphone className="h-3 w-3 text-amber-500" /> 3 platforms · <span className="text-praxia-success font-semibold">Ready to publish</span>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   BENTO GRID LAYOUT
   Top row: 1 wide (60%) + 1 narrow (40%)
   Bottom row: 1 narrow (40%) + 1 wide (60%)
───────────────────────────────────────────────────────────── */
const FEATURES = [
  {
    tag: 'E-commerce',
    title: 'Respond to every review. Automatically.',
    description: 'AI reads the review, detects sentiment, and crafts a brand-voice response in under 2 seconds. Zero manual work.',
    metric: '15h / week saved',
    Preview: ReviewPreview,
    wide: true,
  },
  {
    tag: 'HR',
    title: 'Screen CVs in seconds.',
    description: 'Upload job requirements. The agent scores and ranks every candidate.',
    metric: '20h / week saved',
    Preview: CVPreview,
    wide: false,
  },
  {
    tag: 'Finance',
    title: 'Parse & validate invoices.',
    description: 'Extract vendor, amount, and GL data from any format. Flag anomalies.',
    metric: '99% accuracy',
    Preview: InvoicePreview,
    wide: false,
  },
  {
    tag: 'Marketing',
    title: 'One brief. Three platforms. Done.',
    description: 'Turn a product description into native posts for LinkedIn, Twitter, and Instagram instantly.',
    metric: '2 min / campaign',
    Preview: SocialPreview,
    wide: true,
  },
];

function FeatureCard({ feature, index }: { feature: typeof FEATURES[0]; index: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  const { Preview } = feature;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 32 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: (index % 2) * 0.1, ease: [0.19, 1, 0.22, 1] }}
    >
      <TiltCard className="h-full">
        <SpotlightCard className="h-full rounded-2xl border border-praxia-gray-200 bg-white p-8 flex flex-col">
          {/* Header row */}
          <div className="flex items-start justify-between mb-5">
            <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-praxia-gray-400">
              {feature.tag}
            </span>
            <span className="rounded-full bg-amber-50 px-3 py-1 text-[11px] font-semibold text-amber-600">
              {feature.metric}
            </span>
          </div>

          {/* Title */}
          <h3 className="text-[1.45rem] font-bold leading-[1.2] tracking-tight text-praxia-black mb-3">
            {feature.title}
          </h3>

          {/* Description */}
          <p className="text-sm leading-relaxed text-praxia-gray-600">
            {feature.description}
          </p>

          {/* Preview UI */}
          <div className="flex-1">
            <Preview />
          </div>
        </SpotlightCard>
      </TiltCard>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────────
   SECTION
───────────────────────────────────────────────────────────── */
export function FeaturesSection() {
  const headerRef = useRef(null);
  const inView = useInView(headerRef, { once: true, margin: '-80px' });

  return (
    <section className="section-spacing bg-praxia-gray-50" id="features">
      <div className="container-custom">

        {/* Header — oversized left-aligned editorial style */}
        <motion.div
          ref={headerRef}
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: [0.19, 1, 0.22, 1] }}
          className="mb-16 max-w-2xl"
        >
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-praxia-accent mb-4">
            What PraxIA does
          </p>
          <h2 className="text-5xl sm:text-6xl font-bold leading-[1.05] tracking-tight text-praxia-black mb-5">
            Full automation<br />
            <span className="text-praxia-gray-400 font-light">for your operations.</span>
          </h2>
          <p className="text-lg text-praxia-gray-600 leading-relaxed">
            Pre-built agents for the processes that drain your team every single day.
          </p>
        </motion.div>

        {/* Asymmetric Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-5">
          {/* Row 1: wide (3/5) + narrow (2/5) */}
          <div className="md:col-span-3">
            <FeatureCard feature={FEATURES[0]} index={0} />
          </div>
          <div className="md:col-span-2">
            <FeatureCard feature={FEATURES[1]} index={1} />
          </div>

          {/* Row 2: narrow (2/5) + wide (3/5) */}
          <div className="md:col-span-2">
            <FeatureCard feature={FEATURES[2]} index={2} />
          </div>
          <div className="md:col-span-3">
            <FeatureCard feature={FEATURES[3]} index={3} />
          </div>
        </div>

        {/* Bottom CTA bar */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: [0.19, 1, 0.22, 1] }}
          className="mt-12 flex items-center justify-between border-t border-praxia-gray-200 pt-8"
        >
          <p className="text-sm text-praxia-gray-500">
            <span className="font-semibold text-praxia-black">5 recipes</span> ready to deploy today.
            Customize in minutes.
          </p>
          <a
            href="/dashboard/recipes"
            className="group flex items-center gap-2 rounded-full bg-praxia-black px-5 py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:bg-praxia-charcoal hover:gap-3"
          >
            Browse all recipes
            <span className="transition-transform duration-200 group-hover:translate-x-0.5">→</span>
          </a>
        </motion.div>

      </div>
    </section>
  );
}
