"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

const NAV_LINKS = [
  { label: "Home", href: "#home" },
  { label: "About", href: "#about" },
  { label: "Skills", href: "#skills" },
  { label: "Projects", href: "#projects" },
  { label: "Journey", href: "#journey" },
  { label: "Contact", href: "#contact" },
] as const;

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 24);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    const sections = NAV_LINKS.map((link) =>
      document.querySelector<HTMLElement>(link.href)
    ).filter((section): section is HTMLElement => section !== null);

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleSection = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visibleSection) setActiveSection(visibleSection.target.id);
      },
      { rootMargin: "-30% 0px -55% 0px", threshold: [0, 0.2, 0.5, 1] }
    );
    sections.forEach((section) => observer.observe(section));

    return () => {
      window.removeEventListener("scroll", handleScroll);
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!mobileOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [mobileOpen]);

  useEffect(() => {
    const desktopQuery = window.matchMedia("(min-width: 761px)");
    const closeOnDesktop = (event: MediaQueryListEvent) => {
      if (event.matches) setMobileOpen(false);
    };

    desktopQuery.addEventListener("change", closeOnDesktop);
    return () => desktopQuery.removeEventListener("change", closeOnDesktop);
  }, []);

  const closeMobile = useCallback(() => setMobileOpen(false), []);

  return (
    <header className={`site-header${scrolled ? " site-header--scrolled" : ""}`}>
      <nav className="site-nav" aria-label="Main navigation">
        <Link
          href="#home"
          className="brand-mark"
          aria-label="SPIDER//VERSE — home"
          onClick={closeMobile}
        >
          <span>SPIDER</span>
          <span className="brand-mark-slash">{"//"}</span>
          <span className="brand-mark-muted">VERSE</span>
        </Link>

        <ul className="desktop-nav">
          {NAV_LINKS.map((link, index) => {
            const sectionId = link.href.slice(1);
            return (
              <li key={link.label}>
                <Link
                  href={link.href}
                  className={activeSection === sectionId ? "is-active" : ""}
                  aria-current={activeSection === sectionId ? "location" : undefined}
                  onClick={() => setActiveSection(sectionId)}
                >
                  <span className="nav-index">0{index + 1}</span>
                  {link.label}
                </Link>
              </li>
            );
          })}
        </ul>

        <Link href="#contact" className="nav-contact">
          Let&apos;s connect <span aria-hidden="true">↗</span>
        </Link>

        <button
          className={`menu-toggle${mobileOpen ? " menu-toggle--open" : ""}`}
          type="button"
          onClick={() => setMobileOpen((open) => !open)}
          aria-label={mobileOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={mobileOpen}
          aria-controls="mobile-navigation"
        >
          <span />
          <span />
        </button>
      </nav>

      <div
        id="mobile-navigation"
        className={`mobile-navigation${mobileOpen ? " mobile-navigation--open" : ""}`}
        aria-hidden={!mobileOpen}
      >
        <p className="mobile-menu-label">Navigate the verse</p>
        <ul>
          {NAV_LINKS.map((link, index) => (
            <li key={link.label}>
              <Link
                href={link.href}
                className={
                  activeSection === link.href.slice(1) ? "is-active" : ""
                }
                aria-current={
                  activeSection === link.href.slice(1) ? "location" : undefined
                }
                onClick={closeMobile}
                tabIndex={mobileOpen ? 0 : -1}
              >
                <span>0{index + 1}</span>
                {link.label}
                <span aria-hidden="true">↗</span>
              </Link>
            </li>
          ))}
        </ul>
        <p className="mobile-menu-foot">SPIDER//VERSE — Vijayasarathy B</p>
      </div>
    </header>
  );
}
