# SPIDER//VERSE

A cinematic, responsive developer portfolio for Vijayasarathy B. The experience is built with Next.js App Router, React, TypeScript, and Tailwind CSS, with custom CSS and SVG motion rather than a heavy animation or 3D runtime.

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Portfolio features

- Short, skippable cinematic intro and original spider-inspired graphics.
- Desktop-only 14px spider cursor with hover states and a subtle web trail.
- Cursor-reactive web strands, parallax particles, portal hover response, and click ripples.
- Cinematic section wipes and a shared-element project illustration transition where supported.
- About, categorized skills, flagship project, mission log, and contact sections.
- Accessible project detail view with a clearly labeled conceptual interface illustration.
- Responsive navigation and scroll-triggered section reveals.

## Profile and project data

- Update social URLs and public email/phone contact details in `src/data/profile.ts`.
- Add verified project entries in `src/data/projects.ts`.
- Leave an optional social URL, email, or phone empty to omit its interface link.
- Only add a live demo URL when a working deployment is available.

The featured AI Interview Coach project details are based on the public repository README and manifests. Its portfolio visual is an original conceptual illustration, not a product screenshot.

## Validation

```bash
npm run lint
npm run build
npm run start
```
