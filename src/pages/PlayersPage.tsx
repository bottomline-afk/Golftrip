import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useTrip } from '../context/TripContext';
import RetroHeader from '../components/layout/RetroHeader';
import NeonText from '../components/ui/NeonText';
import PlayerAvatar from '../components/PlayerAvatar';

export default function PlayersPage() {
  const { trip, loading } = useTrip();

  const { team1Players, team2Players } = useMemo(() => {
    if (!trip) return { team1Players: [], team2Players: [] };
    const entries = Object.entries(trip.players);
    return {
      team1Players: entries.filter(([, p]) => p.teamId === 'team1'),
      team2Players: entries.filter(([, p]) => p.teamId === 'team2'),
    };
  }, [trip]);

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
    const isTeam1 = player.teamId === 'team1';
    const borderColor = isTeam1 ? 'border-neon-cyan' : 'border-neon-pink';

    return (
      <Link key={id} to={`/players/${id}`}>
        <div
          className={`
            bg-surface border-2 ${borderColor} rounded-sm p-3
            hover:bg-surface-light transition-colors retro-press
          `}
        >
          {/* Avatar */}
          <PlayerAvatar player={player} size="md" className="mx-auto mb-2" />

          {/* Name */}
          <p className="font-heading text-[10px] text-dim-white text-center truncate mb-1">
            {player.name.toUpperCase()}
          </p>

          {/* Stats */}
          <div className="text-center space-y-0.5">
            <p className="font-body text-sm text-dim-white/60">
              HCP {player.handicapIndex}
            </p>
            <p className="font-body text-xs text-dim-white/40">
              {player.strokes} strokes
            </p>
          </div>
        </div>
      </Link>
    );
  };

  return (
    <div className="min-h-dvh bg-void flex flex-col">
      <RetroHeader title="PLAYERS" showBack backTo="/home" />

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
        {/* Team 1 */}
        <div>
          <NeonText color="cyan" size="sm" as="h2" className="mb-3">
            {trip.teams.team1.name.toUpperCase()}
          </NeonText>
          <div className="grid grid-cols-2 gap-3">
            {team1Players.map(([id, player]) => renderPlayerCard(id, player))}
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-neon-cyan via-retro-purple to-neon-pink opacity-30" />

        {/* Team 2 */}
        <div>
          <NeonText color="pink" size="sm" as="h2" className="mb-3">
            {trip.teams.team2.name.toUpperCase()}
          </NeonText>
          <div className="grid grid-cols-2 gap-3">
            {team2Players.map(([id, player]) => renderPlayerCard(id, player))}
          </div>
        </div>
      </div>
    </div>
  );
}
