"use client";

import { useRef, useEffect, useState } from "react";

// ---------------------------------------------------------------------------
// useScrollReveal
// Observes an element with IntersectionObserver and adds `is-visible` class
// once it crosses the threshold. Returns { ref, visible }.
// ---------------------------------------------------------------------------
export function useScrollReveal<T extends Element>(options?: {
  threshold?: number;
  rootMargin?: string;
  once?: boolean;
}) {
  const { threshold = 0.15, rootMargin = "0px 0px -60px 0px", once = true } =
    options ?? {};
  const ref = useRef<T>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Skip observer for users who prefer reduced motion
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.classList.add("is-visible");
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          setVisible(true);
          if (once) observer.unobserve(entry.target);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, rootMargin, once]);

  return { ref, visible };
}

// ---------------------------------------------------------------------------
// useNavbarScroll
// Returns true once the user scrolls past 10px — used to apply backdrop blur.
// ---------------------------------------------------------------------------
export function useNavbarScroll() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handler, { passive: true });
    // Check initial position (e.g. user refreshed mid-page)
    handler();
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return scrolled;
}

// ---------------------------------------------------------------------------
// useCountUp
// Animates a number from 0 to `target` using rAF + easeOutCubic when the
// attached element enters the viewport.
// ---------------------------------------------------------------------------
export function useCountUp(options: {
  target: number;
  duration?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
}) {
  const {
    target,
    duration = 1200,
    decimals = 0,
    prefix = "",
    suffix = "",
  } = options;

  const ref = useRef<Element>(null);
  const [display, setDisplay] = useState(
    `${prefix}${(0).toFixed(decimals)}${suffix}`
  );

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setDisplay(`${prefix}${target.toFixed(decimals)}${suffix}`);
      return;
    }

    let rafId: number;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.unobserve(entry.target);

        let start: number | null = null;
        const animate = (timestamp: number) => {
          if (start === null) start = timestamp;
          const elapsed = timestamp - start;
          const progress = Math.min(elapsed / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
          setDisplay(`${prefix}${(target * eased).toFixed(decimals)}${suffix}`);
          if (progress < 1) {
            rafId = requestAnimationFrame(animate);
          }
        };
        rafId = requestAnimationFrame(animate);
      },
      { threshold: 0.5 }
    );

    observer.observe(el);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(rafId);
    };
  }, [target, duration, decimals, prefix, suffix]);

  return { ref, display };
}
