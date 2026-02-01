import { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTrip } from '../context/TripContext';
import RetroHeader from '../components/layout/RetroHeader';
import RetroCard from '../components/ui/RetroCard';
import NeonText from '../components/ui/NeonText';
import { calculateMatchResult, getCompletedHoles } from '../lib/scoring';
import { FORMAT_LABELS } from '../lib/constants';

export default function RoundHubPage() {
  const { id } = useParams<{ id: string }>();
  const { trip, rounds, scores, loading } = useTrip();

  const round = useMemo(() => rounds.find((r) => r.id === id), [rounds, id]);
  const roundScores = useMemo(() => (id ? scores[id] ?? {} : {}), [scores, id]);

  if (loading) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-void">
        <p className="font-heading text-dim-white text-xs animate-flicker">LOADING...</p>
      </div>
    );
  }

  if (!trip || !round) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-void">
        <p className="font-heading text-neon-orange text-xs">ROUND NOT FOUND</p>
      </div>
    );
  }

  const statusColor =
    round.status === 'completed'
      ? 'text-neon-green'
      : round.status === 'active'
      ? 'text-neon-yellow'
      : 'text-dim-white/40';

  return (
    <div className="min-h-dvh bg-void flex flex-col">
      <RetroHeader title={round.courseName.toUpperCase()} showBack backTo="/home" />

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {/* Round info */}
        <RetroCard>
          <div className="flex items-center justify-between mb-2">
            <p className="font-body text-lg text-dim-white">{round.date}</p>
            <span className={`font-heading text-[9px] uppercase ${statusColor}`}>
              {round.status}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-body text-sm text-dim-white/60">
              Tee Time: {round.teeTime}
            </span>
            <span className="font-heading text-[8px] text-neon-cyan bg-neon-cyan/10 border border-neon-cyan rounded-sm px-2 py-0.5">
              {FORMAT_LABELS[round.format] ?? round.format}
            </span>
          </div>
        </RetroCard>

        {/* Groups heading */}
        <NeonText color="cyan" size="sm" as="h2">GROUPS</NeonText>

        {/* Group cards */}
        {round.groups.map((group) => {
          const completedHoles = getCompletedHoles(group, roundScores);
          const showResults = round.status === 'active' || round.status === 'completed';
          const matchResult = showResults
            ? calculateMatchResult(round.format, group, roundScores, trip.players, round.courseHoles)
            : null;

          return (
            <RetroCard key={group.id} className="space-y-3">
              {/* Group header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <p className="font-heading text-[10px] text-dim-white">
                    GROUP {group.id.toUpperCase()}
                  </p>
                  {group.teeTime && (
                    <span className="font-heading text-[8px] text-neon-yellow bg-neon-yellow/10 border border-neon-yellow/30 rounded-sm px-1.5 py-0.5">
                      {group.teeTime}
                    </span>
                  )}
                </div>
                {completedHoles > 0 && (
                  <span className="font-body text-sm text-dim-white/40">
                    {completedHoles}/18 holes
                  </span>
                )}
              </div>

              {/* Teams matchup */}
              <div className="flex items-start gap-3">
                {/* Team A */}
                <div className="flex-1 border-l-2 border-neon-cyan pl-3">
                  <p className="font-heading text-[8px] text-neon-cyan mb-1">
                    {trip.teams.team1.name.toUpperCase()}
                  </p>
                  {group.teamAPlayerIds.map((pid) => (
                    <p key={pid} className="font-body text-base text-dim-white">
                      {trip.players[pid]?.name ?? pid}
                    </p>
                  ))}
                </div>

                <div className="font-heading text-[9px] text-dim-white/30 self-center">VS</div>

                {/* Team B */}
                <div className="flex-1 border-r-2 border-neon-pink pr-3 text-right">
                  <p className="font-heading text-[8px] text-neon-pink mb-1">
                    {trip.teams.team2.name.toUpperCase()}
                  </p>
                  {group.teamBPlayerIds.map((pid) => (
                    <p key={pid} className="font-body text-base text-dim-white">
                      {trip.players[pid]?.name ?? pid}
                    </p>
                  ))}
                </div>
              </div>

              {/* Skins tally */}
              {matchResult && (
                <div className="flex items-center justify-center gap-4 pt-2 border-t border-surface-light">
                  <span className="font-heading text-xs text-neon-cyan">
                    {matchResult.teamASkins}
                  </span>
                  <span className="font-heading text-[9px] text-dim-white/40">SKINS</span>
                  <span className="font-heading text-xs text-neon-pink">
                    {matchResult.teamBSkins}
                  </span>
                </div>
              )}

              {/* Action links */}
              <div className="flex gap-2 pt-1">
                <Link
                  to={`/round/${round.id}/scorecard/${group.id}`}
                  className="flex-1"
                >
                  <div className="bg-neon-green/10 border border-neon-green rounded-sm py-2 text-center retro-press">
                    <span className="font-heading text-[9px] text-neon-green">SCORECARD</span>
                  </div>
                </Link>
                <Link
                  to={`/round/${round.id}/match/${group.id}`}
                  className="flex-1"
                >
                  <div className="bg-neon-cyan/10 border border-neon-cyan rounded-sm py-2 text-center retro-press">
                    <span className="font-heading text-[9px] text-neon-cyan">MATCH</span>
                  </div>
                </Link>
              </div>
            </RetroCard>
          );
        })}
      </div>
    </div>
  );
}
