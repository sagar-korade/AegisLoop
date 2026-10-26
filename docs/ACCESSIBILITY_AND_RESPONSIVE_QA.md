# Accessibility and Responsive QA

## Keyboard
- All buttons and selectors are reachable using Tab/Shift+Tab.
- Focus order follows visual order.
- Focus indicators are visible against dark surfaces.
- Enter/Space activate controls according to native semantics.
- No keyboard trap in dialogs or dropdowns.

## Screen readers
- Use semantic headings and landmarks.
- Provide accessible names for icon-only controls.
- Announce important stage changes once, not every telemetry event.
- Do not rely on color, animation, or spatial location alone to convey state.
- Diff content remains selectable text.

## Motion
- Respect `prefers-reduced-motion`.
- In reduced mode, show static arrows and stage labels.
- Do not use flashing, rapid strobing, or constant pulsing.
- Animation must not prevent reading, clicking, or keyboard interaction.

## Responsive checks
Test at 360px, 390px, 768px, 1024px, and 1440px widths.
- No page-level horizontal overflow.
- Buttons remain reachable.
- Tables and code panes have internal overflow only when necessary.
- Long scenario names and evidence strings wrap safely.
- Modal/dialog content fits viewport height and can scroll.

## Visual QA
- Confirm AA-level contrast for normal text where practical.
- Check light/dark OS preference behavior if both themes are supported; otherwise declare dark-only.
- Avoid tiny metadata for evidence critical to the demonstration.
