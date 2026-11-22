"use client";

import { useRef, useState } from "react";
import { flushSync } from "react-dom";
import ScrollReveal from "@/components/ScrollReveal";
import ProjectDetailsDialog from "@/components/ProjectDetailsDialog";
import ProjectIllustration from "@/components/ProjectIllustration";
import { projects } from "@/data/projects";
import type { PortfolioProject } from "@/data/projects";

export default function ProjectsSection() {
  const [selectedProject, setSelectedProject] =
    useState<PortfolioProject | null>(null);
  const sourceIllustrationRef = useRef<HTMLElement | null>(null);

  const openProject = (project: PortfolioProject, trigger: HTMLElement) => {
    const source =
      trigger.querySelector<HTMLElement>(".project-illustration") ??
      trigger
        .closest(".project-feature")
        ?.querySelector<HTMLElement>(".project-illustration") ??
      null;
    sourceIllustrationRef.current = source;

    if (!source || typeof document.startViewTransition !== "function") {
      setSelectedProject(project);
      return;
    }

    source.style.viewTransitionName = "project-preview";
    const transition = document.startViewTransition(() => {
      source.style.viewTransitionName = "none";
      flushSync(() => setSelectedProject(project));
    });
    void transition.finished.then(() => {
      source.style.viewTransitionName = "";
    });
  };

  const closeProject = () => {
    const source = sourceIllustrationRef.current;
    const destination =
      document.querySelector<HTMLElement>(".project-dialog .project-illustration");

    if (
      !source ||
      !destination ||
      typeof document.startViewTransition !== "function"
    ) {
      setSelectedProject(null);
      return;
    }

    destination.style.viewTransitionName = "project-preview";
    const transition = document.startViewTransition(() => {
      destination.style.viewTransitionName = "";
      source.style.viewTransitionName = "project-preview";
      flushSync(() => setSelectedProject(null));
    });
    void transition.finished.then(() => {
      source.style.viewTransitionName = "";
    });
  };

  return (
    <section id="projects" className="content-section projects-section">
      <div className="section-shell">
        <ScrollReveal className="section-heading-block">
          <p className="section-kicker">
            <span>04</span> The multiverse
          </p>
          <div className="section-heading-row">
            <h2 className="section-title">
              Ideas, made
              <br />
              <span>tangible.</span>
            </h2>
            <p className="section-side-note">
              One flagship project.
              <br />
              More worlds to come.
            </p>
          </div>
        </ScrollReveal>

        <div className="project-list">
          {projects.map((project, index) => (
            <ScrollReveal
              className="project-feature"
              key={project.slug}
              delay={index * 100}
            >
              <button
                className="project-feature-visual"
                type="button"
                onClick={(event) => openProject(project, event.currentTarget)}
                onPointerMove={(event) => {
                  if (event.pointerType !== "mouse") return;
                  const bounds = event.currentTarget.getBoundingClientRect();
                  const x =
                    (event.clientX - bounds.left) / bounds.width - 0.5;
                  const y =
                    (event.clientY - bounds.top) / bounds.height - 0.5;
                  event.currentTarget.style.setProperty(
                    "--card-tilt-x",
                    `${-y * 2.4}deg`
                  );
                  event.currentTarget.style.setProperty(
                    "--card-tilt-y",
                    `${x * 2.4}deg`
                  );
                }}
                onPointerLeave={(event) => {
                  event.currentTarget.style.setProperty("--card-tilt-x", "0deg");
                  event.currentTarget.style.setProperty("--card-tilt-y", "0deg");
                }}
                aria-label={`View details for ${project.title}`}
              >
                <ProjectIllustration compact />
                <span className="project-feature-open">
                  Open project <span aria-hidden="true">↗</span>
                </span>
              </button>
              <div className="project-feature-copy">
                <p className="project-category">
                  <span className="project-category-dot" />
                  {project.category}
                </p>
                <h3>
                  <span className="project-title-text">{project.title}</span>
                </h3>
                <p className="project-summary">{project.summary}</p>
                <ul className="project-stack" aria-label="Technology stack">
                  {project.technologies.slice(0, 6).map((technology) => (
                    <li key={technology}>{technology}</li>
                  ))}
                </ul>
                <div className="project-actions">
                  <button
                    className="project-detail-button"
                    type="button"
                    onClick={(event) => openProject(project, event.currentTarget)}
                  >
                    Explore project <span aria-hidden="true">↗</span>
                  </button>
                  <a
                    className="project-repo-link"
                    href={project.repositoryUrl}
                    target="_blank"
                    rel="noreferrer noopener"
                    aria-label={`Open ${project.title} on GitHub`}
                  >
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M12 .9a11.1 11.1 0 0 0-3.51 21.63c.56.1.76-.24.76-.54v-2.1c-3.1.67-3.76-1.32-3.76-1.32-.5-1.28-1.24-1.62-1.24-1.62-1.01-.7.08-.69.08-.69 1.12.08 1.71 1.15 1.71 1.15 1 .1.75 1.43 3.04 1.83.1-.72.39-1.21.7-1.49-2.48-.28-5.09-1.24-5.09-5.52 0-1.22.44-2.21 1.15-2.99-.12-.28-.5-1.42.11-2.96 0 0 .94-.3 3.06 1.14a10.7 10.7 0 0 1 5.57 0c2.12-1.44 3.06-1.14 3.06-1.14.61 1.54.23 2.68.11 2.96.72.78 1.15 1.77 1.15 2.99 0 4.29-2.61 5.23-5.1 5.51.4.35.75 1.03.75 2.08v3.08c0 .3.2.65.77.54A11.1 11.1 0 0 0 12 .9Z" />
                    </svg>
                    <span>GitHub</span>
                  </a>
                  {project.demoUrl && (
                    <a
                      className="project-detail-button"
                      href={project.demoUrl}
                      target="_blank"
                      rel="noreferrer noopener"
                    >
                      Live demo <span aria-hidden="true">↗</span>
                    </a>
                  )}
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
      {selectedProject && (
        <ProjectDetailsDialog
          project={selectedProject}
          onClose={closeProject}
        />
      )}
    </section>
  );
}
