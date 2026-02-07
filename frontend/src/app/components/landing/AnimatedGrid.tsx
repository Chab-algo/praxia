'use client';

import { useEffect, useRef, useCallback } from 'react';

const COLS = 20;
const ROWS = 14;
const TOTAL = COLS * ROWS;

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function getGradientColor(t: number): [number, number, number] {
  // cyan(14,165,233) -> violet(139,92,246) -> orange(249,115,22)
  if (t < 0.5) {
    const p = t / 0.5;
    return [
      lerp(14, 139, p),
      lerp(165, 92, p),
      lerp(233, 246, p),
    ];
  }
  const p = (t - 0.5) / 0.5;
  return [
    lerp(139, 249, p),
    lerp(92, 115, p),
    lerp(246, 22, p),
  ];
}

export function AnimatedGrid() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseRef = useRef({ x: 0.5, y: 0.5 });
  const rafRef = useRef<number>(0);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    mouseRef.current = {
      x: (e.clientX - rect.left) / rect.width,
      y: (e.clientY - rect.top) / rect.height,
    };
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const cells = container.querySelectorAll<HTMLDivElement>('.grid-cell');

    cells.forEach((cell, i) => {
      const col = i % COLS;
      const row = Math.floor(i / COLS);
      const t = col / (COLS - 1);
      const [r, g, b] = getGradientColor(t);
      cell.style.backgroundColor = `rgb(${r},${g},${b})`;

      const delay = (col * 0.06 + row * 0.04);
      const duration = 3.5 + (i % 5) * 0.5;
      cell.style.animationDelay = `${delay}s`;
      cell.style.animationDuration = `${duration}s`;
    });

    // Mouse-reactive brightness
    let frame = 0;
    function animate() {
      frame++;
      if (frame % 3 === 0) { // throttle to ~20fps for perf
        const mx = mouseRef.current.x;
        const my = mouseRef.current.y;
        cells.forEach((cell, i) => {
          const col = i % COLS;
          const row = Math.floor(i / COLS);
          const cx = col / (COLS - 1);
          const cy = row / (ROWS - 1);
          const dist = Math.sqrt((cx - mx) ** 2 + (cy - my) ** 2);
          const brightness = Math.max(0.15, 1 - dist * 1.5);
          cell.style.opacity = String(0.15 + brightness * 0.55);
        });
      }
      rafRef.current = requestAnimationFrame(animate);
    }

    rafRef.current = requestAnimationFrame(animate);
    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [handleMouseMove]);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 overflow-hidden pointer-events-none"
      aria-hidden="true"
    >
      <div
        className="absolute inset-0 grid gap-1 sm:gap-1.5 p-2 sm:p-4"
        style={{
          gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))`,
          gridTemplateRows: `repeat(${ROWS}, minmax(0, 1fr))`,
        }}
      >
        {Array.from({ length: TOTAL }, (_, i) => (
          <div
            key={i}
            className="grid-cell rounded-full animate-grid-breathe"
            style={{ opacity: 0.2 }}
          />
        ))}
      </div>

      {/* Edge fades */}
      <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-white via-white/80 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-white via-white/80 to-transparent" />
      <div className="absolute top-0 bottom-0 left-0 w-32 bg-gradient-to-r from-white to-transparent" />
      <div className="absolute top-0 bottom-0 right-0 w-32 bg-gradient-to-l from-white to-transparent" />
    </div>
  );
}
