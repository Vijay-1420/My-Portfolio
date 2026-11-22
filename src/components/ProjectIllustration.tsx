interface ProjectIllustrationProps {
  compact?: boolean;
  shared?: boolean;
}

export default function ProjectIllustration({
  compact = false,
  shared = false,
}: ProjectIllustrationProps) {
  return (
    <div
      className={`project-illustration${compact ? " project-illustration--compact" : ""}${shared ? " project-illustration--shared" : ""}`}
      role="img"
      aria-label="Original conceptual illustration of an interview practice interface, not a product screenshot"
    >
      <div className="project-illustration-topbar">
        <div className="project-illustration-brand">
          <span className="project-illustration-mark">i</span>
          <span>InterviewAI</span>
        </div>
        <span className="project-illustration-chip">CONCEPTUAL MOCKUP</span>
      </div>
      <div className="project-illustration-body">
        <aside className="project-illustration-sidebar">
          <span className="mock-sidebar-active">Overview</span>
          <span>Practice</span>
          <span>History</span>
          <span className="mock-sidebar-spacer" />
          <span className="mock-sidebar-avatar">VB</span>
        </aside>
        <div className="project-illustration-main">
          <div className="mock-welcome">
            <span className="mock-eyebrow">YOUR PRACTICE SPACE</span>
            <span className="mock-welcome-title">Make room to grow.</span>
          </div>
          <div className="mock-session-card">
            <div className="mock-session-icon">↗</div>
            <div className="mock-session-copy">
              <span>GUIDED SESSION</span>
              <strong>Mock interview</strong>
            </div>
            <span className="mock-session-action">Start</span>
          </div>
          <div className="mock-insight-row">
            <div className="mock-insight-card">
              <span>SESSION REVIEW</span>
              <i className="mock-chart">
                <b />
                <b />
                <b />
                <b />
                <b />
                <b />
              </i>
            </div>
            <div className="mock-insight-card mock-insight-card--accent">
              <span>AI INTERVIEWER</span>
              <i className="mock-chat-bubble" />
              <i className="mock-chat-bubble mock-chat-bubble--short" />
            </div>
          </div>
        </div>
      </div>
      <span className="project-illustration-footnote">
        ORIGINAL INTERFACE STUDY · NOT A SCREENSHOT
      </span>
    </div>
  );
}
