import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTrip } from '../context/TripContext';
import { usePlayer } from '../context/PlayerContext';
import RetroHeader from '../components/layout/RetroHeader';
import RetroButton from '../components/ui/RetroButton';
import NeonText from '../components/ui/NeonText';
import PlayerAvatar from '../components/PlayerAvatar';

export default function PlayerSelectPage() {
  const { trip, loading } = useTrip();
  const { joinCode, setPlayerId } = usePlayer();
  const navigate = useNavigate();

  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Redirect if no join code or no trip
  useEffect(() => {
    if (!loading && !joinCode) {
      navigate('/', { replace: true });
    }
  }, [loading, joinCode, navigate]);

  const { team1Players, team2Players } = useMemo(() => {
    if (!trip) return { team1Players: [], team2Players: [] };
    const entries = Object.entries(trip.players);
    return {
      team1Players: entries.filter(([, p]) => p.teamId === 'team1'),
      team2Players: entries.filter(([, p]) => p.teamId === 'team2'),
    };
  }, [trip]);

  const handleConfirm = () => {
    if (selectedId) {
      setPlayerId(selectedId);
      navigate('/home');
    }
  };

  if (loading) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-void">
        <p className="font-heading text-dim-white text-xs animate-flicker">LOADING...</p>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-void">
        <p className="font-heading text-neon-orange text-xs">NO TRIP DATA</p>
      </div>
    );
  }

  const renderPlayerCard = (id: string, player: typeof trip.players[string]) => {
    const isSelected = selectedId === id;
    const isTeam1 = player.teamId === 'team1';
    const borderColor = isTeam1 ? 'border-neon-cyan' : 'border-neon-pink';
    const glowClass = isSelected
      ? isTeam1
        ? 'neon-border-cyan'
        : 'neon-border-pink'
      : '';
    const bgClass = isSelected ? 'bg-surface-light' : 'bg-surface';

    return (
      <button
        key={id}
        onClick={() => setSelectedId(id)}
        className={`
          ${bgClass} border-2 ${borderColor} ${glowClass}
          p-3 rounded-sm text-center transition-all duration-200
          retro-press relative
        `}
      >
        {/* Avatar circle */}
        <PlayerAvatar player={player} size="sm" className="mx-auto mb-2" />

        {/* Name */}
        <p className="font-heading text-[10px] text-dim-white mb-1 truncate">
          {player.name.toUpperCase()}
        </p>

        {/* Handicap */}
        <p className="font-body text-sm text-dim-white/60">
          HCP {player.handicapIndex}
        </p>

        {/* Selected indicator */}
        {isSelected && (
          <div className="absolute -top-2 -right-2 bg-neon-green text-void font-heading text-[8px] px-1 py-0.5 animate-pulse-glow">
            READY!
          </div>
        )}
      </button>
    );
  };

  return (
    <div className="min-h-dvh bg-void flex flex-col">
      <RetroHeader title="SELECT YOUR PLAYER" />

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
        {/* Team 1 */}
        <div>
          <NeonText color="cyan" size="sm" as="h2" className="mb-3">
            {trip.teams.team1.name.toUpperCase()}
          </NeonText>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {team1Players.map(([id, player]) => renderPlayerCard(id, player))}
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-neon-cyan via-retro-purple to-neon-pink opacity-40" />

        {/* Team 2 */}
        <div>
          <NeonText color="pink" size="sm" as="h2" className="mb-3">
            {trip.teams.team2.name.toUpperCase()}
          </NeonText>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {team2Players.map(([id, player]) => renderPlayerCard(id, player))}
          </div>
        </div>
      </div>

      {/* Confirm button */}
      <div className="p-4 border-t border-surface-light safe-bottom">
        <RetroButton
          onClick={handleConfirm}
          variant="green"
          size="lg"
          className="w-full"
          disabled={!selectedId}
        >
          {selectedId ? 'CONFIRM PLAYER' : 'SELECT A PLAYER'}
        </RetroButton>
      </div>
    </div>
  );
}
