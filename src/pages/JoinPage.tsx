import { useState, useEffect, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTrip } from '../context/TripContext';
import { usePlayer } from '../context/PlayerContext';
import RetroButton from '../components/ui/RetroButton';

export default function JoinPage() {
  const { trip, loading } = useTrip();
  const { joinCode, setJoinCode, playerId } = usePlayer();
  const navigate = useNavigate();

  const [code, setCode] = useState('');
  const [error, setError] = useState('');

  // Auto-redirect if already joined and has a valid player
  useEffect(() => {
    if (joinCode && playerId) {
      navigate('/home', { replace: true });
    } else if (joinCode && !playerId) {
      navigate('/select', { replace: true });
    }
  }, [joinCode, playerId, navigate]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!trip) {
      setError('TRIP DATA NOT FOUND');
      return;
    }

    if (code.trim().toUpperCase() === trip.joinCode.toUpperCase()) {
      setJoinCode(code.trim().toUpperCase());
      navigate('/select');
    } else {
      setError('INVALID CODE. TRY AGAIN.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-void">
        <p className="font-heading text-dim-white text-xs animate-flicker">LOADING...</p>
      </div>
    );
  }

  return (
    <div className="min-h-dvh synthwave-bg flex flex-col items-center justify-center px-6 relative scanlines">
      {/* CRT vignette */}
      <div className="absolute inset-0 crt-vignette pointer-events-none" />

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center gap-8 w-full max-w-md animate-boot">
        {/* Title */}
        <div className="text-center">
          <h1 className="font-heading text-3xl text-neon-pink glow-pink mb-4 tracking-wider">
            MYRTLE 2026
          </h1>
          <p className="font-heading text-[10px] text-neon-cyan animate-flicker tracking-widest">
            GOLF TRIP SCORING SYSTEM
          </p>
        </div>

        {/* Decorative line */}
        <div className="w-full h-px bg-gradient-to-r from-transparent via-neon-pink to-transparent opacity-60" />

        {/* Join form */}
        <form onSubmit={handleSubmit} className="w-full flex flex-col items-center gap-6">
          <div className="w-full">
            <label className="font-heading text-[10px] text-dim-white block mb-2 tracking-wider">
              ENTER TRIP CODE
            </label>
            <input
              type="text"
              value={code}
              onChange={(e) => {
                setCode(e.target.value.toUpperCase());
                setError('');
              }}
              placeholder="_ _ _ _ _ _ _ _"
              autoComplete="off"
              autoCapitalize="characters"
              className="
                w-full bg-void/80 border-2 border-neon-green text-neon-green
                font-body text-2xl text-center tracking-[0.3em] px-4 py-3
                placeholder:text-neon-green/30
                focus:outline-none focus:neon-border-green
                transition-all duration-200
              "
            />
          </div>

          {error && (
            <p className="font-heading text-[10px] text-neon-orange glow-orange animate-flicker">
              {error}
            </p>
          )}

          <RetroButton
            type="submit"
            variant="green"
            size="lg"
            className="w-full"
            disabled={!code.trim()}
          >
            JOIN
          </RetroButton>
        </form>

        {/* Decorative elements */}
        <div className="flex items-center gap-2 text-dim-white/40 font-body text-sm">
          <span>{'>>>'}</span>
          <span className="typing-cursor pr-1">SYSTEM READY</span>
        </div>
      </div>
    </div>
  );
}
