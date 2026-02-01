import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useTrip } from '../context/TripContext';
import { usePlayer } from '../context/PlayerContext';
import RetroHeader from '../components/layout/RetroHeader';
import RetroCard from '../components/ui/RetroCard';
import NeonText from '../components/ui/NeonText';
import PlayerAvatar from '../components/PlayerAvatar';
import AvatarUpload from '../components/AvatarUpload';
import AvatarStylePicker from '../components/AvatarStylePicker';
import { calculateMatchResult } from '../lib/scoring';
import { FORMAT_LABELS } from '../lib/constants';
import type { Group } from '../lib/types';

export default function PlayerProfilePage() {
  const { id: profileId } = useParams<{ id: string }>();
  const { trip, rounds, scores, loading, tripId } = useTrip();
  const { playerId: currentPlayerId } = usePlayer();

  const player = useMemo(
    () => (trip && profileId ? trip.players[profileId] : null),
    [trip, profileId]
  );

  // Compute per-round stats for this player
  const roundStats = useMemo(() => {
    if (!trip || !profileId || !player) return [];

    const stats: {
      roundId: string;
      courseName: string;
      format: string;
      totalGross: number;
      holesPlayed: number;
      skinsContributed: number;
    }[] = [];

    for (const round of rounds) {
      const roundScores = scores[round.id] ?? {};
      // Check if this player is in any group for this round
      const playerGroup: Group | undefined = round.groups.find(
        (g) => g.teamAPlayerIds.includes(profileId) || g.teamBPlayerIds.includes(profileId)
      );
      if (!playerGroup) continue;

      // Total gross for this player
      const playerScoreData = roundScores[profileId];
      let totalGross = 0;
      let holesPlayed = 0;
      if (playerScoreData) {
        for (const [, holeData] of Object.entries(playerScoreData.holes)) {
          if (holeData.gross) {
            totalGross += holeData.gross;
            holesPlayed++;
          }
        }
      }

      // Skins contributed: count holes where this player's team won
      let skinsContributed = 0;
      const matchResult = calculateMatchResult(
        round.format, playerGroup, roundScores, trip.players, round.courseHoles
      );

      const isTeamA = playerGroup.teamAPlayerIds.includes(profileId);
      for (const hr of matchResult.holeResults) {
        if (isTeamA && hr.winner === 'teamA') {
          skinsContributed += hr.teamASkins;
        } else if (!isTeamA && hr.winner === 'teamB') {
          skinsContributed += hr.teamBSkins;
        }
      }

      stats.push({
        roundId: round.id,
        courseName: round.courseName,
        format: round.format,
        totalGross,
        holesPlayed,
        skinsContributed,
      });
    }

    return stats;
  }, [trip, profileId, player, rounds, scores]);

  if (loading) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-void">
        <p className="font-heading text-dim-white text-xs animate-flicker">LOADING...</p>
      </div>
    );
  }

  if (!trip || !player || !profileId) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-void">
        <p className="font-heading text-neon-orange text-xs">PLAYER NOT FOUND</p>
      </div>
    );
  }

  const isTeam1 = player.teamId === 'team1';
  const teamColor = isTeam1 ? 'cyan' : 'pink';
  const teamColorClass = isTeam1 ? 'text-neon-cyan' : 'text-neon-pink';
  const teamName = isTeam1 ? trip.teams.team1.name : trip.teams.team2.name;
  const isOwnProfile = currentPlayerId === profileId;

  return (
    <div className="min-h-dvh bg-void flex flex-col">
      <RetroHeader title={player.name.toUpperCase()} showBack backTo="/players" />

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {/* Avatar and basic info */}
        <div className="flex flex-col items-center gap-3">
          <PlayerAvatar player={player} size="lg" />

          <NeonText color={teamColor} size="lg" as="h2">
            {player.name.toUpperCase()}
          </NeonText>
        </div>

        {/* Avatar management (own profile only) */}
        {isOwnProfile && player.avatarGenerationStatus === 'complete' && player.generatedAvatars && (
          <AvatarStylePicker tripId={tripId} playerId={profileId} player={player} />
        )}
        {isOwnProfile && (
          <AvatarUpload tripId={tripId} playerId={profileId} player={player} />
        )}

        {/* Stats card */}
        <RetroCard glow={teamColor as 'cyan' | 'pink'}>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="font-heading text-[8px] text-dim-white/50 mb-1">HANDICAP</p>
              <p className="font-heading text-sm text-dim-white">{player.handicapIndex}</p>
            </div>
            <div>
              <p className="font-heading text-[8px] text-dim-white/50 mb-1">STROKES</p>
              <p className="font-heading text-sm text-dim-white">{player.strokes}</p>
            </div>
            <div>
              <p className="font-heading text-[8px] text-dim-white/50 mb-1">TEAM</p>
              <p className={`font-heading text-[9px] ${teamColorClass}`}>
                {teamName.toUpperCase()}
              </p>
            </div>
          </div>
        </RetroCard>

        {/* Per-round stats */}
        <NeonText color={teamColor as 'cyan' | 'pink'} size="sm" as="h2">
          ROUND STATS
        </NeonText>

        {roundStats.length === 0 ? (
          <RetroCard>
            <p className="font-body text-sm text-dim-white/40 text-center">
              NO ROUNDS PLAYED YET
            </p>
          </RetroCard>
        ) : (
          roundStats.map((rs) => (
            <RetroCard key={rs.roundId}>
              <div className="flex items-center justify-between mb-2">
                <p className="font-heading text-[10px] text-dim-white">
                  {rs.courseName.toUpperCase()}
                </p>
                <span className="font-body text-xs text-dim-white/40">
                  {FORMAT_LABELS[rs.format] ?? rs.format}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div>
                  <p className="font-heading text-[8px] text-dim-white/50 mb-1">GROSS</p>
                  <p className="font-heading text-sm text-dim-white">
                    {rs.holesPlayed > 0 ? rs.totalGross : '-'}
                  </p>
                </div>
                <div>
                  <p className="font-heading text-[8px] text-dim-white/50 mb-1">HOLES</p>
                  <p className="font-heading text-sm text-dim-white">{rs.holesPlayed}/18</p>
                </div>
                <div>
                  <p className="font-heading text-[8px] text-dim-white/50 mb-1">SKINS</p>
                  <p className="font-heading text-sm text-neon-green">{rs.skinsContributed}</p>
                </div>
              </div>
            </RetroCard>
          ))
        )}
      </div>
    </div>
  );
}
