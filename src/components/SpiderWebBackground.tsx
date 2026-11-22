"use client";

import { useEffect, useRef } from "react";

interface Point {
  x: number;
  y: number;
}

interface WebNode extends Point {
  baseX: number;
  baseY: number;
  radius: number;
  phase: number;
  layer: number;
}

interface WebStrand {
  from: number;
  to: number;
  layer: number;
}

interface Particle extends Point {
  baseX: number;
  baseY: number;
  phase: number;
  speed: number;
  radius: number;
  layer: number;
}

interface Ripple extends Point {
  startedAt: number;
  strength: number;
}

interface InteractionEvent extends CustomEvent {
  detail: Point & { strength?: number };
}

const PARTICLE_COUNT = 42;
const MAX_DPR = 1.5;

function createNetwork(width: number, height: number) {
  const nodes: WebNode[] = [];
  const strands: WebStrand[] = [];
  const centers = [
    { x: width * 0.16, y: height * 0.27, radius: Math.max(width, height) * 0.48 },
    { x: width * 0.84, y: height * 0.72, radius: Math.max(width, height) * 0.42 },
  ];

  centers.forEach((center, layer) => {
    const ringCount = 4;
    const nodesPerRing = 16;
    const start = nodes.length;

    for (let ring = 1; ring <= ringCount; ring++) {
      const radius = (center.radius / ringCount) * ring;
      for (let index = 0; index < nodesPerRing; index++) {
        const angle =
          (Math.PI * 2 * index) / nodesPerRing +
          (ring % 2 === 0 ? Math.PI / nodesPerRing : 0);
        const x = center.x + Math.cos(angle) * radius;
        const y = center.y + Math.sin(angle) * radius;
        nodes.push({
          x,
          y,
          baseX: x,
          baseY: y,
          radius: ring === 1 ? 1.4 : 0.8,
          phase: Math.random() * Math.PI * 2,
          layer,
        });
      }
    }

    for (let ring = 0; ring < ringCount; ring++) {
      const offset = start + ring * nodesPerRing;
      const nextRing = offset + nodesPerRing;
      for (let index = 0; index < nodesPerRing; index++) {
        strands.push({
          from: offset + index,
          to: offset + ((index + 1) % nodesPerRing),
          layer,
        });
        if (ring < ringCount - 1) {
          strands.push({
            from: offset + index,
            to: nextRing + index,
            layer,
          });
          strands.push({
            from: offset + index,
            to: nextRing + ((index + 1) % nodesPerRing),
            layer,
          });
        }
      }
    }
  });

  const particles: Particle[] = Array.from({ length: PARTICLE_COUNT }, (_, index) => {
    const x = Math.random() * width;
    const y = Math.random() * height;
    return {
      x,
      y,
      baseX: x,
      baseY: y,
      phase: (Math.PI * 2 * index) / PARTICLE_COUNT,
      speed: 0.18 + Math.random() * 0.45,
      radius: 0.6 + Math.random() * 1.2,
      layer: index % 2,
    };
  });

  return { nodes, strands, particles };
}

