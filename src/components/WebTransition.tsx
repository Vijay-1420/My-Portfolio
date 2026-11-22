"use client";

import { useEffect, useRef } from "react";

interface TransitionDetail {
  type?: "section" | "portal";
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
      layer.dataset.variant = detail.type ?? "section";
      layer.classList.remove("web-transition--active");
      void layer.offsetWidth;
      layer.classList.add("web-transition--active");
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = window.setTimeout(
        () => layer.classList.remove("web-transition--active"),
        detail.type === "portal" ? 740 : 660
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
      activate({ type: "section", x: event.clientX, y: event.clientY });
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
      </svg>
    </div>
  );
}
