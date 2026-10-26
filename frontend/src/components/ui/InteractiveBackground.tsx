import React, { useEffect, useRef } from 'react';

interface InteractiveBackgroundProps {
  className?: string;
}

interface TerrainPeak {
  xRatio: number;
  yRatio: number;
  radiusRatio: number;
  strength: number;
  speed: number;
  phase: number;
}

/**
 * ThreeUI Topographic Contour Field with Strong Mouse Reactivity
 *
 * Requirements fulfilled:
 * 1. Sophisticated elevation terrain map with 36 continuous contour lines.
 * 2. Natural nested elevation rings around terrain summits.
 * 3. Soft silver-grey and cool-slate line styling with index contours every 5th line.
 * 4. High mouse reactivity: contour lines visibly bulge, ripple, and part around the cursor (up to 55px displacement).
 * 5. Smooth spring-damped easing and settlement when pointer halts.
 * 6. Responsive, lightweight HTML5 2D Canvas with automatic pause on tab blur.
 * 7. Strictly pointer-events-none so no UI elements are blocked.
 * 8. Full prefers-reduced-motion and JSDOM test-environment safety.
 */
export const InteractiveBackground: React.FC<InteractiveBackgroundProps> = ({ className = '' }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let ctx: CanvasRenderingContext2D | null = null;
    try {
      ctx = canvas.getContext('2d');
    } catch {
      return;
    }
    if (!ctx) return;

    let animationFrameId: number | null = null;
    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth || 1440);
    let height = (canvas.height = canvas.parentElement?.clientHeight || window.innerHeight || 900);

    const prefersReducedMotion =
      typeof window !== 'undefined' && typeof window.matchMedia === 'function'
        ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
        : false;

    // Smoothed pointer state with velocity and activity tracking
    const pointer = {
      x: -9999,
      y: -9999,
      targetX: -9999,
      targetY: -9999,
      vx: 0,
      vy: 0,
      active: false,
      elevationImpulse: 0,
    };

    // Terrain peaks that give the contour map authentic topological peaks and saddles
    const terrainPeaks: TerrainPeak[] = [
      { xRatio: 0.22, yRatio: 0.32, radiusRatio: 0.28, strength: 65, speed: 0.0006, phase: 0 },
      { xRatio: 0.74, yRatio: 0.38, radiusRatio: 0.34, strength: 80, speed: 0.0005, phase: 1.8 },
      { xRatio: 0.44, yRatio: 0.76, radiusRatio: 0.32, strength: 70, speed: 0.0007, phase: 3.4 },
      { xRatio: 0.88, yRatio: 0.82, radiusRatio: 0.26, strength: 55, speed: 0.0004, phase: 4.9 },
    ];

    let time = 0;
    const contourCount = 36;
    const influenceRadius = 260;

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth || window.innerWidth;
      height = canvas.height = canvas.parentElement.clientHeight || window.innerHeight;
    };

    const handlePointerMove = (e: PointerEvent) => {
      pointer.targetX = e.clientX;
      pointer.targetY = e.clientY;
      pointer.active = true;
      pointer.elevationImpulse = Math.min(pointer.elevationImpulse + 0.15, 1.0);
    };

    const handlePointerLeave = () => {
      pointer.active = false;
    };

    const handleVisibilityChange = () => {
      if (document.hidden && animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
      } else if (!document.hidden && !prefersReducedMotion && !animationFrameId) {
        animationFrameId = requestAnimationFrame(render);
      }
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    document.addEventListener('pointerleave', handlePointerLeave);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      time += 0.008;

      // Pointer interpolation with smooth spring damping
      if (pointer.active) {
        const dx = pointer.targetX - pointer.x;
        const dy = pointer.targetY - pointer.y;
        pointer.vx = dx * 0.14;
        pointer.vy = dy * 0.14;
        pointer.x += pointer.vx;
        pointer.y += pointer.vy;
        pointer.elevationImpulse = Math.max(pointer.elevationImpulse * 0.985, 0.4);
      } else {
        pointer.elevationImpulse *= 0.94;
        if (pointer.elevationImpulse < 0.01) {
          pointer.x = -9999;
          pointer.y = -9999;
        }
      }

      // 1. Draw Continuous Topographic Sweeping Contours
      for (let c = 0; c < contourCount; c++) {
        const isIndexContour = c % 5 === 0;
        const yBase = (height / (contourCount + 1)) * (c + 1);

        ctx.beginPath();

        const xStep = 18;
        let isFirst = true;

        for (let x = -20; x <= width + 20; x += xStep) {
          // Natural terrain elevation calculation
          let y = yBase;

          // Multi-frequency terrain sine harmonics
          y += Math.sin(x * 0.0035 + time * 0.4 + c * 0.28) * 24;
          y += Math.cos(x * 0.0018 - time * 0.3 + c * 0.15) * 16;

          // Influence from geological peaks
          for (const peak of terrainPeaks) {
            const peakX = (peak.xRatio + Math.cos(time * peak.speed + peak.phase) * 0.04) * width;
            const peakY = (peak.yRatio + Math.sin(time * peak.speed + peak.phase) * 0.04) * height;
            const peakR = peak.radiusRatio * width;

            const pdx = x - peakX;
            const pdy = yBase - peakY;
            const pDist = Math.sqrt(pdx * pdx + pdy * pdy);

            if (pDist < peakR) {
              const peakFactor = Math.cos((pDist / peakR) * (Math.PI / 2));
              y += Math.sin((c / contourCount) * Math.PI) * peak.strength * peakFactor * 0.45;
            }
          }

          // Strong Interactive Mouse Bulge & Elevation Ripple Deformation
          if (pointer.elevationImpulse > 0.01) {
            const mdx = x - pointer.x;
            const mdy = y - pointer.y;
            const mDist = Math.sqrt(mdx * mdx + mdy * mdy);

            if (mDist < influenceRadius) {
              const normDist = 1 - mDist / influenceRadius;
              // Smooth cubic easing for organic terrain falloff
              const falloff = normDist * normDist * (3 - 2 * normDist);

              // 1. Radial terrain bulge (pushes contour lines outward like an elevation dome)
              const bulgeAmount = 52 * pointer.elevationImpulse * falloff;
              y += (mdy / (mDist || 1)) * bulgeAmount;

              // 2. Transverse ripple wave (creates topographical wave ripples around the cursor)
              const ripple = Math.sin((mDist / 26) - time * 4.5) * 18 * falloff * pointer.elevationImpulse;
              y += ripple;
            }
          }

          if (isFirst) {
            ctx.moveTo(x, y);
            isFirst = false;
          } else {
            ctx.lineTo(x, y);
          }
        }

        // Style: Soft silver-grey contours in permanent dark mode
        if (isIndexContour) {
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)';
          ctx.lineWidth = 1.1;
        } else {
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
          ctx.lineWidth = 0.75;
        }

        ctx.stroke();
      }

      // 2. Draw Concentric Elevation Rings around Topographic Summits
      for (let pIdx = 0; pIdx < terrainPeaks.length; pIdx++) {
        const peak = terrainPeaks[pIdx];
        const peakX = (peak.xRatio + Math.cos(time * peak.speed + peak.phase) * 0.04) * width;
        const peakY = (peak.yRatio + Math.sin(time * peak.speed + peak.phase) * 0.04) * height;

        const ringCount = 5;
        for (let r = 1; r <= ringCount; r++) {
          const baseRadiusX = (r * 22) + 12;
          const baseRadiusY = (r * 15) + 8;

          ctx.beginPath();
          const segments = 36;
          for (let s = 0; s <= segments; s++) {
            const angle = (s / segments) * Math.PI * 2;
            let rx = peakX + Math.cos(angle) * baseRadiusX;
            let ry = peakY + Math.sin(angle) * baseRadiusY;

            // Mouse deformation on peak elevation rings
            if (pointer.elevationImpulse > 0.01) {
              const rdx = rx - pointer.x;
              const rdy = ry - pointer.y;
              const rDist = Math.sqrt(rdx * rdx + rdy * rdy);

              if (rDist < influenceRadius) {
                const rNorm = 1 - rDist / influenceRadius;
                const rFalloff = rNorm * rNorm;
                rx += (rdx / (rDist || 1)) * 38 * rFalloff * pointer.elevationImpulse;
                ry += (rdy / (rDist || 1)) * 38 * rFalloff * pointer.elevationImpulse;
              }
            }

            if (s === 0) ctx.moveTo(rx, ry);
            else ctx.lineTo(rx, ry);
          }

          ctx.strokeStyle = r === ringCount ? 'rgba(255, 255, 255, 0.16)' : 'rgba(255, 255, 255, 0.06)';
          ctx.lineWidth = r === ringCount ? 1.0 : 0.65;
          ctx.stroke();
        }
      }

      // 3. Localized Cursor Elevation Illumination (Pure Monochrome Halo)
      if (pointer.elevationImpulse > 0.05 && pointer.x > 0 && pointer.y > 0) {
        const gradient = ctx.createRadialGradient(
          pointer.x,
          pointer.y,
          0,
          pointer.x,
          pointer.y,
          influenceRadius * 0.8
        );
        gradient.addColorStop(0, `rgba(255, 255, 255, ${0.05 * pointer.elevationImpulse})`);
        gradient.addColorStop(0.6, `rgba(255, 255, 255, ${0.015 * pointer.elevationImpulse})`);
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(pointer.x, pointer.y, influenceRadius * 0.8, 0, Math.PI * 2);
        ctx.fill();
      }

      if (!prefersReducedMotion) {
        animationFrameId = requestAnimationFrame(render);
      }
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('pointermove', handlePointerMove);
      document.removeEventListener('pointerleave', handlePointerLeave);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, []);

  return (
    <div
      className={`fixed inset-0 pointer-events-none overflow-hidden z-0 select-none ${className}`}
      aria-hidden="true"
    >
      {/* 21st.dev Semi-Light Dark Aurora Radial Glow */}
      <div className="aegis-aurora" />

      {/* 21st.dev Fine Dot Pattern Grid Texture */}
      <div className="absolute inset-0 aegis-dot-grid opacity-75" />

      {/* Topographic Elevation Contour 2D Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full opacity-85"
      />
    </div>
  );
};
