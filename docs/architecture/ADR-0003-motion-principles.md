# ADR-0003: Purposeful Motion, State-Driven

- Status: Accepted
- Date: 2026-10-25

## Context
The interface should feel premium and memorable while preserving evidence readability and accessibility.

## Decision
Use Motion for React for the staged workflow sequence where helpful; use CSS for simple transitions. Animation follows backend-confirmed state and respects reduced-motion preferences.

## Consequences
- Motion is never the source of truth.
- Results remain visible even when animation is disabled.
- Avoid gratuitous glow, constant pulsing, and decorative 3D effects.
