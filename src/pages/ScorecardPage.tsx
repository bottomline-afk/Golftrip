import { useState, useMemo, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useTrip } from '../context/TripContext';
import { usePlayer } from '../context/PlayerContext';
import RetroHeader from '../components/layout/RetroHeader';
import RetroCard from '../components/ui/RetroCard';
import NeonText from '../components/ui/NeonText';
import {
  calculateMatchResult,
  getPlayerStrokeAllocation,
  netScore,
} from '../lib/scoring';

type View = 'scoring' | 'strokes';

export default function ScorecardPage() {
  const { id: roundId, groupId } = useParams<{ id: string; groupId: string }>();
  const { trip, rounds, scores, loading, tripId } = useTrip();
  const { playerId } = usePlayer();

  const [currentHole, setCurrentHole] = useState(1);
  const [view, setView] = useState<View>('scoring');

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

  // Stroke allocations per player
  const strokeAllocations = useMemo(() => {
    if (!trip || !group || !round) return {};
    const allocs: Record<string, Record<number, number>> = {};
    for (const pid of allPlayerIds) {
      allocs[pid] = getPlayerStrokeAllocation(pid, allPlayerIds, trip.players, round.courseHoles);
    }
    return allocs;
  }, [trip, group, round, allPlayerIds]);

  // Total strokes per player (sum of all hole allocations)
  const totalStrokes = useMemo(() => {
    const totals: Record<string, number> = {};
    for (const pid of allPlayerIds) {
      const alloc = strokeAllocations[pid];
      if (alloc) {
        totals[pid] = Object.values(alloc).reduce((sum, v) => sum + v, 0);
      } else {
        totals[pid] = 0;
      }
    }
    return totals;
  }, [strokeAllocations, allPlayerIds]);

  // Match result for skins
  const matchResult = useMemo(() => {
    if (!trip || !round || !group) return null;
    return calculateMatchResult(round.format, group, roundScores, trip.players, round.courseHoles);
  }, [trip, round, group, roundScores]);

  // Current hole info
  const holeInfo = useMemo(
    () => round?.courseHoles.find((h) => h.number === currentHole),
    [round, currentHole]
  );

  // Save score to Firestore
  const saveScore = useCallback(
    async (targetPlayerId: string, holeNumber: number, gross: number) => {
      if (!roundId || !tripId) return;
      try {
        const scoreDocRef = doc(db, 'trips', tripId, 'rounds', roundId, 'scores', targetPlayerId);
        await setDoc(
          scoreDocRef,
          {
            playerId: targetPlayerId,
            holes: { [String(holeNumber)]: { gross } },
            updatedAt: new Date().toISOString(),
            updatedBy: playerId ?? 'unknown',
          },
          { merge: true }
        );
      } catch (err) {
        console.error('Failed to save score:', err);
      }
    },
    [roundId, tripId, playerId]
  );

  // Get score for a player on a hole
  const getGross = (pid: string, hole: number): number | null => {
    return roundScores[pid]?.holes[String(hole)]?.gross ?? null;
  };

  // Adjust score
  const adjustScore = (pid: string, hole: number, delta: number) => {
    const par = round?.courseHoles.find((h) => h.number === hole)?.par ?? 4;
    const current = getGross(pid, hole) ?? par;
    const newScore = Math.max(1, current + delta);
    saveScore(pid, hole, newScore);
  };

  // Score color based on relation to par
  const getScoreColor = (gross: number | null, par: number): string => {
    if (gross === null) return 'text-dim-white/30';
    const diff = gross - par;
    if (diff <= -1) return 'text-neon-green';
    if (diff === 0) return 'text-dim-white';
    if (diff === 1) return 'text-neon-yellow';
    return 'text-neon-orange';
  };

  // Navigate holes
  const goToHole = (hole: number) => {
    if (hole >= 1 && hole <= 18) setCurrentHole(hole);
  };

  if (loading) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-void">
        <p className="font-heading text-dim-white text-xs animate-flicker">LOADING...</p>
      </div>
    );
  }

  if (!trip || !round || !group || !holeInfo) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-void">
        <p className="font-heading text-neon-orange text-xs">SCORECARD NOT FOUND</p>
      </div>
    );
  }

  const currentHoleResult = matchResult?.holeResults.find((h) => h.hole === currentHole);

  return (
    <div className="min-h-dvh bg-void flex flex-col">
      <RetroHeader
        title="SCORECARD"
        showBack
        backTo={`/round/${roundId}`}
      />

      {/* Tab switcher */}
      <div className="flex border-b border-surface-light">
        <button
          onClick={() => setView('scoring')}
          className={`
            flex-1 py-3 font-heading text-[10px] text-center transition-colors retro-press
            ${view === 'scoring'
              ? 'text-neon-cyan border-b-2 border-neon-cyan bg-neon-cyan/5'
              : 'text-dim-white/40 hover:text-dim-white/60'
            }
          `}
        >
          SCORING
        </button>
        <button
          onClick={() => setView('strokes')}
          className={`
            flex-1 py-3 font-heading text-[10px] text-center transition-colors retro-press
            ${view === 'strokes'
              ? 'text-neon-green border-b-2 border-neon-green bg-neon-green/5'
              : 'text-dim-white/40 hover:text-dim-white/60'
            }
          `}
        >
          STROKES
        </button>
      </div>

      {view === 'scoring' ? (
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3">
          {/* Running skins tally */}
          {matchResult && (
            <div className="flex items-center justify-center gap-4 py-2">
              <NeonText color="cyan" size="sm">
                {trip.teams.team1.name.toUpperCase()}: {matchResult.teamASkins}
              </NeonText>
              <span className="font-heading text-[9px] text-dim-white/40">SKINS</span>
              <NeonText color="pink" size="sm">
                {trip.teams.team2.name.toUpperCase()}: {matchResult.teamBSkins}
              </NeonText>
            </div>
          )}

          {/* Hole selector */}
          <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-none">
            {round.courseHoles.map((h) => {
              const isActive = h.number === currentHole;
              const allScored = allPlayerIds.every(
                (pid) => roundScores[pid]?.holes[String(h.number)]?.gross !== undefined
              );
              return (
                <button
                  key={h.number}
                  onClick={() => goToHole(h.number)}
                  className={`
                    shrink-0 w-8 h-8 flex items-center justify-center rounded-sm
                    font-heading text-[10px] transition-all retro-press
                    ${isActive
                      ? 'bg-neon-cyan text-void neon-border-cyan'
                      : allScored
                      ? 'bg-surface-light text-neon-green border border-neon-green/30'
                      : 'bg-surface text-dim-white/40 border border-surface-light'
                    }
                  `}
                >
                  {h.number}
                </button>
              );
            })}
          </div>

          {/* Hole info card */}
          <RetroCard className="text-center">
            <div className="flex items-center justify-between">
              <button
                onClick={() => goToHole(currentHole - 1)}
                disabled={currentHole <= 1}
                className="font-heading text-lg text-neon-cyan disabled:text-dim-white/20 retro-press px-3 py-1"
              >
                &lt;
              </button>
              <div>
                <NeonText color="cyan" size="lg" as="p">
                  HOLE {currentHole}
                </NeonText>
                <div className="flex items-center justify-center gap-4 mt-1">
                  <span className="font-body text-sm text-dim-white/60">
                    PAR {holeInfo.par}
                  </span>
                  <span className="font-body text-sm text-dim-white/60">
                    {holeInfo.yardage} YDS
                  </span>
                  <span className="font-body text-sm text-dim-white/60">
                    SI {holeInfo.strokeIndex}
                  </span>
                </div>
              </div>
              <button
                onClick={() => goToHole(currentHole + 1)}
                disabled={currentHole >= 18}
                className="font-heading text-lg text-neon-cyan disabled:text-dim-white/20 retro-press px-3 py-1"
              >
                &gt;
              </button>
            </div>
          </RetroCard>

          {/* Skin result for current hole */}
          {currentHoleResult && (
            <div className="text-center">
              {currentHoleResult.winner === 'teamA' ? (
                <span className="font-heading text-[9px] text-neon-cyan glow-cyan">
                  {trip.teams.team1.name.toUpperCase()} WINS SKIN
                </span>
              ) : currentHoleResult.winner === 'teamB' ? (
                <span className="font-heading text-[9px] text-neon-pink glow-pink">
                  {trip.teams.team2.name.toUpperCase()} WINS SKIN
                </span>
              ) : (
                <span className="font-heading text-[9px] text-dim-white/40">PUSH</span>
              )}
            </div>
          )}

          {/* Player score entries */}
          <div className="space-y-2">
            {allPlayerIds.map((pid) => {
              const player = trip.players[pid];
              if (!player) return null;

              const isTeam1 = player.teamId === 'team1';
              const borderClass = isTeam1 ? 'border-l-neon-cyan' : 'border-l-neon-pink';
              const teamTextClass = isTeam1 ? 'text-neon-cyan' : 'text-neon-pink';
              const gross = getGross(pid, currentHole);
              const strokesOnHole = strokeAllocations[pid]?.[currentHole] ?? 0;
              const net = gross !== null ? netScore(gross, strokesOnHole) : null;
              const scoreColor = getScoreColor(gross, holeInfo.par);

              return (
                <RetroCard key={pid} className={`border-l-4 ${borderClass}`}>
                  <div className="flex items-center justify-between">
                    {/* Player info */}
                    <div className="min-w-0 flex-shrink">
                      <div className="flex items-center gap-2">
                        <p className={`font-heading text-[10px] ${teamTextClass} truncate`}>
                          {player.name.toUpperCase()}
                        </p>
                        {/* Stroke pill badge */}
                        {strokesOnHole > 0 && (
                          <span
                            className={`
                              inline-flex items-center px-1.5 py-0.5 rounded-full
                              font-heading text-[7px] tracking-wider
                              animate-pulse-glow
                              ${isTeam1
                                ? 'bg-neon-cyan/15 text-neon-cyan border border-neon-cyan/40'
                                : 'bg-neon-pink/15 text-neon-pink border border-neon-pink/40'
                              }
                            `}
                          >
                            {strokesOnHole === 1 ? 'STROKE' : `STROKE x${strokesOnHole}`}
                          </span>
                        )}
                      </div>
                      {net !== null && strokesOnHole > 0 ? (
                        <p className="font-body text-xs text-dim-white/50 mt-0.5">
                          Net: {net} ({gross}-{strokesOnHole})
                        </p>
                      ) : net !== null ? (
                        <p className="font-body text-xs text-dim-white/50 mt-0.5">
                          Net: {net}
                        </p>
                      ) : null}
                    </div>

                    {/* Score picker */}
                    <div className="flex items-center gap-1">
                      {/* Minus button */}
                      <button
                        onClick={() => adjustScore(pid, currentHole, -1)}
                        className="
                          w-11 h-11 flex items-center justify-center
                          bg-surface-light border border-surface-light rounded-sm
                          text-neon-green font-heading text-lg
                          retro-press active:bg-neon-green/20
                        "
                      >
                        -
                      </button>

                      {/* Score display */}
                      <div
                        className={`
                          w-14 h-11 flex items-center justify-center
                          bg-void border-2 rounded-sm font-heading text-lg
                          ${gross !== null
                            ? `${scoreColor} ${gross - holeInfo.par <= -1 ? 'border-neon-green' : gross === holeInfo.par ? 'border-dim-white/30' : gross - holeInfo.par === 1 ? 'border-neon-yellow' : 'border-neon-orange'}`
                            : 'border-surface-light text-dim-white/30'
                          }
                        `}
                      >
                        {gross ?? '-'}
                      </div>

                      {/* Plus button */}
                      <button
                        onClick={() => adjustScore(pid, currentHole, 1)}
                        className="
                          w-11 h-11 flex items-center justify-center
                          bg-surface-light border border-surface-light rounded-sm
                          text-neon-orange font-heading text-lg
                          retro-press active:bg-neon-orange/20
                        "
                      >
                        +
                      </button>
                    </div>
                  </div>
                </RetroCard>
              );
            })}
          </div>

          {/* Prev / Next hole navigation */}
          <div className="flex gap-3 pt-2 pb-4">
            <button
              onClick={() => goToHole(currentHole - 1)}
              disabled={currentHole <= 1}
              className="
                flex-1 py-3 bg-surface border border-surface-light rounded-sm
                font-heading text-[10px] text-dim-white
                disabled:opacity-30 retro-press
              "
            >
              &lt; PREV HOLE
            </button>
            <button
              onClick={() => goToHole(currentHole + 1)}
              disabled={currentHole >= 18}
              className="
                flex-1 py-3 bg-surface border border-surface-light rounded-sm
                font-heading text-[10px] text-neon-cyan
                disabled:opacity-30 retro-press
              "
            >
              NEXT HOLE &gt;
            </button>
          </div>
        </div>
      ) : (
        /* STROKES tab — 18-hole stroke allocation chart */
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3">
          <div className="text-center mb-1">
            <NeonText color="green" size="sm" as="h2">STROKE CHART</NeonText>
            <p className="font-body text-sm text-dim-white/40 mt-1">
              HANDICAP STROKES PER HOLE
            </p>
          </div>

          <div className="overflow-x-auto pb-4">
            <div className="min-w-[580px]">
              {/* Header row — hole numbers */}
              <div className="flex bg-surface-light rounded-t-sm">
                <div className="w-20 shrink-0 py-2 px-2">
                  <span className="font-heading text-[7px] text-dim-white/50">HOLE</span>
                </div>
                {round.courseHoles.map((h) => (
                  <div
                    key={h.number}
                    className={`w-7 shrink-0 text-center py-2 ${
                      h.number === currentHole ? 'bg-neon-cyan/10' : ''
                    }`}
                  >
                    <span className={`font-heading text-[7px] ${
                      h.number === currentHole ? 'text-neon-cyan' : 'text-dim-white/40'
                    }`}>
                      {h.number}
                    </span>
                  </div>
                ))}
              </div>

              {/* SI row — stroke index */}
              <div className="flex border-t border-surface-light/30">
                <div className="w-20 shrink-0 py-1.5 px-2">
                  <span className="font-heading text-[7px] text-dim-white/40">SI</span>
                </div>
                {round.courseHoles.map((h) => (
                  <div
                    key={h.number}
                    className={`w-7 shrink-0 text-center py-1.5 ${
                      h.number === currentHole ? 'bg-neon-cyan/10' : ''
                    }`}
                  >
                    <span className="font-body text-xs text-dim-white/30">
                      {h.strokeIndex}
                    </span>
                  </div>
                ))}
              </div>

              {/* Player rows */}
              {allPlayerIds.map((pid) => {
                const player = trip.players[pid];
                if (!player) return null;
                const isTeam1 = player.teamId === 'team1';
                const textClass = isTeam1 ? 'text-neon-cyan' : 'text-neon-pink';
                const dotBg = isTeam1 ? 'bg-neon-cyan' : 'bg-neon-pink';
                const playerTotal = totalStrokes[pid] ?? 0;

                return (
                  <div
                    key={pid}
                    className="flex border-t border-surface-light/30"
                  >
                    <div className="w-20 shrink-0 py-2 px-2 flex items-center gap-1">
                      <span className={`font-heading text-[7px] ${textClass} truncate`}>
                        {player.name.toUpperCase()}
                      </span>
                      {playerTotal > 0 && (
                        <span className={`font-body text-xs ${textClass} opacity-60`}>
                          ({playerTotal})
                        </span>
                      )}
                    </div>
                    {round.courseHoles.map((h) => {
                      const strokes = strokeAllocations[pid]?.[h.number] ?? 0;
                      return (
                        <div
                          key={h.number}
                          className={`w-7 shrink-0 flex items-center justify-center py-2 ${
                            h.number === currentHole ? 'bg-neon-cyan/10' : ''
                          }`}
                        >
                          {strokes > 0 ? (
                            strokes === 1 ? (
                              <span className={`w-2.5 h-2.5 rounded-full ${dotBg}`} />
                            ) : (
                              <span className={`font-heading text-[8px] ${textClass}`}>
                                {strokes}
                              </span>
                            )
                          ) : (
                            <span className="text-dim-white/10 font-body text-xs">-</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
