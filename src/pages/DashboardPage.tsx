import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useTrip } from '../context/TripContext';
import { usePlayer } from '../context/PlayerContext';
import RetroHeader from '../components/layout/RetroHeader';
import RetroCard from '../components/ui/RetroCard';
import NeonText from '../components/ui/NeonText';
import { calculateMatchResult } from '../lib/scoring';
import { FORMAT_LABELS } from '../lib/constants';

export default function DashboardPage() {
  const { trip, rounds, scores, loading } = useTrip();
  const { playerId } = usePlayer();

  // Calculate overall team totals from all rounds
  const teamTotals = useMemo(() => {
    if (!trip || rounds.length === 0) return { team1Points: 0, team2Points: 0 };

    let team1Points = 0;
    let team2Points = 0;

    for (const round of rounds) {
      const roundScores = scores[round.id] || {};
      for (const group of round.groups) {
        const result = calculateMatchResult(
          round.format,
          group,
          roundScores,
          trip.players,
          round.courseHoles
        );
        team1Points += result.teamAPoints;
        team2Points += result.teamBPoints;
      }
    }

    return { team1Points, team2Points };
  }, [trip, rounds, scores]);

  // Find next upcoming event
  const nextEvent = useMemo(() => {
    if (!trip) return null;
    const now = new Date().toISOString();
    return trip.schedule.find((e) => {
      const eventDate = `${e.date}T${e.time}`;
      return eventDate >= now;
    }) ?? trip.schedule[0] ?? null;
  }, [trip]);

  const playerName = useMemo(() => {
    if (!trip || !playerId) return 'PLAYER';
    return trip.players[playerId]?.name ?? 'PLAYER';
  }, [trip, playerId]);

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

  return (
    <div className="min-h-dvh bg-void flex flex-col">
      <RetroHeader title="MYRTLE 2026" />

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {/* Player greeting */}
        <p className="font-body text-lg text-dim-white">
          Welcome, <span className="text-neon-green">{playerName}</span>
        </p>

        {/* Team score overview */}
        <RetroCard className="text-center">
          <p className="font-heading text-[9px] text-dim-white/60 mb-3 tracking-wider">
            TEAM STANDINGS
          </p>
          <div className="flex items-center justify-center gap-4">
            <div className="flex-1 text-right">
              <NeonText color="cyan" size="sm" className="block mb-1">
                {trip.teams.team1.name.toUpperCase()}
              </NeonText>
              <p className="font-heading text-2xl text-neon-cyan glow-cyan">
                {teamTotals.team1Points}
              </p>
            </div>
            <div className="font-heading text-xs text-dim-white/40 px-2">VS</div>
            <div className="flex-1 text-left">
              <NeonText color="pink" size="sm" className="block mb-1">
                {trip.teams.team2.name.toUpperCase()}
              </NeonText>
              <p className="font-heading text-2xl text-neon-pink glow-pink">
                {teamTotals.team2Points}
              </p>
            </div>
          </div>
        </RetroCard>

        {/* Next up */}
        {nextEvent && (
          <RetroCard glow="green">
            <p className="font-heading text-[9px] text-neon-green mb-2 tracking-wider">
              NEXT UP
            </p>
            <p className="font-body text-lg text-dim-white">{nextEvent.description}</p>
            <p className="font-body text-sm text-dim-white/60 mt-1">
              {nextEvent.date} @ {nextEvent.time}
            </p>
          </RetroCard>
        )}

        {/* Quick links heading */}
        <div className="flex items-center justify-between">
          <NeonText color="cyan" size="sm" as="h2">ROUNDS</NeonText>
          <Link
            to="/schedule"
            className="font-heading text-[9px] text-dim-white/60 hover:text-neon-cyan transition-colors"
          >
            FULL SCHEDULE &gt;
          </Link>
        </div>

        {/* Round cards */}
        <div className="space-y-3">
          {rounds.map((round) => {
            const statusColor =
              round.status === 'completed'
                ? 'text-neon-green'
                : round.status === 'active'
                ? 'text-neon-yellow'
                : 'text-dim-white/40';

            return (
              <Link key={round.id} to={`/round/${round.id}`}>
                <RetroCard className="flex items-center justify-between hover:bg-surface-light transition-colors">
                  <div>
                    <p className="font-heading text-[10px] text-dim-white mb-1">
                      {round.courseName.toUpperCase()}
                    </p>
                    <p className="font-body text-sm text-dim-white/60">
                      {FORMAT_LABELS[round.format] ?? round.format}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`font-heading text-[9px] ${statusColor} uppercase`}>
                      {round.status}
                    </p>
                    <p className="font-body text-sm text-dim-white/40 mt-1">
                      {round.date}
                    </p>
                  </div>
                </RetroCard>
              </Link>
            );
          })}
        </div>

        {/* Bottom nav links */}
        <div className="grid grid-cols-3 gap-3 pt-2 pb-4">
          <Link to="/leaderboard">
            <RetroCard className="text-center hover:bg-surface-light transition-colors">
              <p className="font-heading text-[9px] text-neon-yellow">BOARD</p>
            </RetroCard>
          </Link>
          <Link to="/players">
            <RetroCard className="text-center hover:bg-surface-light transition-colors">
              <p className="font-heading text-[9px] text-neon-cyan">PLAYERS</p>
            </RetroCard>
          </Link>
          <Link to="/admin">
            <RetroCard className="text-center hover:bg-surface-light transition-colors">
              <p className="font-heading text-[9px] text-retro-purple">ADMIN</p>
            </RetroCard>
          </Link>
        </div>
      </div>
    </div>
  );
}
