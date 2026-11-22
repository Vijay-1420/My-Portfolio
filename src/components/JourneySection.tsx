import ScrollReveal from "@/components/ScrollReveal";

const MILESTONES = [
  {
    label: "FOUNDATION",
    title: "Engineering perspective",
    description:
      "An engineering background informs how I break down technical problems and think about how ideas work as systems.",
  },
  {
    label: "LEARNING JOURNEY",
    title: "Exploring intelligent software",
    description:
      "Following a growing interest in AI, data science, and software development - with a focus on practical applications.",
  },
  {
    label: "VERIFIED PROJECT",
    title: "AI Interview Coach Fullstack",
    description:
      "A full-stack interview-practice application with guided mock interviews, answer feedback, and a conversational AI interviewer.",
    href: "#projects",
  },
  {
    label: "IN PROGRESS",
    title: "Keep learning. Keep building.",
    description:
      "The next step is always another useful idea to explore, build, and refine.",
  },
];

export default function JourneySection() {
  return (
    <section id="journey" className="content-section journey-section">
      <div className="section-shell">
        <ScrollReveal className="section-heading-block">
          <p className="section-kicker">
            <span>05</span> Mission log
          </p>
          <div className="section-heading-row">
            <h2 className="section-title">
              Still in
              <br />
              <span>the making.</span>
            </h2>
            <p className="section-side-note">
              A timeline of foundations,
              <br />
              explorations, and things built.
            </p>
          </div>
        </ScrollReveal>

        <ol className="journey-list">
          {MILESTONES.map((milestone, index) => (
            <li className="journey-item" key={milestone.title}>
              <span className="journey-track" aria-hidden="true">
                <span className="journey-node" />
              </span>
              <ScrollReveal className="journey-card" delay={index * 80}>
                <div className="journey-card-top">
                  <span className="journey-number">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="journey-label">{milestone.label}</span>
                </div>
                <div className="journey-card-body">
                  <h3>{milestone.title}</h3>
                  <p>{milestone.description}</p>
                  {milestone.href && (
                    <a href={milestone.href} className="journey-link">
                      See the project <span aria-hidden="true">↗</span>
                    </a>
                  )}
                </div>
              </ScrollReveal>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
