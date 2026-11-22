"use client";

import { useEffect, useRef } from "react";
import type { PortfolioProject } from "@/data/projects";
import ProjectIllustration from "@/components/ProjectIllustration";

interface ProjectDetailsDialogProps {
  project: PortfolioProject;
  onClose: () => void;
}

function ArchitectureDiagram({
  steps,
}: {
  steps: PortfolioProject["architectureFlow"];
}) {
  return (
    <ol className="architecture-flow" aria-label="Project architecture workflow">
      {steps.map((step, index) => (
        <li className="architecture-node" key={step.label}>
          <span className="architecture-node-index">
            {String(index + 1).padStart(2, "0")}
          </span>
          <strong>{step.label}</strong>
          <span>{step.detail}</span>
        </li>
      ))}
    </ol>
  );
}

export default function ProjectDetailsDialog({
  project,
  onClose,
}: ProjectDetailsDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    const previouslyFocused =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;

    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }

      if (event.key !== "Tab" || !dialogRef.current) return;
      const focusable = Array.from(
        dialogRef.current.querySelectorAll<HTMLElement>(
          "a[href], button:not([disabled])"
        )
      );
      if (focusable.length === 0) {
        event.preventDefault();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
      previouslyFocused?.focus();
    };
  }, [onClose]);

  return (
    <div
      className="project-dialog-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        className="project-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="project-dialog-title"
        tabIndex={-1}
      >
        <div className="project-dialog-toolbar">
          <span>PROJECT FILE / {project.slug.toUpperCase()}</span>
          <button
            ref={closeButtonRef}
            className="project-dialog-close"
            type="button"
            aria-label="Close project details"
            onClick={onClose}
          >
            <span />
            <span />
          </button>
        </div>

        <div className="project-dialog-content">
          <p className="section-kicker">
            <span>01</span> {project.category}
          </p>
          <h2 id="project-dialog-title" className="project-dialog-title">
            {project.title}
          </h2>
          <p className="project-dialog-intro">{project.summary}</p>

          <ProjectIllustration shared />

          <div className="project-detail-grid">
            <section>
              <span className="project-detail-label">01 / THE CHALLENGE</span>
              <h3>Problem space</h3>
              <p>{project.problem}</p>
            </section>
            <section>
              <span className="project-detail-label">02 / THE WHY</span>
              <h3>Why it was created</h3>
              <p>{project.motivation}</p>
            </section>
            <section>
              <span className="project-detail-label">03 / THE RESPONSE</span>
              <h3>Proposed solution</h3>
              <p>{project.solution}</p>
            </section>
            <section>
              <span className="project-detail-label">04 / SYSTEM MAP</span>
              <h3>Architecture &amp; workflow</h3>
              <ArchitectureDiagram steps={project.architectureFlow} />
              <ul>
                {project.architecture.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>
            <section>
              <span className="project-detail-label">05 / CAPABILITIES</span>
              <h3>Main features</h3>
              <ul>
                {project.features.map((feature) => (
                  <li key={feature}>{feature}</li>
                ))}
              </ul>
            </section>
            <section>
              <span className="project-detail-label">06 / MY PART</span>
              <h3>Contribution</h3>
              <p>{project.contribution}</p>
            </section>
          </div>

          <div className="project-dialog-footer">
            <div>
              <span className="project-detail-label">TECHNOLOGY STACK</span>
              <ul className="project-stack project-stack--large">
                {project.technologies.map((technology) => (
                  <li key={technology}>{technology}</li>
                ))}
              </ul>
            </div>
            <div className="project-dialog-links">
              <a
                className="button-primary"
                href={project.repositoryUrl}
                target="_blank"
                rel="noreferrer noopener"
              >
                View repository <span className="button-arrow">↗</span>
              </a>
              {project.demoUrl && (
                <a
                  className="button-quiet"
                  href={project.demoUrl}
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  Live demo <span>↗</span>
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
