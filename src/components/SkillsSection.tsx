"use client";

import { useMemo, useState } from "react";
import ScrollReveal from "@/components/ScrollReveal";

const SKILL_GROUPS = [
  { label: "All", key: "all" },
  { label: "Languages", key: "languages" },
  { label: "Web", key: "web" },
  { label: "AI & Data", key: "ai-data" },
  { label: "Tools", key: "tools" },
] as const;

const SKILLS = [
  { name: "Python", mark: "Py", group: "languages" },
  { name: "Java", mark: "Ja", group: "languages" },
  { name: "C", mark: "C", group: "languages" },
  { name: "SQL", mark: "SQL", group: "languages" },
  { name: "HTML", mark: "5", group: "web" },
  { name: "CSS", mark: "{}", group: "web" },
  { name: "JavaScript", mark: "JS", group: "web" },
  { name: "TypeScript", mark: "TS", group: "web" },
  { name: "React", mark: "⚛", group: "web" },
  { name: "Next.js", mark: "N", group: "web" },
  { name: "FastAPI", mark: "API", group: "web" },
  { name: "Machine Learning", mark: "ML", group: "ai-data" },
  { name: "Data Science", mark: "DS", group: "ai-data" },
  { name: "Git", mark: "↗", group: "tools" },
  { name: "GitHub", mark: "GH", group: "tools" },
] as const;

export default function SkillsSection() {
  const [activeGroup, setActiveGroup] = useState<(typeof SKILL_GROUPS)[number]["key"]>("all");
  const visibleSkills = useMemo(
    () =>
      activeGroup === "all"
        ? SKILLS
        : SKILLS.filter((skill) => skill.group === activeGroup),
    [activeGroup]
  );

  return (
    <section id="skills" className="content-section skills-section">
      <div className="section-shell">
        <ScrollReveal className="section-heading-block">
          <p className="section-kicker">
            <span>03</span> My arsenal
          </p>
          <div className="section-heading-row">
            <h2 className="section-title">
              Tools for
              <br />
              <span>what comes next.</span>
            </h2>
            <p className="section-side-note">
              A working set of technologies
              <br />
              I&apos;m exploring and building with.
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal className="skills-board" delay={100}>
          <div className="skills-board-topline">
            <span>TECHNOLOGY CONSTELLATION</span>
            <span>{String(visibleSkills.length).padStart(2, "0")} / 15</span>
          </div>
          <div className="skills-filters" role="group" aria-label="Filter skills by category">
            {SKILL_GROUPS.map((group) => (
              <button
                key={group.key}
                type="button"
                className={activeGroup === group.key ? "is-active" : ""}
                aria-pressed={activeGroup === group.key}
                onClick={() => setActiveGroup(group.key)}
              >
                {group.label}
              </button>
            ))}
          </div>
          <div className="skills-constellation">
            <svg className="skills-threads" viewBox="0 0 1000 470" aria-hidden="true">
              <g fill="none" stroke="currentColor">
                <path d="M92 88 277 153 470 78 660 170 879 89M92 88l51 238 134-173 196 168 187-151 219 82M143 326l227 76 103-171 201 171 119-232 138 156M277 153l93 249 196-232 84 232M470 78l3 249 187 91M660 170l-64 157" />
                <circle cx="92" cy="88" r="3" /><circle cx="277" cy="153" r="3" />
                <circle cx="470" cy="78" r="3" /><circle cx="660" cy="170" r="3" />
                <circle cx="879" cy="89" r="3" /><circle cx="143" cy="326" r="3" />
                <circle cx="370" cy="402" r="3" /><circle cx="473" cy="327" r="3" />
                <circle cx="596" cy="327" r="3" /><circle cx="797" cy="95" r="3" />
              </g>
            </svg>
            <div className="skills-grid">
              {visibleSkills.map((skill, index) => (
                <article
                  className="skill-card"
                  key={skill.name}
                  style={{ animationDelay: `${index * 35}ms` }}
                >
                  <span className="skill-mark" aria-hidden="true">
                    {skill.mark}
                  </span>
                  <span className="skill-name">{skill.name}</span>
                  <span className="skill-card-arrow" aria-hidden="true">
                    ↗
                  </span>
                </article>
              ))}
            </div>
          </div>
          <p className="skills-footnote">
            No scores, no shortcuts - just a growing set of tools and ideas.
          </p>
        </ScrollReveal>
      </div>
    </section>
  );
}
