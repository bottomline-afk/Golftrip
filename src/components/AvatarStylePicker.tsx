import { useState } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { STYLE_MAP } from '../lib/avatarStyles';
import RetroButton from './ui/RetroButton';
import type { Player } from '../lib/types';

interface AvatarStylePickerProps {
  tripId: string;
  playerId: string;
  player: Player;
}

export default function AvatarStylePicker({ tripId, playerId, player }: AvatarStylePickerProps) {
  const [selectedStyleId, setSelectedStyleId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const avatars = player.generatedAvatars;
  if (!avatars || Object.keys(avatars).length === 0) return null;

  const isTeam1 = player.teamId === 'team1';
  const teamVariant = isTeam1 ? 'cyan' : 'pink';
  const glowBorder = isTeam1 ? 'border-neon-cyan shadow-[0_0_12px_rgba(0,255,255,0.5)]' : 'border-neon-pink shadow-[0_0_12px_rgba(255,0,128,0.5)]';

  const handleConfirm = async () => {
    if (!selectedStyleId || !avatars[selectedStyleId]) return;
    setSaving(true);
    try {
      const tripDocRef = doc(db, 'trips', tripId);
      await updateDoc(tripDocRef, {
        [`players.${playerId}.avatarUrl`]: avatars[selectedStyleId],
      });
      setSelectedStyleId(null);
    } catch (err) {
      console.error('Failed to set avatar:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-3">
      <p className="font-heading text-[10px] text-dim-white/60 text-center tracking-wider">
        PICK YOUR STYLE
      </p>

      <div className="grid grid-cols-2 gap-3">
        {Object.entries(avatars).map(([styleId, url]) => {
          const style = STYLE_MAP[styleId];
          const isSelected = selectedStyleId === styleId;
          return (
            <button
              key={styleId}
              onClick={() => setSelectedStyleId(styleId)}
              className={`
                relative rounded overflow-hidden border-2 transition-all
                ${isSelected ? glowBorder : 'border-surface-light'}
              `}
            >
              <img
                src={url}
                alt={style?.label ?? styleId}
                className="w-full aspect-square object-cover"
              />
              <div className="absolute bottom-0 inset-x-0 bg-void/80 py-1 px-2">
                <p className="font-heading text-[8px] text-dim-white truncate">
                  {(style?.label ?? styleId).toUpperCase()}
                </p>
              </div>
              {isSelected && (
                <div className="absolute top-1 right-1 bg-neon-green text-void font-heading text-[7px] px-1.5 py-0.5 rounded-sm">
                  PICK
                </div>
              )}
            </button>
          );
        })}
      </div>

      {selectedStyleId && (
        <RetroButton
          onClick={handleConfirm}
          variant={teamVariant as 'cyan' | 'pink'}
          size="md"
          className="w-full"
          disabled={saving}
        >
          {saving ? 'SAVING...' : 'SET AS AVATAR'}
        </RetroButton>
      )}
    </div>
  );
}
