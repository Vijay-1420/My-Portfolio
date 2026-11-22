"use client";

import { useEffect, useState } from "react";

export default function CinematicIntro() {
  const [visible, setVisible] = useState(true);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    const motionPreference = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    );

    const timer = window.setTimeout(
      () => setLeaving(true),
      motionPreference.matches ? 0 : 2450
    );
    return () => {
      window.clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    if (!leaving) return;

    const motionPreference = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    );
    const timer = window.setTimeout(() => {
      setVisible(false);
      document.documentElement.classList.add("intro-complete");
    }, motionPreference.matches ? 0 : 650);

    return () => window.clearTimeout(timer);
  }, [leaving]);

  if (!visible) return null;

  return (
    <div
      className={`intro-screen${leaving ? " intro-screen--leaving" : ""}`}
      role="dialog"
      aria-modal="true"
      aria-label="SPIDER//VERSE introduction"
    >
      <div className="intro-grain" aria-hidden="true" />
      <div className="intro-stage">
        <svg
          className="intro-web"
          viewBox="0 0 120 230"
          role="img"
          aria-label="An original spider descending on a web"
        >
          <path className="intro-web-line" d="M60 0v100" />
          <g className="intro-spider" fill="none" stroke="currentColor">
            <path d="M60 100v10" />
            <ellipse cx="60" cy="116" rx="5" ry="7" />
            <circle cx="60" cy="128" r="4" />
            <path d="M56 115 45 109 40 101m24 14 11-6 5-8M56 118l-13 1-7-5m24 4 13 1 7-5M56 121l-11 7-7 9m26-16 11 7 7 9" />
            <path className="intro-eyes" d="m58 127 1 1m3-1-1 1" />
          </g>
        </svg>
        <div className="intro-copy">
          <span className="intro-kicker">An independent creative universe</span>
          <p className="intro-wordmark">
            SPIDER<span>{"//"}</span>VERSE
          </p>
          <p className="intro-name">VIJAYASARATHY B</p>
        </div>
      </div>
      <div className="intro-footer">
        <span>DESIGN · DATA · DEVELOPMENT</span>
        <button
          className="intro-skip"
          type="button"
          onClick={() => setLeaving(true)}
        >
          Skip intro <span aria-hidden="true">↗</span>
        </button>
      </div>
    </div>
  );
}
