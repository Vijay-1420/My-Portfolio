"use client";

import { useEffect, useRef } from "react";

interface TransitionDetail {
  type?: "section" | "portal";
  variant?: "expansion" | "pull" | "shatter" | "spider" | "energy" | "portal";
  x?: number;
  y?: number;
}

export default function WebTransition() {
  const layerRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<number>(0);

  useEffect(() => {
    const activate = (detail: TransitionDetail) => {
      const layer = layerRef.current;
      if (!layer) return;

      const x = detail.x ?? window.innerWidth / 2;
      const y = detail.y ?? window.innerHeight / 2;
      layer.style.setProperty("--transition-x", `${x}px`);
      layer.style.setProperty("--transition-y", `${y}px`);
      layer.dataset.variant =
        detail.variant ?? (detail.type === "portal" ? "portal" : "expansion");
      layer.classList.remove("web-transition--active");
      void layer.offsetWidth;
      layer.classList.add("web-transition--active");
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = window.setTimeout(
        () => layer.classList.remove("web-transition--active"),
        detail.type === "portal" || detail.variant === "energy"
          ? 760
          : detail.variant === "shatter"
            ? 620
            : 700
      );
    };

    const handleClick = (event: MouseEvent) => {
      if (!(event.target instanceof Element)) return;
      const target = event.target;
      if (event.detail === 0) {
        const bounds = target.getBoundingClientRect();
        window.dispatchEvent(
          new CustomEvent("spider:ripple", {
            detail: {
              x: bounds.left + bounds.width / 2,
              y: bounds.top + bounds.height / 2,
              strength: 0.8,
            },
          })
        );
      }

      const portal = target.closest(
        ".project-feature-visual, .project-detail-button"
      );

      if (portal) {
        const bounds = portal.getBoundingClientRect();
        activate({
          type: "portal",
          x: bounds.left + bounds.width / 2,
          y: bounds.top + bounds.height / 2,
        });
        return;
      }

      const link = target.closest<HTMLAnchorElement>("a[href^='#']");
      if (!link || link.getAttribute("href") === window.location.hash) return;
      const section = document.getElementById(
        (link.getAttribute("href") ?? "").slice(1)
      );
      if (!section) return;
      const variants: Record<string, TransitionDetail["variant"]> = {
        home: "spider",
        about: "pull",
        skills: "expansion",
        projects: "energy",
        journey: "shatter",
        contact: "spider",
      };
      activate({
        type: "section",
        variant: variants[section.id] ?? "expansion",
        x: event.clientX,
        y: event.clientY,
      });
    };

    const handleTransition = (event: Event) => {
      activate((event as CustomEvent<TransitionDetail>).detail ?? {});
    };

    document.addEventListener("click", handleClick);
    window.addEventListener("spider:transition", handleTransition);
    return () => {
      window.clearTimeout(timeoutRef.current);
      document.removeEventListener("click", handleClick);
      window.removeEventListener("spider:transition", handleTransition);
    };
  }, []);

  return (
    <div
      ref={layerRef}
      className="web-transition"
      aria-hidden="true"
      data-variant="section"
    >
      <svg viewBox="0 0 1000 1000" preserveAspectRatio="xMidYMid slice">
        <g className="transition-web">
          <circle cx="500" cy="500" r="95" />
          <circle cx="500" cy="500" r="190" />
          <circle cx="500" cy="500" r="285" />
          <circle cx="500" cy="500" r="380" />
          <circle cx="500" cy="500" r="475" />
          <path d="M500 500V0M500 500 750 67M500 500 933 250M500 500h500M500 500l433 250M500 500l250 433M500 500v500M500 500 250 933M500 500 67 750M500 500H0M500 500 67 250M500 500 250 67" />
        </g>
        <g className="transition-spider" transform="translate(500 115)">
          <path className="transition-spider-thread" d="M0-115V-16" />
          <path d="M-3-7-11-14-17-23M3-7 11-14 17-23M-4-3-16-5-21-12M4-3 16-5 21-12M-4 3-12 10-17 19M4 3 12 10 17 19M-2 5-6 15-6 23M2 5 6 15 6 23" />
          <ellipse cy="0" rx="4" ry="5" />
          <circle cy="-7" r="3" />
        </g>
      </svg>
    </div>
  );
}
