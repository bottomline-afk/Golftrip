import type { ReactNode, ElementType } from 'react';

type Color = 'pink' | 'cyan' | 'green' | 'yellow' | 'orange';
type Size = 'sm' | 'md' | 'lg' | 'xl';

interface NeonTextProps {
  children: ReactNode;
  color?: Color;
  as?: ElementType;
  className?: string;
  size?: Size;
}

const colorClasses: Record<Color, string> = {
  pink: 'text-neon-pink glow-pink',
  cyan: 'text-neon-cyan glow-cyan',
  green: 'text-neon-green glow-green',
  yellow: 'text-neon-yellow glow-yellow',
  orange: 'text-neon-orange glow-orange',
};

const sizeClasses: Record<Size, string> = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-lg',
  xl: 'text-2xl',
};

function NeonText({
  children,
  color = 'cyan',
  as: Tag = 'span',
  className = '',
  size = 'md',
}: NeonTextProps) {
  return (
    <Tag
      className={`
        font-heading
        ${colorClasses[color]}
        ${sizeClasses[size]}
        ${className}
      `}
    >
      {children}
    </Tag>
  );
}

export default NeonText;
