import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useTrip } from '../context/TripContext';
import RetroHeader from '../components/layout/RetroHeader';
import RetroCard from '../components/ui/RetroCard';
import NeonText from '../components/ui/NeonText';
import {
  calculateMatchResult,
  getPlayerStrokeAllocation,
  netScore,
} from '../lib/scoring';

export default function MatchDetailPage() {
  const { id: roundId, groupId } = useParams<{ id: string; groupId: string }>();
  const { trip, rounds, scores, loading } = useTrip();

  const round = useMemo(() => rounds.find((r) => r.id === roundId), [rounds, roundId]);
  const group = useMemo(
    () => round?.groups.find((g) => g.id === groupId),
    [round, groupId]
  );
  const roundScores = useMemo(
    () => (roundId ? scores[roundId] ?? {} : {}),
    [scores, roundId]
  );

  const allPlayerIds = useMemo(
    () => (group ? [...group.teamAPlayerIds, ...group.teamBPlayerIds] : []),
    [group]
  );

  const matchResult = useMemo(() => {
    if (!trip || !round || !group) return null;
    return calculateMatchResult(round.format, group, roundScores, trip.players, round.courseHoles);
  }, [trip, round, group, roundScores]);

  // Stroke allocations for net score display
  const strokeAllocations = useMemo(() => {
    if (!trip || !group || !round) return {};
    const allocs: Record<string, Record<number, number>> = {};
    for (const pid of allPlayerIds) {
      allocs[pid] = getPlayerStrokeAllocation(pid, allPlayerIds, trip.players, round.courseHoles);
    }
    return allocs;
  }, [trip, group, round, allPlayerIds]);

  if (loading) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-void">
        <p className="font-heading text-dim-white text-xs animate-flicker">LOADING...</p>
      </div>
    );
  }

  if (!trip || !round || !group || !matchResult) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-void">
        <p className="font-heading text-neon-orange text-xs">MATCH NOT FOUND</p>
      </div>
    );
  }

  // Determine point winner
  const pointWinner =
    matchResult.teamAPoints > matchResult.teamBPoints
      ? 'teamA'
      : matchResult.teamBPoints > matchResult.teamAPoints
      ? 'teamB'
      : 'tied';

  return (
    <div className="min-h-dvh bg-void flex flex-col">
      <RetroHeader
        title="MATCH DETAIL"
        showBack
        backTo={`/round/${roundId}`}
      />

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {/* VS header */}
        <RetroCard className="text-center">
          <div className="flex items-center justify-center gap-4">
            <div className="flex-1 text-right">
              <NeonText color="cyan" size="sm" className="block mb-1">
                {trip.teams.team1.name.toUpperCase()}
              </NeonText>
              <div className="space-y-0.5">
                {group.teamAPlayerIds.map((pid) => (
                  <p key={pid} className="font-body text-base text-dim-white">
                    {trip.players[pid]?.name ?? pid}
                  </p>
                ))}
              </div>
            </div>
            <div className="font-heading text-xs text-dim-white/30">VS</div>
            <div className="flex-1 text-left">
              <NeonText color="pink" size="sm" className="block mb-1">
                {trip.teams.team2.name.toUpperCase()}
              </NeonText>
              <div className="space-y-0.5">
                {group.teamBPlayerIds.map((pid) => (
                  <p key={pid} className="font-body text-base text-dim-white">
                    {trip.players[pid]?.name ?? pid}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </RetroCard>

        {/* Overall skins result */}
        <RetroCard glow={pointWinner === 'teamA' ? 'cyan' : pointWinner === 'teamB' ? 'pink' : 'none'}>
          <p className="font-heading text-[9px] text-dim-white/60 text-center mb-2 tracking-wider">
            SKINS RESULT
          </p>
          <div className="flex items-center justify-center gap-6">
            <span className="font-heading text-2xl text-neon-cyan glow-cyan">
              {matchResult.teamASkins}
            </span>
            <span className="font-heading text-xs text-dim-white/30">-</span>
            <span className="font-heading text-2xl text-neon-pink glow-pink">
              {matchResult.teamBSkins}
            </span>
          </div>
          <p className="text-center mt-2 font-heading text-[9px]">
            {pointWinner === 'teamA' ? (
              <span className="text-neon-cyan">
                {trip.teams.team1.name.toUpperCase()} WINS POINT
              </span>
            ) : pointWinner === 'teamB' ? (
              <span className="text-neon-pink">
                {trip.teams.team2.name.toUpperCase()} WINS POINT
              </span>
            ) : (
              <span className="text-dim-white/40">POINT SPLIT</span>
            )}
          </p>
        </RetroCard>

        {/* Hole-by-hole breakdown */}
        <NeonText color="cyan" size="sm" as="h2">HOLE-BY-HOLE</NeonText>

        {/* Table header */}
        <div className="bg-surface border border-surface-light rounded-sm overflow-hidden">
          <div className="grid grid-cols-5 gap-0 text-center bg-surface-light py-2 px-1">
            <span className="font-heading text-[8px] text-dim-white/60">HOLE</span>
            <span className="font-heading text-[8px] text-dim-white/60">PAR</span>
            <span className="font-heading text-[8px] text-neon-cyan">
              {trip.teams.team1.name.substring(0, 6).toUpperCase()}
            </span>
            <span className="font-heading text-[8px] text-neon-pink">
              {trip.teams.team2.name.substring(0, 6).toUpperCase()}
            </span>
            <span className="font-heading text-[8px] text-dim-white/60">SKIN</span>
          </div>

          {/* Rows */}
          {matchResult.holeResults.map((hr) => {
            const hole = round.courseHoles.find((h) => h.number === hr.hole);
            const hasScores = hr.teamANet !== 0 || hr.teamBNet !== 0 || hr.winner !== 'push';

            // Check if any scores exist for this hole
            const anyScored = allPlayerIds.some(
              (pid) => roundScores[pid]?.holes[String(hr.hole)]?.gross !== undefined
            );

            const rowBg = !anyScored
              ? 'bg-void/50'
              : hr.winner === 'teamA'
              ? 'bg-neon-cyan/5'
              : hr.winner === 'teamB'
              ? 'bg-neon-pink/5'
              : '';

            return (
              <div
                key={hr.hole}
                className={`grid grid-cols-5 gap-0 text-center py-2 px-1 border-t border-surface-light/30 ${rowBg}`}
              >
                <span className="font-heading text-[10px] text-dim-white">{hr.hole}</span>
                <span className="font-body text-sm text-dim-white/50">{hole?.par ?? '-'}</span>
                <span className={`font-body text-sm ${hasScores && anyScored ? 'text-neon-cyan' : 'text-dim-white/20'}`}>
                  {anyScored ? hr.teamANet : '-'}
                </span>
                <span className={`font-body text-sm ${hasScores && anyScored ? 'text-neon-pink' : 'text-dim-white/20'}`}>
                  {anyScored ? hr.teamBNet : '-'}
                </span>
                <span className={`font-heading text-[9px] ${
                  !anyScored
                    ? 'text-dim-white/15'
                    : hr.winner === 'teamA'
                    ? 'text-neon-cyan'
                    : hr.winner === 'teamB'
                    ? 'text-neon-pink'
                    : 'text-dim-white/30'
                }`}>
                  {!anyScored
                    ? '-'
                    : hr.winner === 'teamA'
                    ? 'A'
                    : hr.winner === 'teamB'
                    ? 'B'
                    : '='
                  }
                </span>
              </div>
            );
          })}
        </div>

        {/* Individual player net scores */}
        <NeonText color="cyan" size="sm" as="h2">PLAYER NET SCORES</NeonText>

        <div className="overflow-x-auto pb-4">
          <div className="min-w-[500px]">
            {/* Header row with hole numbers */}
            <div className="flex bg-surface-light rounded-t-sm">
              <div className="w-20 shrink-0 py-2 px-2">
                <span className="font-heading text-[7px] text-dim-white/50">PLAYER</span>
              </div>
              {round.courseHoles.map((h) => (
                <div key={h.number} className="w-7 shrink-0 text-center py-2">
                  <span className="font-heading text-[7px] text-dim-white/40">{h.number}</span>
                </div>
              ))}
            </div>

            {/* Player rows */}
            {allPlayerIds.map((pid) => {
              const player = trip.players[pid];
              if (!player) return null;
              const isTeam1 = player.teamId === 'team1';
              const textClass = isTeam1 ? 'text-neon-cyan' : 'text-neon-pink';

              return (
                <div
                  key={pid}
                  className="flex border-t border-surface-light/30"
                >
                  <div className="w-20 shrink-0 py-2 px-2">
                    <span className={`font-heading text-[7px] ${textClass} truncate block`}>
                      {player.name.toUpperCase()}
                    </span>
                  </div>
                  {round.courseHoles.map((h) => {
                    const gross = roundScores[pid]?.holes[String(h.number)]?.gross;
                    const strokesOnHole = strokeAllocations[pid]?.[h.number] ?? 0;
                    const net = gross !== undefined ? netScore(gross, strokesOnHole) : null;

                    return (
                      <div key={h.number} className="w-7 shrink-0 text-center py-2">
                        <span className={`font-body text-xs ${
                          net === null
                            ? 'text-dim-white/15'
                            : net < h.par
                            ? 'text-neon-green'
                            : net === h.par
                            ? 'text-dim-white/60'
                            : 'text-neon-orange'
                        }`}>
                          {net ?? '-'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
