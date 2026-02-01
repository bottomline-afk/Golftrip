import type { ReactNode } from 'react';

type Glow = 'pink' | 'cyan' | 'green' | 'none';

interface RetroCardProps {
  children: ReactNode;
  className?: string;
  glow?: Glow;
}

const glowClasses: Record<Glow, string> = {
  pink: 'neon-border-pink border-neon-pink',
  cyan: 'neon-border-cyan border-neon-cyan',
  green: 'neon-border-green border-neon-green',
  none: 'border-surface-light',
};

function RetroCard({ children, className = '', glow = 'none' }: RetroCardProps) {
  return (
    <div
      className={`
        bg-surface border rounded-lg p-4
        ${glowClasses[glow]}
        ${className}
      `}
    >
      {children}
    </div>
  );
}

export default RetroCard;
