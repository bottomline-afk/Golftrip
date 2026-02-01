import type { CourseHole, Group, PlayerScores, RoundFormat, HoleResult, MatchResult, Player } from './types';

/**
 * Calculate handicap strokes allocated per hole for a player relative to the lowest in the match.
 * Returns a map of hole number -> strokes given on that hole.
 */
export function allocateStrokes(
  playerStrokes: number,
  lowestStrokes: number,
  courseHoles: CourseHole[]
): Record<number, number> {
  const relativeStrokes = playerStrokes - lowestStrokes;
  const allocation: Record<number, number> = {};

  if (relativeStrokes <= 0) {
    courseHoles.forEach((h) => (allocation[h.number] = 0));
    return allocation;
  }

  // Sort holes by stroke index (ascending = hardest first)
  const sorted = [...courseHoles].sort((a, b) => a.strokeIndex - b.strokeIndex);

  courseHoles.forEach((h) => (allocation[h.number] = 0));

  let remaining = relativeStrokes;
  // First pass: 1 stroke per hole by stroke index
  for (const hole of sorted) {
    if (remaining <= 0) break;
    allocation[hole.number] += 1;
    remaining--;
  }
  // Second pass if > 18 strokes: additional strokes
  for (const hole of sorted) {
    if (remaining <= 0) break;
    allocation[hole.number] += 1;
    remaining--;
  }

  return allocation;
}

/**
 * Calculate net score for a player on a hole.
 */
export function netScore(gross: number, strokesOnHole: number): number {
  return gross - strokesOnHole;
}

/**
 * Find the lowest strokes value among a set of players.
 */
export function findLowestStrokes(playerIds: string[], players: Record<string, Player>): number {
  let lowest = Infinity;
  for (const id of playerIds) {
    if (players[id] && players[id].strokes < lowest) {
      lowest = players[id].strokes;
    }
  }
  return lowest === Infinity ? 0 : lowest;
}

/**
 * Calculate skins for a single hole based on format.
 */
export function calculateHoleSkins(
  holeNumber: number,
  format: RoundFormat,
  group: Group,
  allScores: Record<string, PlayerScores>,
  players: Record<string, Player>,
  courseHoles: CourseHole[]
): HoleResult {
  const allPlayerIds = [...group.teamAPlayerIds, ...group.teamBPlayerIds];
  const lowestStrokes = findLowestStrokes(allPlayerIds, players);

  const getNet = (playerId: string): number | null => {
    const scores = allScores[playerId];
    if (!scores || !scores.holes[String(holeNumber)]) return null;
    const gross = scores.holes[String(holeNumber)].gross;
    const playerStrokesVal = players[playerId]?.strokes ?? 0;
    const strokeAllocation = allocateStrokes(playerStrokesVal, lowestStrokes, courseHoles);
    return netScore(gross, strokeAllocation[holeNumber] ?? 0);
  };

  const teamANets = group.teamAPlayerIds.map(getNet).filter((n): n is number => n !== null);
  const teamBNets = group.teamBPlayerIds.map(getNet).filter((n): n is number => n !== null);

  if (teamANets.length === 0 || teamBNets.length === 0) {
    return { hole: holeNumber, teamASkins: 0, teamBSkins: 0, teamANet: 0, teamBNet: 0, winner: 'push' };
  }

  let teamAValue: number;
  let teamBValue: number;

  switch (format) {
    case '1v1':
      teamAValue = teamANets[0];
      teamBValue = teamBNets[0];
      break;
    case '2v2_bestball':
      teamAValue = Math.min(...teamANets);
      teamBValue = Math.min(...teamBNets);
      break;
    case '4v4_best2': {
      const sortedA = [...teamANets].sort((a, b) => a - b);
      const sortedB = [...teamBNets].sort((a, b) => a - b);
      teamAValue = sortedA.slice(0, 2).reduce((s, v) => s + v, 0);
      teamBValue = sortedB.slice(0, 2).reduce((s, v) => s + v, 0);
      break;
    }
    default:
      teamAValue = 0;
      teamBValue = 0;
  }

  let winner: 'teamA' | 'teamB' | 'push';
  let teamASkins: number;
  let teamBSkins: number;

  if (teamAValue < teamBValue) {
    winner = 'teamA';
    teamASkins = 1;
    teamBSkins = 0;
  } else if (teamBValue < teamAValue) {
    winner = 'teamB';
    teamASkins = 0;
    teamBSkins = 1;
  } else {
    winner = 'push';
    teamASkins = 0.5;
    teamBSkins = 0.5;
  }

  return { hole: holeNumber, teamASkins, teamBSkins, teamANet: teamAValue, teamBNet: teamBValue, winner };
}

/**
 * Calculate full match result for a group.
 */
export function calculateMatchResult(
  format: RoundFormat,
  group: Group,
  allScores: Record<string, PlayerScores>,
  players: Record<string, Player>,
  courseHoles: CourseHole[]
): MatchResult {
  const holeResults: HoleResult[] = [];
  let teamASkins = 0;
  let teamBSkins = 0;

  for (let hole = 1; hole <= 18; hole++) {
    const result = calculateHoleSkins(hole, format, group, allScores, players, courseHoles);
    holeResults.push(result);
    teamASkins += result.teamASkins;
    teamBSkins += result.teamBSkins;
  }

  let teamAPoints: number;
  let teamBPoints: number;

  if (teamASkins > teamBSkins) {
    teamAPoints = 1;
    teamBPoints = 0;
  } else if (teamBSkins > teamASkins) {
    teamAPoints = 0;
    teamBPoints = 1;
  } else {
    teamAPoints = 0.5;
    teamBPoints = 0.5;
  }

  return { groupId: group.id, teamASkins, teamBSkins, teamAPoints, teamBPoints, holeResults };
}

/**
 * Get the number of holes completed for a group.
 */
export function getCompletedHoles(
  group: Group,
  allScores: Record<string, PlayerScores>
): number {
  let completed = 0;
  for (let hole = 1; hole <= 18; hole++) {
    const allHaveScore = [...group.teamAPlayerIds, ...group.teamBPlayerIds].every(
      (pid) => allScores[pid]?.holes[String(hole)]?.gross !== undefined
    );
    if (allHaveScore) completed++;
  }
  return completed;
}

/**
 * Get a player's stroke allocation for display purposes.
 */
export function getPlayerStrokeAllocation(
  playerId: string,
  allPlayerIds: string[],
  players: Record<string, Player>,
  courseHoles: CourseHole[]
): Record<number, number> {
  const lowestStrokes = findLowestStrokes(allPlayerIds, players);
  const playerStrokesVal = players[playerId]?.strokes ?? 0;
  return allocateStrokes(playerStrokesVal, lowestStrokes, courseHoles);
}
