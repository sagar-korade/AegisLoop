# Master Prompt 04 — Motion and Visual Polish

Preserve `docs/SECURITY_BOUNDARIES.md` as binding: deterministic simulation by default; offensive tests only in the isolated local Docker lab; no arbitrary targets, URLs, shell commands, public scanning, internet-facing vulnerable services, or Docker socket access.

Read `docs/FRONTEND_DESIGN_SYSTEM.md` and `docs/MOTION_GRAPHICS_SPEC.md`. Inspect the real UI and current state flow before editing.

Add cinematic but purposeful motion for AegisLoop's staged security workflow. Use Motion for React (https://motion.dev/docs/react) for sequence orchestration where it helps, CSS for simple transitions, and Motion Primitives (https://motion-primitives.com/docs) only as an adaptable reference. Follow `docs/MOTION_GRAPHICS_SPEC.md` exactly.

The signature sequence is: ready → test initiated → evidence captured → mitigation applied → diff revealed → retest → assertion result. Keep it legible and never delay actual results.

Add these motion details:
- state pulse for active agents;
- event arrival fade/slide;
- SVG/CSS path animation between Red Agent, Arena, and Blue Agent;
- short evidence highlight;
- mitigation status transition;
- concise code-diff reveal;
- retest success/failure feedback.

Keep the premium minimal visual language: fine borders, restrained accent, quiet surfaces, and readable evidence. Do not animate endlessly when idle, delay real results for spectacle, add sound, or imply real packet capture in simulation mode. Respect `prefers-reduced-motion` and keyboard accessibility. Verify at mobile and desktop sizes and run the production build.

Before changing execution or trust boundaries, read `docs/THREAT_MODEL.md` and `docs/SECURITY_BOUNDARIES.md`. Do not broaden the project beyond the documented simulation-first and isolated-lab scope.
