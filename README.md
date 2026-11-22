# SPIDER//VERSE

A cinematic, responsive developer portfolio for Vijayasarathy B. The experience is built with Next.js App Router, React, TypeScript, and Tailwind CSS, with a lazy-loaded Three.js environment for capable desktop devices.

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Portfolio features

- Short, skippable cinematic intro and original spider-inspired graphics.
- Desktop-only 14px spider cursor with hover states and a subtle web trail.
- A depth-layered Three.js cityscape, atmospheric shader, 3D spider, radial web layers, and drifting energy.
- Pointer-reactive web deformation, particles, navigable geometric nodes, and click-driven energy pulses.
- Directional web, pull, shatter, spider-descent, and energy-wipe section transitions.
- A lightweight canvas fallback on mobile, coarse-pointer, reduced-motion, or WebGL-limited devices.
- A shared-element project illustration transition where supported.
- About, categorized skills, flagship project, mission log, and contact sections.
- Accessible project detail view with a clearly labeled conceptual interface illustration.
- Responsive navigation and scroll-triggered section reveals.

## Profile and project data

- Update social URLs and public email/phone contact details in `src/data/profile.ts`.
- Add verified project entries in `src/data/projects.ts`.
- Leave an optional social URL, email, or phone empty to omit its interface link.
- Only add a live demo URL when a working deployment is available.
- The 3D layer is loaded after initial paint and is skipped for compact/touch layouts and reduced-motion preferences.

The featured AI Interview Coach project details are based on the public repository README and manifests. Its portfolio visual is an original conceptual illustration, not a product screenshot.

## Validation

```bash
npm run lint
npm run build
npm run start
```