export default function SpiderWebBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const nodesRef = useRef<WebNode[]>([]);
  const strandsRef = useRef<WebStrand[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const pointerRef = useRef<Point>({ x: -1000, y: -1000 });
  const ripplesRef = useRef<Ripple[]>([]);
  const scrollRef = useRef(0);
  const portalHoverRef = useRef(false);
  const reducedMotionRef = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d", { alpha: true });
    if (!context) return;
    const drawingContext: CanvasRenderingContext2D = context;

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const compactQuery = window.matchMedia(
      "(max-width: 760px), (pointer: coarse)"
    );
    reducedMotionRef.current = motionQuery.matches || compactQuery.matches;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
      canvas.width = Math.round(window.innerWidth * dpr);
      canvas.height = Math.round(window.innerHeight * dpr);
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      drawingContext.setTransform(dpr, 0, 0, dpr, 0, 0);

      const network = createNetwork(window.innerWidth, window.innerHeight);
      nodesRef.current = network.nodes;
      strandsRef.current = network.strands;
      particlesRef.current = network.particles;
      render(performance.now());
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse" && event.pointerType !== "pen") return;
      pointerRef.current = { x: event.clientX, y: event.clientY };
    };

    const handlePointerLeave = () => {
      pointerRef.current = { x: -1000, y: -1000 };
    };

    const handlePointerOver = (event: PointerEvent) => {
      const target = event.target;
      portalHoverRef.current =
        target instanceof Element &&
        Boolean(target.closest(".project-feature, .project-feature-visual"));
      canvas.classList.toggle("web-background--portal", portalHoverRef.current);
    };

    const handleRipple = (event: Event) => {
      const { x, y, strength = 1 } = (event as InteractionEvent).detail;
      if (!Number.isFinite(x) || !Number.isFinite(y)) return;
      ripplesRef.current.push({ x, y, startedAt: performance.now(), strength });
      ripplesRef.current = ripplesRef.current.slice(-4);
      if (reducedMotionRef.current) render(performance.now());
    };

    const handleScroll = () => {
      scrollRef.current = window.scrollY;
    };

    const handleMotionChange = () => {
      reducedMotionRef.current = motionQuery.matches || compactQuery.matches;
      cancelAnimationFrame(animationRef.current);
      if (reducedMotionRef.current) {
        render(0);
      } else {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    function drawWeb(time: number) {
      const pointer = pointerRef.current;
      const portalFactor = portalHoverRef.current ? 1.5 : 1;
      const nodes = nodesRef.current;
      const strands = strandsRef.current;
      const moved = new Map<number, Point>();

      const displace = (index: number) => {
        const existing = moved.get(index);
        if (existing) return existing;

        const node = nodes[index];
        const layerOffset = scrollRef.current * (node.layer === 0 ? 0.012 : 0.026);
        const baseY = node.baseY - layerOffset;
        const dx = node.baseX - pointer.x;
        const dy = baseY - pointer.y;
        const distance = Math.hypot(dx, dy);
        let x = node.baseX;
        let y = baseY;

        if (distance < 150 && distance > 0) {
          const influence = (1 - distance / 150) * 12 * portalFactor;
          const direction = portalHoverRef.current ? 1 : -0.65;
          x += (dx / distance) * influence * direction;
          y += (dy / distance) * influence * direction;
        }

        const float = reducedMotionRef.current
          ? 0
          : Math.sin(time * 0.0007 + node.phase) * 1.5;
        y += float;
        const result = { x, y };
        moved.set(index, result);
        return result;
      };

      for (const strand of strands) {
        const start = displace(strand.from);
        const end = displace(strand.to);
        const midpointX = (start.x + end.x) / 2;
        const midpointY = (start.y + end.y) / 2;
        const dx = midpointX - pointer.x;
        const dy = midpointY - pointer.y;
        const distance = Math.hypot(dx, dy);
        const force =
          distance < 145 ? (1 - distance / 145) * 11 * portalFactor : 0;
        const invDistance = distance === 0 ? 0 : 1 / distance;
        const bend = portalHoverRef.current ? -1 : 0.55;

        drawingContext.beginPath();
        drawingContext.moveTo(start.x, start.y);
        drawingContext.quadraticCurveTo(
          midpointX + dx * invDistance * force * bend,
          midpointY + dy * invDistance * force * bend,
          end.x,
          end.y
        );
        drawingContext.strokeStyle =
          strand.layer === 0
            ? `rgba(239, 236, 231, ${0.08 + force * 0.004})`
            : `rgba(229, 57, 53, ${0.04 + force * 0.006})`;
        drawingContext.lineWidth = strand.layer === 0 ? 0.55 : 0.7;
        drawingContext.stroke();
      }

      for (let index = 0; index < nodes.length; index++) {
        const node = nodes[index];
        const point = displace(index);
        const pulse = reducedMotionRef.current
          ? 0
          : (Math.sin(time * 0.001 + node.phase) + 1) * 0.35;
        const distance = Math.hypot(point.x - pointer.x, point.y - pointer.y);
        const nearPointer = distance < 120;
        const alpha = nearPointer ? 0.82 : 0.2 + pulse;

        drawingContext.beginPath();
        drawingContext.arc(point.x, point.y, node.radius + (nearPointer ? 0.8 : pulse), 0, Math.PI * 2);
        drawingContext.fillStyle = nearPointer
          ? "rgba(229, 57, 53, .88)"
          : node.layer === 0
            ? `rgba(239, 236, 231, ${alpha})`
            : `rgba(229, 57, 53, ${alpha * 0.62})`;
        drawingContext.fill();
      }
    }

    function drawParticles(time: number) {
      const pointer = pointerRef.current;
      const elapsed = reducedMotionRef.current ? 0 : time * 0.001;

      for (const particle of particlesRef.current) {
        const driftX = Math.sin(elapsed * particle.speed + particle.phase) * 12;
        const driftY = Math.cos(elapsed * particle.speed * 0.8 + particle.phase) * 10;
        let x = particle.baseX + driftX;
        let y = particle.baseY + driftY - scrollRef.current * (particle.layer === 0 ? 0.018 : 0.035);
        const dx = x - pointer.x;
        const dy = y - pointer.y;
        const distance = Math.hypot(dx, dy);

        if (distance < 105 && distance > 0) {
          const reaction = (1 - distance / 105) * 19;
          const direction = portalHoverRef.current ? -1 : 1;
          x += (dx / distance) * reaction * direction;
          y += (dy / distance) * reaction * direction;
        }

        const nearPointer = distance < 115;
        const alpha = nearPointer ? 0.72 : 0.28 + Math.sin(elapsed + particle.phase) * 0.12;
        drawingContext.beginPath();
        drawingContext.arc(x, y, particle.radius + (nearPointer ? 0.55 : 0), 0, Math.PI * 2);
        drawingContext.fillStyle =
          particle.layer === 0
            ? `rgba(243, 241, 237, ${alpha})`
            : `rgba(229, 57, 53, ${alpha * 0.76})`;
        drawingContext.fill();
      }
    }

    function drawRipples(time: number) {
      ripplesRef.current = ripplesRef.current.filter(
        (ripple) => time - ripple.startedAt < 920
      );

      for (const ripple of ripplesRef.current) {
        const progress = (time - ripple.startedAt) / 920;
        const radius = 8 + progress * 150;
        const alpha = (1 - progress) * 0.38 * ripple.strength;

        drawingContext.beginPath();
        drawingContext.arc(ripple.x, ripple.y, radius, 0, Math.PI * 2);
        drawingContext.strokeStyle = `rgba(229, 57, 53, ${alpha})`;
        drawingContext.lineWidth = 0.8;
        drawingContext.stroke();
        drawingContext.beginPath();
        drawingContext.arc(ripple.x, ripple.y, radius * 0.72, 0, Math.PI * 2);
        drawingContext.strokeStyle = `rgba(243, 241, 237, ${alpha * 0.24})`;
        drawingContext.lineWidth = 0.5;
        drawingContext.stroke();
      }
    }

    function render(time: number) {
      const width = window.innerWidth;
      const height = window.innerHeight;
      drawingContext.clearRect(0, 0, width, height);

      const pointer = pointerRef.current;
      const atmosphericLights = [
        { x: width * 0.18, y: height * 0.28, radius: width * 0.48, alpha: 0.042 },
        { x: width * 0.82, y: height * 0.72, radius: width * 0.36, alpha: 0.032 },
      ];
      for (const light of atmosphericLights) {
        const atmosphere = drawingContext.createRadialGradient(
          light.x,
          light.y,
          0,
          light.x,
          light.y,
          light.radius
        );
        atmosphere.addColorStop(0, `rgba(229, 57, 53, ${light.alpha})`);
        atmosphere.addColorStop(1, "rgba(229, 57, 53, 0)");
        drawingContext.fillStyle = atmosphere;
        drawingContext.fillRect(0, 0, width, height);
      }

      const glow = drawingContext.createRadialGradient(
        pointer.x,
        pointer.y,
        0,
        pointer.x,
        pointer.y,
        portalHoverRef.current ? 255 : 185
      );
      glow.addColorStop(
        0,
        portalHoverRef.current
          ? "rgba(229, 57, 53, .1)"
          : "rgba(229, 57, 53, .045)"
      );
      glow.addColorStop(1, "rgba(229, 57, 53, 0)");
      drawingContext.fillStyle = glow;
      drawingContext.fillRect(0, 0, width, height);

      drawWeb(time);
      drawParticles(time);
      drawRipples(time);
    }

    function animate(time: number) {
      if (reducedMotionRef.current || document.hidden) return;
      render(time);
      animationRef.current = requestAnimationFrame(animate);
    }

    const handleVisibility = () => {
      cancelAnimationFrame(animationRef.current);
      if (!document.hidden && !reducedMotionRef.current) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    resize();
    if (!reducedMotionRef.current) {
      animationRef.current = requestAnimationFrame(animate);
    }
    window.addEventListener("resize", resize, { passive: true });
    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("pointerleave", handlePointerLeave);
    window.addEventListener("pointerover", handlePointerOver, { passive: true });
    window.addEventListener("spider:ripple", handleRipple);
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("blur", handlePointerLeave);
    document.addEventListener("visibilitychange", handleVisibility);
    motionQuery.addEventListener("change", handleMotionChange);
    compactQuery.addEventListener("change", handleMotionChange);

    return () => {
      cancelAnimationFrame(animationRef.current);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerleave", handlePointerLeave);
      window.removeEventListener("pointerover", handlePointerOver);
      window.removeEventListener("spider:ripple", handleRipple);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("blur", handlePointerLeave);
      document.removeEventListener("visibilitychange", handleVisibility);
      motionQuery.removeEventListener("change", handleMotionChange);
      compactQuery.removeEventListener("change", handleMotionChange);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="web-background"
      aria-hidden="true"
    />
  );
}
