import { useRef, useState } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { resizeAndCropImage } from '../lib/imageUtils';
import { uploadBasePhoto, uploadCustomAvatar } from '../lib/storageHelpers';
import RetroButton from './ui/RetroButton';
import type { Player } from '../lib/types';

interface AvatarUploadProps {
  tripId: string;
  playerId: string;
  player: Player;
}

type Mode = 'ai' | 'custom';

const FUNCTION_URL =
  'https://us-central1-golftrip-c6c62.cloudfunctions.net/generate_avatars';

export default function AvatarUpload({ tripId, playerId, player }: AvatarUploadProps) {
  const [mode, setMode] = useState<Mode>('ai');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const status = player.avatarGenerationStatus;
  const isGenerating = status === 'generating';

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Reset input so the same file can be re-selected
    e.target.value = '';

    setError(null);
    setUploading(true);

    try {
      const tripDocRef = doc(db, 'trips', tripId);

      if (mode === 'ai') {
        // Resize to 1024x1024 JPEG for AI generation
        const blob = await resizeAndCropImage(file, 1024, 'image/jpeg', 0.9);
        const baseUrl = await uploadBasePhoto(tripId, playerId, blob);

        // Update Firestore with base photo URL and set status to generating
        await updateDoc(tripDocRef, {
          [`players.${playerId}.basePhotoUrl`]: baseUrl,
          [`players.${playerId}.avatarGenerationStatus`]: 'generating',
        });

        // Call Cloud Function to generate avatars
        fetch(FUNCTION_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tripId, playerId }),
        }).catch((err) => {
          console.error('Failed to call generate_avatars:', err);
        });
      } else {
        // Custom upload: resize to 512x512 WebP
        const blob = await resizeAndCropImage(file, 512, 'image/webp', 0.85);
        const customUrl = await uploadCustomAvatar(tripId, playerId, blob);

        // Set directly as avatarUrl
        await updateDoc(tripDocRef, {
          [`players.${playerId}.avatarUrl`]: customUrl,
        });
      }
    } catch (err) {
      console.error('Upload failed:', err);
      setError('Upload failed. Try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleRetry = () => {
    setError(null);
    // Re-trigger generation for existing base photo
    if (player.basePhotoUrl) {
      const tripDocRef = doc(db, 'trips', tripId);
      updateDoc(tripDocRef, {
        [`players.${playerId}.avatarGenerationStatus`]: 'generating',
      });
      fetch(FUNCTION_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tripId, playerId }),
      }).catch(console.error);
    } else {
      fileRef.current?.click();
    }
  };

  const isTeam1 = player.teamId === 'team1';
  const teamVariant = isTeam1 ? 'cyan' : 'pink';

  return (
    <div className="space-y-3">
      {/* Mode toggle */}
      <div className="flex gap-2">
        <button
          onClick={() => setMode('ai')}
          className={`
            flex-1 py-2 font-heading text-[10px] tracking-wider border-2 rounded transition-colors
            ${mode === 'ai'
              ? 'border-neon-cyan bg-neon-cyan/20 text-neon-cyan'
              : 'border-surface-light bg-surface text-dim-white/40'}
          `}
        >
          AI GENERATE
        </button>
        <button
          onClick={() => setMode('custom')}
          className={`
            flex-1 py-2 font-heading text-[10px] tracking-wider border-2 rounded transition-colors
            ${mode === 'custom'
              ? 'border-neon-cyan bg-neon-cyan/20 text-neon-cyan'
              : 'border-surface-light bg-surface text-dim-white/40'}
          `}
        >
          CUSTOM UPLOAD
        </button>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        capture="user"
        className="hidden"
        onChange={handleFileSelect}
      />

      {/* Status display */}
      {isGenerating && (
        <div className="text-center py-3">
          <p className="font-heading text-xs text-neon-orange animate-flicker">
            GENERATING STYLES...
          </p>
          <p className="font-body text-[10px] text-dim-white/40 mt-1">
            This may take a minute
          </p>
        </div>
      )}

      {status === 'error' && (
        <div className="text-center py-3">
          <p className="font-heading text-xs text-neon-orange">GENERATION FAILED</p>
          <RetroButton onClick={handleRetry} variant="orange" size="sm" className="mt-2">
            RETRY
          </RetroButton>
        </div>
      )}

      {error && (
        <p className="font-heading text-[10px] text-neon-orange text-center">{error.toUpperCase()}</p>
      )}

      {/* Upload button */}
      {!isGenerating && (
        <RetroButton
          onClick={() => fileRef.current?.click()}
          variant={teamVariant as 'cyan' | 'pink'}
          size="md"
          className="w-full"
          disabled={uploading}
        >
          {uploading
            ? 'UPLOADING...'
            : mode === 'ai'
              ? 'UPLOAD PHOTO FOR AI STYLES'
              : 'UPLOAD CUSTOM AVATAR'}
        </RetroButton>
      )}

      {mode === 'ai' && (
        <p className="font-body text-[10px] text-dim-white/30 text-center">
          Upload a clear face photo — AI will generate 7 styles to choose from
        </p>
      )}
    </div>
  );
}
