"use client";

import { useEffect, useRef } from "react";

interface Point {
  x: number;
  y: number;
  time: number;
}

export default function CustomSpiderCursor() {
  const svgRef = useRef<SVGSVGElement>(null);
  const spiderRef = useRef<SVGGElement>(null);
  const trailRef = useRef<SVGPathElement>(null);
  const pointsRef = useRef<Point[]>([]);
  const targetRef = useRef<Point>({ x: -40, y: -40, time: 0 });
  const currentRef = useRef<Point>({ x: -40, y: -40, time: 0 });
  const frameRef = useRef<number>(0);
  const animatingRef = useRef(false);

  useEffect(() => {
    const pointerQuery = window.matchMedia("(hover: hover) and (pointer: fine)");
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    if (!pointerQuery.matches) return;

    const resizeCursor = () => {
      svgRef.current?.setAttribute(
        "viewBox",
        `0 0 ${window.innerWidth} ${window.innerHeight}`
      );
    };

    const updatePointerMode = () => {
      const enabled = pointerQuery.matches && !motionQuery.matches;
      document.documentElement.classList.toggle("has-spider-cursor", enabled);
      if (!enabled) {
        cancelAnimationFrame(frameRef.current);
        animatingRef.current = false;
        pointsRef.current = [];
        trailRef.current?.setAttribute("d", "");
      }
    };

    const handlePointerMove = (event: PointerEvent) => {
      const point = {
        x: event.clientX,
        y: event.clientY,
        time: performance.now(),
      };
      targetRef.current = point;
      pointsRef.current.unshift(point);
      pointsRef.current = pointsRef.current.slice(0, 8);
      svgRef.current?.classList.remove("spider-cursor--out");

      if (!animatingRef.current) {
        animatingRef.current = true;
        frameRef.current = requestAnimationFrame(render);
      }
    };

    const handlePointerOver = (event: PointerEvent) => {
      const target = event.target;
      const element = target instanceof Element ? target : null;
      let variant = "";
      if (element?.closest(".project-feature, .project-feature-visual")) {
        variant = "card";
      } else if (element?.closest(".desktop-nav a, .brand-mark")) {
        variant = "nav";
      } else if (
        element?.closest(
          "a, button, [role='button'], [data-cursor='interactive']"
        )
      ) {
        variant = "button";
      }

      spiderRef.current?.setAttribute("data-variant", variant);
    };

    const handlePointerLeave = () => {
      svgRef.current?.classList.add("spider-cursor--out");
    };

    const handleEnvironmentCursor = (event: Event) => {
      const { variant } = (event as CustomEvent<{ variant?: string }>).detail ?? {};
      spiderRef.current?.setAttribute("data-variant", variant ?? "");
    };

    const handlePointerDown = (event: PointerEvent) => {
      const element =
        event.target instanceof Element ? event.target : null;
      if (!element?.closest("a, button, [role='button']")) return;
      spiderRef.current?.classList.add("cursor-spider--click");
      window.dispatchEvent(
        new CustomEvent("spider:ripple", {
          detail: { x: event.clientX, y: event.clientY, strength: 1 },
        })
      );
      window.setTimeout(
        () => spiderRef.current?.classList.remove("cursor-spider--click"),
        260
      );
    };

    function render() {
      const current = currentRef.current;
      const target = targetRef.current;
      current.x += (target.x - current.x) * 0.28;
      current.y += (target.y - current.y) * 0.28;

      spiderRef.current?.setAttribute(
        "transform",
        `translate(${current.x} ${current.y})`
      );

      const now = performance.now();
      const points = pointsRef.current.filter((point) => now - point.time < 260);
      pointsRef.current = points;
      if (trailRef.current && points.length > 1) {
        const path = points
          .slice(0, 6)
          .map((point, index) =>
            `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`
          )
          .join(" ");
        trailRef.current.setAttribute("d", path);
      } else if (trailRef.current && points.length === 0) {
        trailRef.current.setAttribute("d", "");
      }

      const settled =
        Math.abs(target.x - current.x) < 0.12 &&
        Math.abs(target.y - current.y) < 0.12;
      if (!settled || points.length > 0) {
        frameRef.current = requestAnimationFrame(render);
      } else {
        animatingRef.current = false;
      }
    }

    resizeCursor();
    window.addEventListener("resize", resizeCursor, { passive: true });
    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("pointerover", handlePointerOver, { passive: true });
    window.addEventListener("pointerdown", handlePointerDown, { passive: true });
    window.addEventListener("pointerleave", handlePointerLeave);
    window.addEventListener("spider:cursor", handleEnvironmentCursor);
    pointerQuery.addEventListener("change", updatePointerMode);
    motionQuery.addEventListener("change", updatePointerMode);
    updatePointerMode();

    return () => {
      cancelAnimationFrame(frameRef.current);
      animatingRef.current = false;
      document.documentElement.classList.remove("has-spider-cursor");
      window.removeEventListener("resize", resizeCursor);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerover", handlePointerOver);
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("pointerleave", handlePointerLeave);
      window.removeEventListener("spider:cursor", handleEnvironmentCursor);
      pointerQuery.removeEventListener("change", updatePointerMode);
      motionQuery.removeEventListener("change", updatePointerMode);
    };
  }, []);

  return (
    <svg
      ref={svgRef}
      className="spider-cursor spider-cursor--out"
      aria-hidden="true"
      viewBox="0 0 1 1"
      preserveAspectRatio="none"
    >
      <path ref={trailRef} className="cursor-web-trail" d="" />
      <g ref={spiderRef} className="cursor-spider" transform="translate(-40 -40)">
        <g className="cursor-spider-mark">
          <path
            className="cursor-spider-legs"
            d="M-2-2-5-4-7-7M2-2 5-4 7-7M-2-1-6-1-8-4M2-1 6-1 8-4M-2 1-5 4-7 7M2 1 5 4 7 7M-1 2-2 5-2 7M1 2 2 5 2 7"
          />
          <ellipse className="cursor-spider-body" cx="0" cy="0" rx="2" ry="2.7" />
          <circle className="cursor-spider-head" cx="0" cy="-3.2" r="1.45" />
          <circle className="cursor-spider-core" cx="0" cy="0" r=".65" />
        </g>
      </g>
    </svg>
  );
}
