'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

const LOGOS = [
  'Accenture',
  'Microsoft',
  'Meta',
  'Deloitte',
  'McKinsey',
  'BCG',
  'Capgemini',
  'SAP',
];

function LogoItem({ name }: { name: string }) {
  return (
    <div className="flex-shrink-0 flex items-center justify-center h-10 px-8">
      <span className="text-base font-semibold text-gray-300 tracking-wide select-none whitespace-nowrap hover:text-gray-500 transition-colors duration-300">
        {name}
      </span>
    </div>
  );
}

export function SocialProof() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  return (
    <section ref={ref} className="py-16 border-t border-gray-100 overflow-hidden">
      <div className="max-w-6xl mx-auto px-6">
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center text-xs font-medium text-gray-400 uppercase tracking-[0.2em] mb-10"
        >
          Trusted by AI builders from leading institutions
        </motion.p>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="relative"
      >
        {/* Left fade */}
        <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-white to-transparent z-10" />
        {/* Right fade */}
        <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-white to-transparent z-10" />

        {/* Marquee */}
        <div className="flex animate-marquee">
          <div className="flex items-center gap-4 pr-4">
            {LOGOS.map((name) => (
              <LogoItem key={name} name={name} />
            ))}
          </div>
          <div className="flex items-center gap-4 pr-4" aria-hidden="true">
            {LOGOS.map((name) => (
              <LogoItem key={`dup-${name}`} name={name} />
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  );
}
