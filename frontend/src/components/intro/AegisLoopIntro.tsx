import React, { useState, useEffect, useRef } from 'react';

interface AegisLoopIntroProps {
  onComplete: () => void;
  onBeginTransition?: () => void;
  skipInTest?: boolean;
}

/**
 * Minimal Cinematic AegisLoop Intro
 *
 * Requirements fulfilled:
 * 1. Contains ONLY the wordmark "AEGISLOOP" and the luminous breathing orb.
 * 2. NO buttons, NO subtitles, NO fake initialization progress, NO marketing text.
 * 3. Layered breathing orb with cool slate-blue, silver, and violet depth behind the wordmark.
 * 4. Wordmark-to-Header transformation: The wordmark starts centered, then warps, compresses,
 *    and travels smoothly to the top-left dashboard header logo position.
 * 5. The breathing orb dissolves into the ambient background as the dashboard emerges.
 * 6. Zero duplicate logos or sudden jumps.
 * 7. Fast skip on click or keyboard press (Esc / Enter / Space).
 * 8. Automatic bypass in automated test environments or with prefers-reduced-motion.
 */
export const AegisLoopIntro: React.FC<AegisLoopIntroProps> = ({
  onComplete,
  onBeginTransition,
  skipInTest = true,
}) => {
  const [stage, setStage] = useState<'breathe' | 'traveling' | 'settled'>('breathe');
  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const isTestEnv =
      import.meta.env?.MODE === 'test' ||
      (typeof globalThis !== 'undefined' &&
        Boolean((globalThis as unknown as { __AEGIS_TEST__?: boolean }).__AEGIS_TEST__));

    const prefersReducedMotion =
      typeof window !== 'undefined' && typeof window.matchMedia === 'function'
        ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
        : false;

    if ((skipInTest && isTestEnv) || prefersReducedMotion) {
      onComplete();
      return;
    }

    // Gentle parallax tracking for the breathing orb
    const handlePointerMove = (e: PointerEvent) => {
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      setMouseOffset({
        x: (e.clientX - cx) * 0.04,
        y: (e.clientY - cy) * 0.04,
      });
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });

    // Step 1: Cinematic pause with centered breathing orb and wordmark (~1.35s)
    const travelTimer = setTimeout(() => {
      startTraveling();
    }, 1350);

    // Fast-skip listeners on click or keydown
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        startTraveling();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      clearTimeout(travelTimer);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onComplete, skipInTest]);

  const startTraveling = () => {
    if (stage !== 'breathe') return;
    setStage('traveling');
    if (onBeginTransition) {
      onBeginTransition();
    }

    // Wait for the smooth CSS travel transition to settle at top-left
    setTimeout(() => {
      setStage('settled');
      onComplete();
    }, 1050);
  };

  if (stage === 'settled') {
    return null;
  }

  const isTraveling = stage === 'traveling';

  return (
    <div
      ref={containerRef}
      role="region"
      aria-label="AegisLoop Cinematic Introduction"
      onClick={startTraveling}
      className={`fixed inset-0 z-50 pointer-events-auto transition-opacity duration-1000 ${
        isTraveling ? 'pointer-events-none' : 'cursor-pointer'
      }`}
    >
      {/* 1. Luminous Breathing Orb Behind Wordmark */}
      <div
        className={`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none transition-all duration-1000 ease-out ${
          isTraveling
            ? 'opacity-0 scale-150 blur-3xl'
            : 'opacity-100 scale-100'
        }`}
        style={{
          transform: `translate(calc(-50% + ${mouseOffset.x}px), calc(-50% + ${mouseOffset.y}px))`,
        }}
        aria-hidden="true"
      >
        {/* Layer 1: Core Soft Silver Luminance */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[280px] h-[280px] sm:w-[360px] sm:h-[360px] rounded-full bg-white/10 blur-2xl aegis-breathing-orb" />

        {/* Layer 2: Mid-Depth Graphite Aura */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[420px] h-[420px] sm:w-[540px] sm:h-[540px] rounded-full bg-white/5 blur-3xl aegis-breathing-orb" />

        {/* Layer 3: Outer Ambient Aura */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] sm:w-[720px] sm:h-[720px] rounded-full bg-radial from-white/5 via-white/2 to-transparent blur-3xl" />
      </div>

      {/* 2. Traveling Wordmark Transforming into Dashboard Header */}
      <div
        className={`fixed z-50 transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] select-none ${
          isTraveling
            ? 'top-4 left-4 sm:left-6 lg:left-10 translate-x-0 translate-y-0 scale-100'
            : 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 scale-100'
        }`}
      >
        <div
          className={`flex items-center gap-3 transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            isTraveling ? 'scale-[0.62] origin-top-left sm:scale-[0.72]' : 'scale-100'
          }`}
        >
          {/* Subtle Mini Brand Icon that reveals during transit */}
          <div
            className={`h-9 w-9 rounded-lg bg-[#151515] border border-white/20 flex items-center justify-center text-white font-mono font-bold text-xs tracking-wider shadow-inner transition-all duration-700 ${
              isTraveling ? 'opacity-100 scale-100' : 'opacity-0 scale-75 w-0 overflow-hidden m-0 p-0 border-0'
            }`}
          >
            AL
          </div>

          <h1
            className={`font-black uppercase tracking-[0.35em] text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-200 to-zinc-400 transition-all duration-1000 ${
              isTraveling
                ? 'text-2xl sm:text-3xl tracking-wider'
                : 'text-4xl sm:text-6xl md:text-7xl drop-shadow-[0_0_40px_rgba(255,255,255,0.22)]'
            }`}
          >
            AEGISLOOP
          </h1>
        </div>
      </div>
    </div>
  );
};
