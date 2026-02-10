'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';

interface MetricCounterProps {
  value: number;
  suffix?: string;
  label: string;
  delay?: number;
}

export function MetricCounter({ value, suffix = '', label, delay = 0 }: MetricCounterProps) {
  const [count, setCount] = useState(0);
  const counterRef = useRef<HTMLDivElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (hasAnimated.current) return;
    hasAnimated.current = true;

    const timer = setTimeout(() => {
      gsap.to(
        { val: 0 },
        {
          val: value,
          duration: 2,
          ease: 'power3.out',
          onUpdate: function () {
            setCount(Math.floor(this.targets()[0].val));
          },
        }
      );
    }, delay);

    return () => clearTimeout(timer);
  }, [value, delay]);

  return (
    <div ref={counterRef} className="text-center metric-item">
      <div className="text-3xl sm:text-4xl font-bold font-mono text-praxia-accent">
        {count}
        {suffix}
      </div>
      <div className="text-sm text-muted-foreground mt-1 font-sans">{label}</div>
    </div>
  );
}
