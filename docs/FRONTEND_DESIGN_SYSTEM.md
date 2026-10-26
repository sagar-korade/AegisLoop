# AegisLoop Frontend Design System

## Art direction
Minimal premium security operations UI, informed by the clarity, restraint, and precision of Linear and Vercel. Use those products as design principles, not as templates to copy. AegisLoop should feel like a focused engineering instrument: quiet surfaces, crisp typography, clear hierarchy, and one purposeful accent. Avoid generic cyberpunk styling, noisy gradients, excessive glassmorphism, and decorative neon.

## Visual principles
- **Hierarchy before decoration:** a clear page title, concise context, obvious primary action, and evidence-led content.
- **Dense where useful, spacious where needed:** compact metrics and telemetry; generous spacing around major sections.
- **Subtle surfaces:** near-black/slate background, slightly lifted panels, thin borders, restrained shadows.
- **One accent at a time:** cyan/blue for active paths and neutral system emphasis; semantic status colors only for actual states.
- **Evidence is the hero:** event timeline, mitigation diff, and retest assertion must be easier to read than ornamental graphics.
- **No fake certainty:** simulation and local-lab modes are always explicitly identified.

## Color tokens
- App background: `#0B0D10`
- Primary surface: `#111419`
- Elevated surface: `#171B22`
- Border: `#282E38`
- Main text: `#F2F4F8`
- Muted text: `#9AA4B2`
- Primary accent: `#8AB4FF`
- Secondary telemetry accent: `#64D8CB`
- Attack/test state: `#F07878`
- Defense/mitigation state: `#8AB4FF`
- Success: `#56C99A`
- Warning: `#E9B86E`
- Failure: `#F07878`

Use colors semantically; never rely on color alone. Pair every state color with text and/or an icon. Keep accent saturation restrained.

## Typography
- UI: Inter, Geist, or system sans-serif. Use Geist only if it is already available or can be installed cleanly.
- Logs/code: JetBrains Mono or system monospace.
- Page title: 24–32px; section title: 16–20px; body: 14–16px; metadata: 12–13px.
- Use a small number of weights. Prefer clear spacing and alignment over oversized typography.
- Keep logs and code comfortably legible; never use low-contrast microtext for important evidence.

## Layout
Desktop:
- Compact top bar with AegisLoop wordmark, environment label, run state, and reset control.
- Optional 220–240px navigation rail; do not add navigation that has no real destination.
- Main content max width around 1500px.
- Header row: title, short explanatory subtitle, lab-mode badge, primary run action.
- KPI strip: scenarios run, mitigations applied, retests passed, retests failed.
- Main stage: Red Agent, Arena/WAF, Blue Agent, with a clearly legible animated route between them.
- Evidence zone: event timeline, mitigation/code diff, and verification result.
- Use a consistent spacing scale (4/8/12/16/24/32px) and thin 1px borders.

Tablet:
- Collapse navigation to a compact rail or top navigation.
- Use two-column agent panels and a full-width evidence/telemetry region.

Mobile:
- Stack panels in workflow order.
- Keep run/reset actions visible and reachable.
- Avoid horizontal page scrolling. Only code and log panes may scroll horizontally when necessary.

## Components
- `AppShell`
- `TopBar`
- `SafetyModeBanner`
- `MetricCard`
- `AgentStatusCard`
- `ScenarioSelector`
- `RunControls`
- `AgentPathStage`
- `EventTimeline`
- `TelemetryInspector`
- `WafRuleCard`
- `CodeDiffViewer`
- `VerificationSummary`
- `Toast/Alert`
- `EmptyState`
- `ErrorState`

## Interaction states
Every data panel supports loading, empty, success, and error states. Disable actions that are invalid for the current state; for example, retest is disabled until a mitigation has been applied. Use concise microcopy and stable layouts to avoid visual jumps.

## Motion integration
Use Motion for React (`motion`) only for meaningful state transitions and the staged verification sequence. CSS transitions are preferred for simple hover/focus states. See `docs/MOTION_GRAPHICS_SPEC.md`. Animation must be interruptible, must not delay a real result, and must respect `prefers-reduced-motion`.

## Accessibility
- Meet WCAG AA contrast where practical.
- Visible keyboard focus and semantic button labels.
- ARIA live region for concise state changes, not every arriving log line.
- Respect `prefers-reduced-motion`.
- Never communicate pass/fail by color alone.
- Preserve usability at 200% zoom and on narrow screens.

## Design and implementation references
Use these as learning resources and inspiration. Adapt patterns to AegisLoop's workflow; do not copy their branding, layouts, or components wholesale.

- Linear — product UI and visual hierarchy: https://linear.app/
- Vercel — restrained developer-tool design: https://vercel.com/
- HeroGrids — developer-tool visual references: https://herogrids.com/industry/developer-tools/
- Motion for React — official docs: https://motion.dev/docs/react
- Motion animation controls: https://motion.dev/docs/react-animation
- Motion Primitives — reusable animated UI patterns: https://motion-primitives.com/docs

Use the smallest set of dependencies that produces a clear result. Check current package compatibility before installing. Do not add a motion library merely for a single simple transition.
