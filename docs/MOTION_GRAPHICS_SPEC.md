# AegisLoop Motion Graphics and Interaction Specification

## Motion philosophy
Cinematic but purposeful. Motion should help a reviewer understand the causal sequence of a security test, evidence capture, mitigation, and verification. It must not become a spectacle or imply activity that did not occur.

## Signature sequence
1. **Ready:** three stable stages—Red Agent, Arena/WAF, Blue Agent—with a static connector.
2. **Test initiated:** a focused highlight travels from Red Agent to Arena over 350–500ms.
3. **Evidence captured:** append the backend event to the timeline and briefly highlight the matching evidence card.
4. **Mitigation selected:** transition the approved mitigation to active with a short progress state and explicit “Applied in simulation” label.
5. **Diff revealed:** highlight changed lines in a short stagger capped at 350ms total. Full diff remains visible without animation.
6. **Retest:** replay the route and move focus to the verification panel.
7. **Result:** show “Assertion passed” or “Assertion failed,” the exact assertion, summary, and limitations.
8. **Reset:** return to ready state with a short crossfade.

## Timing
- Hover/focus: 120–180ms.
- Telemetry entrance: 180–240ms.
- Stage transition: 250–450ms.
- Diff stagger: no more than 350ms total.
- Never delay an API result for animation.
- Do not animate endlessly while idle.

## Implementation
- Use Motion for React for orchestration when it materially helps: https://motion.dev/docs/react
- Prefer CSS for simple hover/focus transitions.
- Motion Primitives is a pattern reference, not a requirement: https://motion-primitives.com/docs
- Use explicit application stage state; animation timers must never authorize state transitions.
- No fake charts, fabricated logs, sound effects, screen shake, or explosion/glitch effects.

## Reduced motion
Under `prefers-reduced-motion: reduce`, remove route travel, staggered reveals, parallax, and nonessential movement. Use static arrows and render every state immediately.

## Truthfulness
The animated path is a workflow visualization, not real packet telemetry. Always label the active mode. A retest proves only the named assertion for the selected scenario.

## References
- Motion for React: https://motion.dev/docs/react
- Motion animation controls: https://motion.dev/docs/react-animation
- Motion Primitives: https://motion-primitives.com/docs
- HeroGrids: https://herogrids.com/industry/developer-tools/
