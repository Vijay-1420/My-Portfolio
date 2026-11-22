import Link from "next/link";
import { profile } from "@/data/profile";

const FOOTER_LINKS = [
  { label: "Home", href: "#home" },
  { label: "About", href: "#about" },
  { label: "Skills", href: "#skills" },
  { label: "Projects", href: "#projects" },
  { label: "Journey", href: "#journey" },
  { label: "Contact", href: "#contact" },
];

const SOCIAL_LINKS = [
  { label: "GitHub", href: profile.socialLinks.github },
  { label: "LinkedIn", href: profile.socialLinks.linkedin },
  { label: "Instagram", href: profile.socialLinks.instagram },
  { label: "LeetCode", href: profile.socialLinks.leetcode },
].filter((link) => link.href);

export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-shell">
        <Link href="#home" className="brand-mark footer-brand">
          <span>SPIDER</span>
          <span className="brand-mark-slash">{"//"}</span>
          <span className="brand-mark-muted">VERSE</span>
        </Link>
        <p className="footer-credit">
          An independent portfolio by {profile.name}.
        </p>
        <nav className="footer-nav" aria-label="Footer navigation">
          {FOOTER_LINKS.map((link) => (
            <Link href={link.href} key={link.label}>
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="footer-bottom">
          <span>DESIGNED TO KEEP EVOLVING</span>
          <div className="footer-socials" aria-label="Social profiles">
            {SOCIAL_LINKS.map((link) => (
              <a
                href={link.href}
                key={link.label}
                target="_blank"
                rel="noreferrer noopener"
              >
                {link.label}
                <span aria-hidden="true">↗</span>
              </a>
            ))}
          </div>
          <a className="back-to-top" href="#home">
            Back to top <span aria-hidden="true">↑</span>
          </a>
        </div>
      </div>
    </footer>
  );
}
