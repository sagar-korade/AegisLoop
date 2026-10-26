import React from 'react';

interface CornerFrameProps {
  children: React.ReactNode;
  className?: string;
  cornerSize?: number;
  variant?: 'default' | 'accent' | 'success' | 'danger';
  active?: boolean;
}

/**
 * Technical corner bracket frame component.
 * Renders subtle precision corner brackets on top-left, top-right,
 * bottom-left, and bottom-right of security telemetry panels.
 */
export const CornerFrame: React.FC<CornerFrameProps> = ({
  children,
  className = '',
  cornerSize = 8,
  variant = 'default',
  active = false,
}) => {
  const getCornerColor = () => {
    if (active) return 'border-white dark:border-white';
    switch (variant) {
      case 'accent':
        return 'border-zinc-400 dark:border-zinc-400';
      case 'success':
        return 'border-zinc-300 dark:border-zinc-300';
      case 'danger':
        return 'border-[#EF4444]/60';
      default:
        return 'border-white/20 dark:border-white/20';
    }
  };

  const cornerColor = getCornerColor();
  const sizeStyle = { width: `${cornerSize}px`, height: `${cornerSize}px` };

  return (
    <div className={`relative ${className}`}>
      {/* Top-Left Corner */}
      <div
        className={`absolute -top-px -left-px border-t border-l ${cornerColor} pointer-events-none transition-colors duration-200 z-10`}
        style={sizeStyle}
        aria-hidden="true"
      />
      {/* Top-Right Corner */}
      <div
        className={`absolute -top-px -right-px border-t border-r ${cornerColor} pointer-events-none transition-colors duration-200 z-10`}
        style={sizeStyle}
        aria-hidden="true"
      />
      {/* Bottom-Left Corner */}
      <div
        className={`absolute -bottom-px -left-px border-b border-l ${cornerColor} pointer-events-none transition-colors duration-200 z-10`}
        style={sizeStyle}
        aria-hidden="true"
      />
      {/* Bottom-Right Corner */}
      <div
        className={`absolute -bottom-px -right-px border-b border-r ${cornerColor} pointer-events-none transition-colors duration-200 z-10`}
        style={sizeStyle}
        aria-hidden="true"
      />
      {children}
    </div>
  );
};
