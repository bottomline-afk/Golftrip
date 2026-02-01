import type { ReactNode, ButtonHTMLAttributes } from 'react';

type Variant = 'pink' | 'cyan' | 'green' | 'orange';
type Size = 'sm' | 'md' | 'lg';

interface RetroButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: Variant;
  size?: Size;
  disabled?: boolean;
  className?: string;
  type?: ButtonHTMLAttributes<HTMLButtonElement>['type'];
}

const variantClasses: Record<Variant, string> = {
  pink: 'bg-neon-pink/20 border-neon-pink text-neon-pink neon-border-pink hover:bg-neon-pink/30',
  cyan: 'bg-neon-cyan/20 border-neon-cyan text-neon-cyan neon-border-cyan hover:bg-neon-cyan/30',
  green: 'bg-neon-green/20 border-neon-green text-neon-green neon-border-green hover:bg-neon-green/30',
  orange: 'bg-neon-orange/20 border-neon-orange text-neon-orange hover:bg-neon-orange/30',
};

const sizeClasses: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-7 py-3.5 text-base',
};

function RetroButton({
  children,
  onClick,
  variant = 'cyan',
  size = 'md',
  disabled = false,
  className = '',
  type = 'button',
}: RetroButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        retro-press font-heading border-2 rounded cursor-pointer
        uppercase tracking-wider transition-colors duration-150
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${disabled ? 'opacity-40 cursor-not-allowed pointer-events-none' : ''}
        ${className}
      `}
    >
      {children}
    </button>
  );
}

export default RetroButton;
