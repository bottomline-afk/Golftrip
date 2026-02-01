export interface Trip {
  id: string;
  name: string;
  joinCode: string;
  dates: { start: string; end: string };
  teams: {
    team1: TeamInfo;
    team2: TeamInfo;
  };
  players: Record<string, Player>;
  schedule: ScheduleEvent[];
}

export interface TeamInfo {
  name: string;
  logoUrl?: string;
  color: string;
}

export interface Player {
  name: string;
  handicapIndex: number;
  strokes: number;
  teamId: 'team1' | 'team2';
  avatarUrl?: string;
  isAdmin?: boolean;
  basePhotoUrl?: string;
  generatedAvatars?: Record<string, string>;
  avatarGenerationStatus?: 'idle' | 'generating' | 'complete' | 'error';
}

export interface ScheduleEvent {
  type: 'travel' | 'round' | 'dinner' | 'other';
  date: string;
  time: string;
  description: string;
  roundId?: string;
}

export interface Round {
  id: string;
  courseName: string;
  date: string;
  teeTime: string;
  format: RoundFormat;
  status: 'upcoming' | 'active' | 'completed';
  courseHoles: CourseHole[];
  groups: Group[];
}

export type RoundFormat = 'practice' | '4v4_best2' | '2v2_bestball' | '1v1';

export interface CourseHole {
  number: number;
  par: number;
  strokeIndex: number;
  yardage: number;
}

export interface Group {
  id: string;
  teamAPlayerIds: string[];
  teamBPlayerIds: string[];
  teeTime?: string;
}

export interface PlayerScores {
  playerId: string;
  holes: Record<string, { gross: number }>;
  updatedAt?: string;
  updatedBy?: string;
}

export interface HoleResult {
  hole: number;
  teamASkins: number;
  teamBSkins: number;
  teamANet: number;
  teamBNet: number;
  winner: 'teamA' | 'teamB' | 'push';
}

export interface MatchResult {
  groupId: string;
  teamASkins: number;
  teamBSkins: number;
  teamAPoints: number;
  teamBPoints: number;
  holeResults: HoleResult[];
}

export interface TeamStanding {
  teamId: 'team1' | 'team2';
  teamName: string;
  totalPoints: number;
  matchesPlayed: number;
  matchesWon: number;
  matchesTied: number;
  matchesLost: number;
  totalSkins: number;
}

export interface PlayerSkinsStat {
  playerId: string;
  playerName: string;
  teamId: 'team1' | 'team2';
  totalSkins: number;
  roundSkins: Record<string, number>;
}
