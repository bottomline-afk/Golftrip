import { useState } from 'react';
import type { Player } from '../lib/types';

interface PlayerAvatarProps {
  player: Player;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClasses = {
  sm: 'w-12 h-12',
  md: 'w-14 h-14',
  lg: 'w-24 h-24',
};

const textSizes = {
  sm: 'text-sm',
  md: 'text-lg',
  lg: 'text-3xl',
};

const borderWidths = {
  sm: 'border-2',
  md: 'border-2',
  lg: 'border-4',
};

export default function PlayerAvatar({ player, size = 'md', className = '' }: PlayerAvatarProps) {
  const [imgError, setImgError] = useState(false);

  const isTeam1 = player.teamId === 'team1';
  const borderColor = isTeam1 ? 'border-neon-cyan' : 'border-neon-pink';
  const bgColor = isTeam1 ? 'bg-neon-cyan/15' : 'bg-neon-pink/15';
  const textColor = isTeam1 ? 'text-neon-cyan' : 'text-neon-pink';

  const showImage = player.avatarUrl && !imgError;

  return (
    <div
      className={`
        ${sizeClasses[size]} rounded-full ${borderWidths[size]} ${borderColor}
        flex items-center justify-center overflow-hidden
        ${showImage ? '' : bgColor}
        ${className}
      `}
    >
      {showImage ? (
        <img
          src={player.avatarUrl}
          alt={player.name}
          className="w-full h-full object-cover"
          onError={() => setImgError(true)}
        />
      ) : (
        <span className={`font-heading ${textSizes[size]} ${textColor}`}>
          {player.name.charAt(0).toUpperCase()}
        </span>
      )}
    </div>
  );
}
