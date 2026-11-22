"use client";

import { useEffect, useRef, type ReactNode } from "react";

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

export default function ScrollReveal({
  children,
  className = "",
  delay = 0,
}: ScrollRevealProps) {
  const revealRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = revealRef.current;
    if (!element) return;

    const motionPreference = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    );
    if (motionPreference.matches) {
      element.classList.add("is-visible");
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        element.classList.add("is-visible");
        observer.unobserve(element);
      },
      { threshold: 0.14, rootMargin: "0px 0px -36px 0px" }
    );

    element.style.setProperty("--reveal-delay", `${delay}ms`);
    element.classList.add("reveal-ready");
    observer.observe(element);

    return () => observer.disconnect();
  }, [delay]);

  return (
    <div ref={revealRef} className={`scroll-reveal ${className}`}>
      {children}
    </div>
  );
}
