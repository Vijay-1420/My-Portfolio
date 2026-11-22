import ScrollReveal from "@/components/ScrollReveal";

export default function AboutSection() {
  return (
    <section id="about" className="content-section about-section">
      <div className="section-shell">
        <ScrollReveal className="section-heading-block">
          <p className="section-kicker">
            <span>02</span> Behind the mask
          </p>
          <div className="section-heading-row">
            <h2 className="section-title">
              Curiosity first.
              <br />
              <span>Build with purpose.</span>
            </h2>
            <p className="section-side-note">
              A little about the person
              <br />
              behind the interface.
            </p>
          </div>
        </ScrollReveal>

        <div className="about-grid">
          <ScrollReveal className="about-visual-wrap">
            <div className="about-visual" aria-hidden="true">
              <div className="about-visual-ring about-visual-ring--outer" />
              <div className="about-visual-ring about-visual-ring--inner" />
              <div className="about-visual-crosshair about-visual-crosshair--horizontal" />
              <div className="about-visual-crosshair about-visual-crosshair--vertical" />
              <div className="about-visual-core">
                <span>V</span>
                <i />
              </div>
              <span className="about-visual-coordinate about-visual-coordinate--one">
                HUMAN
              </span>
              <span className="about-visual-coordinate about-visual-coordinate--two">
                + MACHINE
              </span>
              <span className="about-visual-orbit-dot about-visual-orbit-dot--one" />
              <span className="about-visual-orbit-dot about-visual-orbit-dot--two" />
              <span className="about-visual-caption">FIG. 01 / PERSPECTIVE</span>
            </div>
          </ScrollReveal>

          <ScrollReveal className="about-copy" delay={110}>
            <p className="about-lead">
              I&apos;m Vijayasarathy B, an engineering-minded developer drawn to
              the possibilities of AI, data science, and software.
            </p>
            <p>
              I enjoy understanding how a problem works before reaching for a
              solution. That curiosity leads me across code, data, and
              intelligent systems - looking for ways to make complex ideas feel
              useful and approachable.
            </p>
            <p>
              My focus is on building practical applications, learning by
              making, and refining the details that make a digital experience
              clear, thoughtful, and easy to use.
            </p>
            <div className="about-principles">
              <div>
                <span className="principle-index">01</span>
                <span>Understand the problem</span>
              </div>
              <div>
                <span className="principle-index">02</span>
                <span>Build with intention</span>
              </div>
              <div>
                <span className="principle-index">03</span>
                <span>Learn through iteration</span>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
