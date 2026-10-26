import '@testing-library/jest-dom/vitest';

// Safe stub for JSDOM environment where canvas is not implemented
if (typeof HTMLCanvasElement !== 'undefined') {
  HTMLCanvasElement.prototype.getContext = () => null;
}
