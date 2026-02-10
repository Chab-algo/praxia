'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

function ReviewPreview() {
  return (
    <div className="mt-6 rounded-lg border border-gray-100 overflow-hidden text-xs font-sans">
      <div className="bg-gray-50 border-b border-gray-100 px-4 py-2 flex items-center justify-between">
        <span className="text-gray-500 font-medium">Customer Review</span>
        <span className="text-orange-500 font-semibold">Sentiment: Positive</span>
      </div>
      <div className="p-4 space-y-3 bg-white">
        <p className="text-gray-600 italic">"Great product, fast delivery. Would definitely buy again!"</p>
        <div className="border-t border-gray-100 pt-3">
          <p className="text-gray-400 text-[10px] uppercase tracking-wide mb-1">AI Generated Response</p>
          <p className="text-gray-700">Thank you for your kind words! We're thrilled you had a great experience. See you next time! 🎉</p>
        </div>
      </div>
      <div className="bg-gray-50 border-t border-gray-100 px-4 py-2 flex items-center gap-3">
        <span className="text-gray-400">⚡ 1.2s</span>
        <span className="ml-auto text-green-600 font-medium">✓ Sent</span>
      </div>
    </div>
  );
}

function CVPreview() {
  const candidates = [
    { name: 'Alice Martin', score: 94, tag: 'Top Match' },
    { name: 'Bob Chen', score: 81, tag: 'Good Fit' },
    { name: 'Sara Dupont', score: 67, tag: 'Partial' },
  ];
  return (
    <div className="mt-6 rounded-lg border border-gray-100 overflow-hidden text-xs font-sans">
      <div className="bg-gray-50 border-b border-gray-100 px-4 py-2 flex items-center justify-between">
        <span className="text-gray-500 font-medium">CV Screening — Senior Dev Role</span>
        <span className="text-gray-400">24 CVs processed</span>
      </div>
      <div className="bg-white divide-y divide-gray-50">
        {candidates.map((c) => (
          <div key={c.name} className="px-4 py-3 flex items-center gap-3">
            <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-bold text-[10px]">
              {c.name[0]}
            </div>
            <span className="flex-1 text-gray-700 font-medium">{c.name}</span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
              c.score >= 90 ? 'bg-green-50 text-green-600' :
              c.score >= 75 ? 'bg-blue-50 text-blue-600' :
              'bg-gray-50 text-gray-500'
            }`}>{c.tag}</span>
            <span className="font-mono font-bold text-gray-800 w-8 text-right">{c.score}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function InvoicePreview() {
  return (
    <div className="mt-6 rounded-lg border border-gray-100 overflow-hidden text-xs font-sans">
      <div className="bg-gray-50 border-b border-gray-100 px-4 py-2 flex items-center justify-between">
        <span className="text-gray-500 font-medium">Invoice #INV-2024-0892</span>
        <span className="text-green-600 font-semibold">✓ Validated</span>
      </div>
      <div className="bg-white p-4 space-y-2">
        {[
          { label: 'Vendor', value: 'Acme Corp' },
          { label: 'Amount', value: '$12,450.00' },
          { label: 'Due Date', value: '2024-03-15' },
          { label: 'GL Account', value: '6200 — Software' },
        ].map((row) => (
          <div key={row.label} className="flex items-center justify-between py-1 border-b border-gray-50">
            <span className="text-gray-400 uppercase tracking-wide text-[10px]">{row.label}</span>
            <span className="text-gray-800 font-medium">{row.value}</span>
          </div>
        ))}
      </div>
      <div className="bg-gray-50 border-t border-gray-100 px-4 py-2">
        <span className="text-orange-500 font-medium">→ Routed for approval</span>
      </div>
    </div>
  );
}

function SocialPreview() {
  return (
    <div className="mt-6 rounded-lg border border-gray-100 overflow-hidden text-xs font-sans">
      <div className="bg-gray-50 border-b border-gray-100 px-4 py-2 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-blue-400" />
        <span className="text-gray-500 font-medium">LinkedIn</span>
        <span className="w-2 h-2 rounded-full bg-pink-400 ml-2" />
        <span className="text-gray-500">Instagram</span>
        <span className="w-2 h-2 rounded-full bg-sky-400 ml-2" />
        <span className="text-gray-500">Twitter</span>
      </div>
      <div className="bg-white p-4 space-y-3">
        <p className="text-gray-400 text-[10px] uppercase tracking-wide">Input</p>
        <p className="text-gray-500 italic">"New feature: real-time AI analytics dashboard"</p>
        <div className="border-t border-gray-100 pt-3">
          <p className="text-gray-400 text-[10px] uppercase tracking-wide mb-2">Generated — LinkedIn</p>
          <p className="text-gray-700 leading-relaxed">🚀 Excited to announce our new real-time AI analytics dashboard. Data-driven decisions, faster than ever. #AI #Analytics #ProductUpdate</p>
        </div>
      </div>
    </div>
  );
}

const FEATURES = [
  {
    tag: 'E-commerce',
    title: 'Respond to Reviews Automatically',
    description: 'AI reads each review, detects sentiment, and crafts a personalized brand-voice response. Zero manual work.',
    metric: '15h / week saved',
    Preview: ReviewPreview,
  },
  {
    tag: 'HR',
    title: 'Screen CVs in Seconds',
    description: 'Upload job requirements. The agent reads every resume, scores candidates, and ranks them instantly.',
    metric: '20h / week saved',
    Preview: CVPreview,
  },
  {
    tag: 'Finance',
    title: 'Parse & Validate Invoices',
    description: 'Extract vendor, amount, and GL data from any invoice format. Flag anomalies and route for approval.',
    metric: '99% accuracy',
    Preview: InvoicePreview,
  },
  {
    tag: 'Marketing',
    title: 'Generate Social Content',
    description: 'Turn a product description into platform-native posts for LinkedIn, Instagram, and Twitter in one click.',
    metric: '2 min / campaign',
    Preview: SocialPreview,
  },
];

function FeatureCard({ feature, index }: { feature: typeof FEATURES[0]; index: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  const { Preview } = feature;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.08, ease: [0.19, 1, 0.22, 1] }}
      className="border border-gray-200 rounded-2xl p-7 bg-white flex flex-col"
    >
      <div className="flex items-start justify-between mb-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
          {feature.tag}
        </span>
        <span className="text-xs font-mono text-orange-500 font-semibold bg-orange-50 px-2 py-0.5 rounded-full">
          {feature.metric}
        </span>
      </div>

      <h3 className="text-xl font-semibold text-gray-900 leading-snug mb-2">
        {feature.title}
      </h3>

      <p className="text-sm text-gray-500 leading-relaxed">
        {feature.description}
      </p>

      <Preview />
    </motion.div>
  );
}

export function FeaturesSection() {
  const headerRef = useRef(null);
  const headerInView = useInView(headerRef, { once: true, margin: '-60px' });

  return (
    <section className="section-spacing bg-gray-50" id="features">
      <div className="container-custom">
        <motion.div
          ref={headerRef}
          className="mb-14"
          initial={{ opacity: 0, y: 20 }}
          animate={headerInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, ease: [0.19, 1, 0.22, 1] }}
        >
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 leading-tight mb-3">
            Full automation coverage
          </h2>
          <p className="text-xl text-gray-400 font-light">
            for your most repetitive business processes.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {FEATURES.map((feature, i) => (
            <FeatureCard key={feature.title} feature={feature} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
