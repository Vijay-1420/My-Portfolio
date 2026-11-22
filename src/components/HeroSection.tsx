"use client";

import { useEffect, useRef } from "react";
import type { ReactNode } from "react";
import { profile } from "@/data/profile";

function SocialLink({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: ReactNode;
}) {
  return (
    <a
      className="hero-social-link"
      href={href}
      target="_blank"
      rel="noreferrer noopener"
      aria-label={label}
    >
      {children}
    </a>
  );
}

export default function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [firstName, familyInitial] = profile.name.split(" ");
  const [role, mission] = profile.headline.split(" | ");

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const pointerQuery = window.matchMedia(
      "(hover: hover) and (pointer: fine)"
    );
    if (motionQuery.matches || !pointerQuery.matches) return;

    const handlePointerMove = (event: PointerEvent) => {
      const bounds = section.getBoundingClientRect();
      const x = (event.clientX - bounds.left) / bounds.width - 0.5;
      const y = (event.clientY - bounds.top) / bounds.height - 0.5;

      const art = section.querySelector<HTMLElement>(".hero-art");
      art?.style.setProperty(
        "transform",
        `translate3d(${-x * 12}px, ${-y * 12}px, 0)`
      );

      section.querySelectorAll<HTMLElement>(".magnetic-target").forEach((item) => {
        const rect = item.getBoundingClientRect();
        const deltaX = event.clientX - (rect.left + rect.width / 2);
        const deltaY = event.clientY - (rect.top + rect.height / 2);
        const nearTarget = Math.abs(deltaX) < 100 && Math.abs(deltaY) < 70;
        item.style.setProperty("--mag-x", nearTarget ? `${deltaX * 0.08}px` : "0px");
        item.style.setProperty("--mag-y", nearTarget ? `${deltaY * 0.08}px` : "0px");
      });
    };

    const resetMagnetism = () => {
      section
        .querySelector<HTMLElement>(".hero-art")
        ?.style.setProperty("transform", "translate3d(0, 0, 0)");
      section.querySelectorAll<HTMLElement>(".magnetic-target").forEach((item) => {
        item.style.setProperty("--mag-x", "0px");
        item.style.setProperty("--mag-y", "0px");
      });
    };

    section.addEventListener("pointermove", handlePointerMove, {
      passive: true,
    });
    section.addEventListener("pointerleave", resetMagnetism);
    return () => {
      section.removeEventListener("pointermove", handlePointerMove);
      section.removeEventListener("pointerleave", resetMagnetism);
    };
  }, []);

  return (
    <section ref={sectionRef} id="home" className="hero-section">
      <div className="hero-ambient hero-ambient--one" aria-hidden="true" />
      <div className="hero-ambient hero-ambient--two" aria-hidden="true" />
      <div className="hero-gridline" aria-hidden="true" />

      <div className="hero-layout">
        <div className="hero-copy">
          <p className="hero-eyebrow hero-reveal">
            <span className="status-dot" />
            AI · DATA SCIENCE · SOFTWARE
          </p>

          <h1 className="hero-name hero-reveal">
            <span>{firstName}</span>
            <span className="hero-name-last">
              <span className="hero-slash" aria-hidden="true">
                {"//"}
              </span>
              <span className="hero-name-initial">{familyInitial}</span>
              <span className="hero-name-period">.</span>
            </span>
          </h1>

          <div className="hero-rule hero-reveal">
            <span />
            <span className="hero-rule-index">01 — 06</span>
          </div>

          <p className="hero-headline hero-reveal">
            {role}
            <span className="hero-headline-divider"> | </span>
            <span>{mission}</span>
          </p>
          <p className="hero-description hero-reveal">
            Exploring the space where thoughtful engineering meets intelligent
            technology, and turning ideas into practical digital experiences.
          </p>

          <div className="hero-actions hero-reveal">
            <a className="button-primary magnetic-target" href="#projects">
              <span>Explore projects</span>
              <span className="button-arrow" aria-hidden="true">
                ↗
              </span>
            </a>
            <a className="button-quiet magnetic-target" href="#contact">
              Contact me <span aria-hidden="true">→</span>
            </a>
          </div>

          <div className="hero-socials hero-reveal" aria-label="Social profiles">
            <span className="hero-social-label">Find me on</span>
            <SocialLink href={profile.socialLinks.github} label="GitHub">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 .9a11.1 11.1 0 0 0-3.51 21.63c.56.1.76-.24.76-.54v-2.1c-3.1.67-3.76-1.32-3.76-1.32-.5-1.28-1.24-1.62-1.24-1.62-1.01-.7.08-.69.08-.69 1.12.08 1.71 1.15 1.71 1.15 1 .1.75 1.43 3.04 1.83.1-.72.39-1.21.7-1.49-2.48-.28-5.09-1.24-5.09-5.52 0-1.22.44-2.21 1.15-2.99-.12-.28-.5-1.42.11-2.96 0 0 .94-.3 3.06 1.14a10.7 10.7 0 0 1 5.57 0c2.12-1.44 3.06-1.14 3.06-1.14.61 1.54.23 2.68.11 2.96.72.78 1.15 1.77 1.15 2.99 0 4.29-2.61 5.23-5.1 5.51.4.35.75 1.03.75 2.08v3.08c0 .3.2.65.77.54A11.1 11.1 0 0 0 12 .9Z" />
              </svg>
            </SocialLink>
            <SocialLink href={profile.socialLinks.linkedin} label="LinkedIn">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M20.45 2H3.55C2.69 2 2 2.68 2 3.52v16.96c0 .84.69 1.52 1.55 1.52h16.9c.86 0 1.55-.68 1.55-1.52V3.52c0-.84-.69-1.52-1.55-1.52ZM7.93 18.9H4.98V9.4h2.95v9.5ZM6.45 8.1a1.71 1.71 0 1 1 0-3.42 1.71 1.71 0 0 1 0 3.42Zm12.47 10.8h-2.94v-4.62c0-1.1-.02-2.52-1.54-2.52-1.55 0-1.79 1.2-1.79 2.44v4.7H9.7V9.4h2.82v1.3h.04c.4-.75 1.35-1.54 2.78-1.54 2.97 0 3.52 1.95 3.52 4.49v5.25h.06Z" />
              </svg>
            </SocialLink>
            {profile.socialLinks.instagram && (
              <SocialLink
                href={profile.socialLinks.instagram}
                label="Instagram"
              >
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <rect
                    x="3"
                    y="3"
                    width="18"
                    height="18"
                    rx="5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.7"
                  />
                  <circle
                    cx="12"
                    cy="12"
                    r="4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.7"
                  />
                  <circle cx="17.5" cy="6.8" r=".8" />
                </svg>
              </SocialLink>
            )}
            {profile.socialLinks.leetcode && (
              <SocialLink
                href={profile.socialLinks.leetcode}
                label="LeetCode"
              >
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    d="M8 5 3.5 12 8 19M16 5l4.5 7-4.5 7M13.5 8.5l-3 7"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.7"
                  />
                </svg>
              </SocialLink>
            )}
          </div>
        </div>

        <div className="hero-art" aria-hidden="true">
          <svg
            className="hero-descender"
            viewBox="0 0 64 150"
            fill="none"
          >
            <path className="hero-descender-thread" d="M32 0v86" />
            <g className="hero-descender-spider" transform="translate(32 103)">
              <path d="M-2-2-6-5-9-10M2-2 6-5 9-10M-2-1-8-2-11-6M2-1 8-2 11-6M-2 1-6 5-9 10M2 1 6 5 9 10M-1 2-3 7-3 12M1 2 3 7 3 12" />
              <ellipse cy="0" rx="2.5" ry="3.2" />
              <circle cy="-4" r="1.8" />
            </g>
          </svg>
          <div className="hero-art-coordinate hero-art-coordinate--top">
            SV / 001
          </div>
          <svg
            className="hero-web-art"
            viewBox="0 0 600 700"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <radialGradient id="web-glow">
                <stop stopColor="#e53935" stopOpacity=".18" />
                <stop offset="1" stopColor="#e53935" stopOpacity="0" />
              </radialGradient>
              <linearGradient id="web-line" x1="120" y1="60" x2="500" y2="630">
                <stop stopColor="white" stopOpacity=".32" />
                <stop offset="1" stopColor="white" stopOpacity=".025" />
              </linearGradient>
            </defs>
            <circle cx="330" cy="340" r="248" fill="url(#web-glow)" />
            <g stroke="url(#web-line)" strokeWidth=".8">
              <path d="M330 340 330 4M330 340 474 37M330 340 584 156M330 340 598 340M330 340 584 524M330 340 474 643M330 340 330 676M330 340 186 643M330 340 76 524M330 340 62 340M330 340 76 156M330 340 186 37" />
              <path d="M241 153c35-21 143-21 178 0 28 17 42 46 42 83 0 37-14 68-42 91-35 28-143 28-178 0-28-23-42-54-42-91 0-37 14-66 42-83Zm-38-39c53-40 211-40 264 0 42 32 64 77 64 135 0 57-22 104-64 139-53 45-211 45-264 0-42-35-64-82-64-139 0-58 22-103 64-135Zm-39-43c69-60 285-60 354 0 56 48 85 107 85 178s-29 132-85 183c-69 69-285 69-354 0-56-51-85-112-85-183s29-130 85-178Z" />
              <path d="M330 92v496M124 340h412M184 171l292 338M476 171 184 509M249 104l162 472M486 242 174 438M411 104 249 576M536 242 124 438" opacity=".48" />
            </g>
            <g className="hero-web-points" fill="#e53935">
              <circle cx="330" cy="4" r="2" />
              <circle cx="584" cy="156" r="2" />
              <circle cx="598" cy="340" r="2" />
              <circle cx="76" cy="524" r="2" />
              <circle cx="186" cy="37" r="2" />
            </g>
            <g className="hero-spider-mark" transform="translate(330 340)">
              <path d="M-11-8-30-24-39-42M11-8 30-24 39-42M-13-3-39-8-51-22M13-3 39-8 51-22M-12 5-31 22-38 42M12 5 31 22 38 42M-7 11-16 34-15 48M7 11 16 34 15 48" />
              <ellipse cy="-2" rx="14" ry="19" />
              <circle cy="-24" r="10" />
              <path className="hero-spider-eyes" d="m-4-26 2 2m10-2-2 2" />
            </g>
          </svg>
          <div className="hero-art-coordinate hero-art-coordinate--bottom">
            <span>FIELD NOTES / 01</span>
            <span className="coordinate-dot" />
            <span>BUILD · LEARN · REPEAT</span>
          </div>
          <div className="hero-art-caption">A little structure in the chaos.</div>
        </div>
      </div>

      <div className="hero-bottomline">
        <span>INDEPENDENT DEVELOPER PORTFOLIO</span>
        <a href="#about" className="scroll-cue">
          <span>Scroll to explore</span>
          <span className="scroll-cue-line" aria-hidden="true" />
        </a>
        <span>BUILT WITH CURIOSITY</span>
      </div>
    </section>
  );
}
