import { useState, useMemo } from 'react';
import { useTrip } from '../context/TripContext';
import RetroHeader from '../components/layout/RetroHeader';
import RetroCard from '../components/ui/RetroCard';
import NeonText from '../components/ui/NeonText';
import { calculateMatchResult } from '../lib/scoring';
import { FORMAT_LABELS } from '../lib/constants';
import type { MatchResult } from '../lib/types';

type Tab = 'teams' | 'skins';

export default function LeaderboardPage() {
  const { trip, rounds, scores, loading } = useTrip();
  const [activeTab, setActiveTab] = useState<Tab>('teams');

  // Calculate all match results
  const allMatchResults = useMemo(() => {
    if (!trip) return [];
    const results: { roundId: string; courseName: string; format: string; result: MatchResult }[] = [];

    for (const round of rounds) {
      const roundScores = scores[round.id] ?? {};
      for (const group of round.groups) {
        const result = calculateMatchResult(
          round.format, group, roundScores, trip.players, round.courseHoles
        );
        results.push({
          roundId: round.id,
          courseName: round.courseName,
          format: round.format,
          result,
        });
      }
    }
    return results;
  }, [trip, rounds, scores]);

  // Team totals
  const teamTotals = useMemo(() => {
    let team1Points = 0;
    let team2Points = 0;
    let team1Skins = 0;
    let team2Skins = 0;

    for (const { result } of allMatchResults) {
      team1Points += result.teamAPoints;
      team2Points += result.teamBPoints;
      team1Skins += result.teamASkins;
      team2Skins += result.teamBSkins;
    }

    return { team1Points, team2Points, team1Skins, team2Skins };
  }, [allMatchResults]);

  // Per-round breakdown for teams tab
  const roundBreakdowns = useMemo(() => {
    const map: Record<string, { courseName: string; format: string; team1Points: number; team2Points: number; team1Skins: number; team2Skins: number }> = {};

    for (const { roundId, courseName, format, result } of allMatchResults) {
      if (!map[roundId]) {
        map[roundId] = { courseName, format, team1Points: 0, team2Points: 0, team1Skins: 0, team2Skins: 0 };
      }
      map[roundId].team1Points += result.teamAPoints;
      map[roundId].team2Points += result.teamBPoints;
      map[roundId].team1Skins += result.teamASkins;
      map[roundId].team2Skins += result.teamBSkins;
    }

    return Object.entries(map).map(([id, data]) => ({ roundId: id, ...data }));
  }, [allMatchResults]);

  // Individual skins leaderboard
  const playerSkins = useMemo(() => {
    if (!trip) return [];

    const skinCounts: Record<string, number> = {};
    // Initialize all players
    for (const pid of Object.keys(trip.players)) {
      skinCounts[pid] = 0;
    }

    for (const round of rounds) {
      const roundScores = scores[round.id] ?? {};
      for (const group of round.groups) {
        const result = calculateMatchResult(
          round.format, group, roundScores, trip.players, round.courseHoles
        );

        for (const hr of result.holeResults) {
          if (hr.winner === 'teamA') {
            // Team A players contributed to this skin
            for (const pid of group.teamAPlayerIds) {
              skinCounts[pid] = (skinCounts[pid] ?? 0) + hr.teamASkins;
            }
          } else if (hr.winner === 'teamB') {
            for (const pid of group.teamBPlayerIds) {
              skinCounts[pid] = (skinCounts[pid] ?? 0) + hr.teamBSkins;
            }
          } else {
            // Push - half skins to both sides
            for (const pid of group.teamAPlayerIds) {
              skinCounts[pid] = (skinCounts[pid] ?? 0) + hr.teamASkins;
            }
            for (const pid of group.teamBPlayerIds) {
              skinCounts[pid] = (skinCounts[pid] ?? 0) + hr.teamBSkins;
            }
          }
        }
      }
    }

    return Object.entries(skinCounts)
      .map(([pid, totalSkins]) => ({
        playerId: pid,
        name: trip.players[pid]?.name ?? pid,
        teamId: trip.players[pid]?.teamId ?? 'team1',
        totalSkins,
      }))
      .sort((a, b) => b.totalSkins - a.totalSkins);
  }, [trip, rounds, scores]);

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
      <RetroHeader title="LEADERBOARD" showBack backTo="/home" />

      <div className="flex-1 overflow-y-auto">
        {/* Tab switcher */}
        <div className="flex border-b border-surface-light">
          <button
            onClick={() => setActiveTab('teams')}
            className={`
              flex-1 py-3 font-heading text-[10px] text-center transition-colors retro-press
              ${activeTab === 'teams'
                ? 'text-neon-cyan border-b-2 border-neon-cyan bg-neon-cyan/5'
                : 'text-dim-white/40 hover:text-dim-white/60'
              }
            `}
          >
            TEAMS
          </button>
          <button
            onClick={() => setActiveTab('skins')}
            className={`
              flex-1 py-3 font-heading text-[10px] text-center transition-colors retro-press
              ${activeTab === 'skins'
                ? 'text-neon-green border-b-2 border-neon-green bg-neon-green/5'
                : 'text-dim-white/40 hover:text-dim-white/60'
              }
            `}
          >
            SKINS
          </button>
        </div>

        <div className="px-4 py-4 space-y-4">
          {activeTab === 'teams' ? (
            <>
              {/* Big team score */}
              <RetroCard className="text-center">
                <p className="font-heading text-[8px] text-dim-white/50 mb-3 tracking-widest">
                  TOTAL MATCH POINTS
                </p>
                <div className="flex items-center justify-center gap-6">
                  <div className="flex-1 text-right">
                    <NeonText color="cyan" size="sm" className="block mb-2">
                      {trip.teams.team1.name.toUpperCase()}
                    </NeonText>
                    <p className="font-heading text-3xl text-neon-cyan glow-cyan">
                      {teamTotals.team1Points}
                    </p>
                  </div>
                  <div className="font-heading text-dim-white/20 text-lg">-</div>
                  <div className="flex-1 text-left">
                    <NeonText color="pink" size="sm" className="block mb-2">
                      {trip.teams.team2.name.toUpperCase()}
                    </NeonText>
                    <p className="font-heading text-3xl text-neon-pink glow-pink">
                      {teamTotals.team2Points}
                    </p>
                  </div>
                </div>
              </RetroCard>

              {/* Per-round breakdown */}
              <NeonText color="cyan" size="sm" as="h2">ROUND BREAKDOWN</NeonText>

              {roundBreakdowns.map((rb) => (
                <RetroCard key={rb.roundId} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="font-heading text-[10px] text-dim-white">
                      {rb.courseName.toUpperCase()}
                    </p>
                    <span className="font-body text-xs text-dim-white/40">
                      {FORMAT_LABELS[rb.format] ?? rb.format}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-center flex-1">
                      <p className="font-body text-xs text-dim-white/40">Points</p>
                      <p className="font-heading text-sm text-neon-cyan">{rb.team1Points}</p>
                    </div>
                    <div className="text-center flex-1">
                      <p className="font-body text-xs text-dim-white/40">Skins</p>
                      <p className="font-body text-base text-dim-white">
                        <span className="text-neon-cyan">{rb.team1Skins}</span>
                        {' - '}
                        <span className="text-neon-pink">{rb.team2Skins}</span>
                      </p>
                    </div>
                    <div className="text-center flex-1">
                      <p className="font-body text-xs text-dim-white/40">Points</p>
                      <p className="font-heading text-sm text-neon-pink">{rb.team2Points}</p>
                    </div>
                  </div>
                </RetroCard>
              ))}
            </>
          ) : (
            <>
              {/* Arcade high-score aesthetic */}
              <div className="text-center mb-2">
                <NeonText color="green" size="lg" as="h2">HIGH SCORES</NeonText>
                <p className="font-body text-sm text-dim-white/40 mt-1">
                  INDIVIDUAL SKINS LEADERBOARD
                </p>
              </div>

              {/* Table */}
              <div className="bg-surface border border-surface-light rounded-sm overflow-hidden">
                {/* Header */}
                <div className="grid grid-cols-4 text-center bg-surface-light py-2 px-2">
                  <span className="font-heading text-[8px] text-dim-white/60">RANK</span>
                  <span className="font-heading text-[8px] text-dim-white/60">PLAYER</span>
                  <span className="font-heading text-[8px] text-dim-white/60">TEAM</span>
                  <span className="font-heading text-[8px] text-neon-green">SKINS</span>
                </div>

                {/* Rows */}
                {playerSkins.map((ps, idx) => {
                  const isTeam1 = ps.teamId === 'team1';
                  const teamColor = isTeam1 ? 'text-neon-cyan' : 'text-neon-pink';
                  const teamName = isTeam1
                    ? trip.teams.team1.name
                    : trip.teams.team2.name;

                  // Rank badges for top 3
                  const rankDisplay =
                    idx === 0 ? '1ST' :
                    idx === 1 ? '2ND' :
                    idx === 2 ? '3RD' :
                    String(idx + 1);
                  const rankColor =
                    idx === 0 ? 'text-neon-yellow glow-yellow' :
                    idx === 1 ? 'text-dim-white' :
                    idx === 2 ? 'text-neon-orange' :
                    'text-dim-white/40';

                  return (
                    <div
                      key={ps.playerId}
                      className="grid grid-cols-4 text-center py-2.5 px-2 border-t border-surface-light/30"
                    >
                      <span className={`font-heading text-[9px] ${rankColor}`}>{rankDisplay}</span>
                      <span className="font-heading text-[9px] text-dim-white truncate">
                        {ps.name.toUpperCase()}
                      </span>
                      <span className={`font-body text-xs ${teamColor}`}>
                        {teamName.substring(0, 8)}
                      </span>
                      <span className="font-heading text-sm text-neon-green glow-green">
                        {ps.totalSkins}
                      </span>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
