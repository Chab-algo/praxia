'use client';

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

// Register GSAP plugins
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

/**
 * GSAP Animation Utilities for PraxIA
 * Premium animations with performance-first approach
 */

// Export useGSAP for components
export { useGSAP };

/**
 * Setup hero parallax effect
 * Content scrolls slower than page for depth
 */
export const setupHeroParallax = (selector: string = '.hero-content') => {
  return gsap.to(selector, {
    scrollTrigger: {
      trigger: '.hero-section',
      start: 'top top',
      end: 'bottom top',
      scrub: 1,
    },
    y: 100,
    opacity: 0.5,
    ease: 'none',
  });
};

/**
 * Magnetic button effect
 * Button follows cursor within radius
 */
export const setupMagneticButton = (
  buttonElement: HTMLElement,
  radius: number = 80
) => {
  const handleMouseMove = (e: MouseEvent) => {
    const rect = buttonElement.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const deltaX = e.clientX - centerX;
    const deltaY = e.clientY - centerY;
    const distance = Math.sqrt(deltaX ** 2 + deltaY ** 2);

    if (distance < radius) {
      const strength = 0.3; // 30% of distance
      gsap.to(buttonElement, {
        x: deltaX * strength,
        y: deltaY * strength,
        duration: 0.3,
        ease: 'power2.out',
      });
    }
  };

  const handleMouseLeave = () => {
    gsap.to(buttonElement, {
      x: 0,
      y: 0,
      duration: 0.4,
      ease: 'elastic.out(1, 0.5)',
    });
  };

  buttonElement.addEventListener('mousemove', handleMouseMove);
  buttonElement.addEventListener('mouseleave', handleMouseLeave);

  // Return cleanup function
  return () => {
    buttonElement.removeEventListener('mousemove', handleMouseMove);
    buttonElement.removeEventListener('mouseleave', handleMouseLeave);
  };
};

/**
 * Staggered reveal animation for metrics
 */
export const setupMetricsReveal = (selector: string = '.metric-item') => {
  return gsap.from(selector, {
    scrollTrigger: {
      trigger: '.metrics-container',
      start: 'top 70%',
    },
    y: 40,
    opacity: 0,
    stagger: 0.15,
    duration: 0.6,
    ease: 'power3.out',
  });
};

/**
 * Recipe card 3D tilt effect
 */
export const setup3DTilt = (cardElement: HTMLElement) => {
  const handleMouseMove = (e: MouseEvent) => {
    const rect = cardElement.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -5; // Max 5deg
    const rotateY = ((x - centerX) / centerX) * 5;

    gsap.to(cardElement, {
      rotateX,
      rotateY,
      duration: 0.3,
      ease: 'power2.out',
      transformPerspective: 1000,
    });
  };

  const handleMouseLeave = () => {
    gsap.to(cardElement, {
      rotateX: 0,
      rotateY: 0,
      duration: 0.4,
      ease: 'power2.out',
    });
  };

  cardElement.addEventListener('mousemove', handleMouseMove);
  cardElement.addEventListener('mouseleave', handleMouseLeave);

  return () => {
    cardElement.removeEventListener('mousemove', handleMouseMove);
    cardElement.removeEventListener('mouseleave', handleMouseLeave);
  };
};

/**
 * Timeline section with pinned scroll
 */
export const setupTimelineScroll = () => {
  const timeline = gsap.timeline({
    scrollTrigger: {
      trigger: '.how-it-works-section',
      start: 'top top',
      end: 'bottom bottom',
      pin: '.timeline-container',
      scrub: 1,
      anticipatePin: 1,
    },
  });

  // Animate progress line
  timeline.fromTo(
    '.timeline-progress',
    { scaleY: 0, transformOrigin: 'top' },
    { scaleY: 1, ease: 'none' }
  );

  // Stagger step reveals
  timeline.from(
    '.timeline-step',
    {
      x: -60,
      opacity: 0,
      stagger: 0.3,
      duration: 0.5,
    },
    0
  );

  return timeline;
};

/**
 * Auto-hide navbar on scroll down
 */
export const setupNavbarAutoHide = (navSelector: string = 'nav') => {
  let lastScroll = 0;

  ScrollTrigger.create({
    onUpdate: (self) => {
      const currentScroll = self.scroll();
      if (currentScroll > lastScroll && currentScroll > 100) {
        // Scrolling down
        gsap.to(navSelector, { y: -100, duration: 0.3, ease: 'power2.inOut' });
      } else {
        // Scrolling up
        gsap.to(navSelector, { y: 0, duration: 0.3, ease: 'power2.inOut' });
      }
      lastScroll = currentScroll;
    },
  });
};

/**
 * Smooth page entrance animation
 */
export const setupPageEntrance = (selector: string = 'main') => {
  return gsap.from(selector, {
    opacity: 0,
    y: 20,
    duration: 0.6,
    ease: 'power3.out',
    delay: 0.1,
  });
};

/**
 * Section reveal on scroll
 */
export const setupSectionReveal = (selector: string = '.reveal-section') => {
  gsap.utils.toArray<HTMLElement>(selector).forEach((section) => {
    gsap.from(section, {
      scrollTrigger: {
        trigger: section,
        start: 'top 80%',
        toggleActions: 'play none none reverse',
      },
      y: 60,
      opacity: 0,
      duration: 0.8,
      ease: 'power3.out',
    });
  });
};

/**
 * Chart entrance animation
 * Animates bars from bottom to top
 */
export const setupChartEntrance = (selector: string = '.recharts-bar-rectangle') => {
  return gsap.from(selector, {
    scaleY: 0,
    transformOrigin: 'bottom',
    stagger: 0.05,
    duration: 0.6,
    ease: 'power3.out',
  });
};

/**
 * Stat cards reveal
 */
export const setupStatCardsReveal = (selector: string = '.stat-card') => {
  return gsap.from(selector, {
    scrollTrigger: {
      trigger: '.stats-grid',
      start: 'top 80%',
    },
    y: 30,
    opacity: 0,
    stagger: 0.08,
    duration: 0.5,
    ease: 'power3.out',
  });
};

/**
 * Horizontal scroll progress indicator
 */
export const setupScrollProgress = (
  containerSelector: string,
  progressSelector: string
) => {
  const recipesContainer = document.querySelector(containerSelector);
  const progressBar = document.querySelector(progressSelector);

  if (!recipesContainer || !progressBar) return;

  ScrollTrigger.create({
    trigger: recipesContainer,
    start: 'left left',
    end: 'right right',
    horizontal: true,
    onUpdate: (self) => {
      gsap.to(progressBar, { scaleX: self.progress, duration: 0.1 });
    },
  });
};

/**
 * Kill all ScrollTriggers (for cleanup)
 */
export const killAllScrollTriggers = () => {
  ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
};

/**
 * Refresh ScrollTrigger (for dynamic content)
 */
export const refreshScrollTrigger = () => {
  ScrollTrigger.refresh();
};
