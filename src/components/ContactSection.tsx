import ScrollReveal from "@/components/ScrollReveal";
import { profile } from "@/data/profile";

const SOCIAL_PROFILES = [
  {
    label: "GitHub",
    href: profile.socialLinks.github,
    description: "Projects and source code",
    mark: "{}",
  },
  {
    label: "LinkedIn",
    href: profile.socialLinks.linkedin,
    description: "Professional profile",
    icon: "linkedin",
  },
  {
    label: "LeetCode",
    href: profile.socialLinks.leetcode,
    description: "Problem-solving profile",
    icon: "leetcode",
  },
  {
    label: "Instagram",
    href: profile.socialLinks.instagram,
    description: "Personal profile",
    icon: "instagram",
  },
].filter((profileLink) => profileLink.href);

function ProfileIcon({ name }: { name: string }) {
  const shared = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.65,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true as const,
  };

  if (name === "GitHub") {
    return (
      <svg {...shared} fill="currentColor" stroke="none">
        <path d="M12 .9a11.1 11.1 0 0 0-3.51 21.63c.56.1.76-.24.76-.54v-2.1c-3.1.67-3.76-1.32-3.76-1.32-.5-1.28-1.24-1.62-1.24-1.62-1.01-.7.08-.69.08-.69 1.12.08 1.71 1.15 1.71 1.15 1 .1.75 1.43 3.04 1.83.1-.72.39-1.21.7-1.49-2.48-.28-5.09-1.24-5.09-5.52 0-1.22.44-2.21 1.15-2.99-.12-.28-.5-1.42.11-2.96 0 0 .94-.3 3.06 1.14a10.7 10.7 0 0 1 5.57 0c2.12-1.44 3.06-1.14 3.06-1.14.61 1.54.23 2.68.11 2.96.72.78 1.15 1.77 1.15 2.99 0 4.29-2.61 5.23-5.1 5.51.4.35.75 1.03.75 2.08v3.08c0 .3.2.65.77.54A11.1 11.1 0 0 0 12 .9Z" />
      </svg>
    );
  }

  if (name === "LinkedIn") {
    return (
      <svg {...shared} fill="currentColor" stroke="none">
        <path d="M20.45 2H3.55C2.69 2 2 2.68 2 3.52v16.96c0 .84.69 1.52 1.55 1.52h16.9c.86 0 1.55-.68 1.55-1.52V3.52c0-.84-.69-1.52-1.55-1.52ZM7.93 18.9H4.98V9.4h2.95v9.5ZM6.45 8.1a1.71 1.71 0 1 1 0-3.42 1.71 1.71 0 0 1 0 3.42Zm12.47 10.8h-2.94v-4.62c0-1.1-.02-2.52-1.54-2.52-1.55 0-1.79 1.2-1.79 2.44v4.7H9.7V9.4h2.82v1.3h.04c.4-.75 1.35-1.54 2.78-1.54 2.97 0 3.52 1.95 3.52 4.49v5.25h.06Z" />
      </svg>
    );
  }

  if (name === "Instagram") {
    return (
      <svg {...shared}>
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.8" r=".7" fill="currentColor" stroke="none" />
      </svg>
    );
  }

  if (name === "LeetCode") {
    return (
      <svg {...shared}>
        <path d="m8 5-4.5 7L8 19m8-14 4.5 7-4.5 7m-2.5-11-3 7" />
      </svg>
    );
  }

  if (name === "Email") {
    return (
      <svg {...shared}>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="m4 7 8 6 8-6" />
      </svg>
    );
  }

  return (
    <svg {...shared}>
      <path d="M6.5 3.5h3l1.5 4-2 1.5a15 15 0 0 0 6 6l1.5-2 4 1.5v3a2 2 0 0 1-2.2 2A16.5 16.5 0 0 1 4.5 6a2 2 0 0 1 2-2.5Z" />
    </svg>
  );
}

export default function ContactSection() {
  const contacts = [
    ...SOCIAL_PROFILES,
    ...(profile.email
      ? [
          {
            label: "Email",
            href: `mailto:${profile.email}`,
            description: profile.email,
            icon: "email",
          },
        ]
      : []),
    ...(profile.phone
      ? [
          {
            label: "Phone",
            href: `tel:${profile.phone}`,
            description: profile.phone,
            icon: "phone",
          },
        ]
      : []),
  ];

  return (
    <section id="contact" className="content-section contact-section">
      <div className="section-shell contact-shell">
        <ScrollReveal className="contact-heading">
          <p className="section-kicker">
            <span>06</span> Final signal
          </p>
          <p className="contact-overline">Good things start with a conversation.</p>
          <h2 className="contact-title">
            Let&apos;s make
            <br />
            <span>something matter.</span>
          </h2>
          <p className="contact-intro">
            Interested in thoughtful software, AI, or practical digital
            experiences? Find me on the profiles below.
          </p>
        </ScrollReveal>

        <ScrollReveal className="contact-links" delay={120}>
          <div className="contact-links-heading">
            <span>OPEN CHANNELS</span>
            <span>{String(contacts.length).padStart(2, "0")} CHANNELS</span>
          </div>
          {contacts.map((social, index) => (
            <a
              key={social.label}
              className="contact-profile"
              href={social.href}
              target={social.href.startsWith("http") ? "_blank" : undefined}
              rel={social.href.startsWith("http") ? "noreferrer noopener" : undefined}
            >
              <span className="contact-profile-index">
                0{index + 1}
              </span>
              <span className="contact-profile-mark" aria-hidden="true">
                <ProfileIcon name={social.label} />
              </span>
              <span className="contact-profile-copy">
                <strong>{social.label}</strong>
                <span>{social.description}</span>
              </span>
              <span className="contact-profile-arrow" aria-hidden="true">
                ↗
              </span>
            </a>
          ))}
        </ScrollReveal>
      </div>
    </section>
  );
}
