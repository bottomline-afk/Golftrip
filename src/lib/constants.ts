import type { Trip, Round, CourseHole } from './types';

const grandDunesHoles: CourseHole[] = [
  { number: 1, par: 4, strokeIndex: 7, yardage: 395 },
  { number: 2, par: 5, strokeIndex: 11, yardage: 530 },
  { number: 3, par: 3, strokeIndex: 15, yardage: 175 },
  { number: 4, par: 4, strokeIndex: 1, yardage: 430 },
  { number: 5, par: 4, strokeIndex: 9, yardage: 385 },
  { number: 6, par: 3, strokeIndex: 17, yardage: 160 },
  { number: 7, par: 4, strokeIndex: 3, yardage: 415 },
  { number: 8, par: 5, strokeIndex: 13, yardage: 545 },
  { number: 9, par: 4, strokeIndex: 5, yardage: 400 },
  { number: 10, par: 4, strokeIndex: 8, yardage: 390 },
  { number: 11, par: 3, strokeIndex: 16, yardage: 185 },
  { number: 12, par: 5, strokeIndex: 12, yardage: 520 },
  { number: 13, par: 4, strokeIndex: 2, yardage: 440 },
  { number: 14, par: 4, strokeIndex: 10, yardage: 380 },
  { number: 15, par: 3, strokeIndex: 18, yardage: 155 },
  { number: 16, par: 4, strokeIndex: 4, yardage: 420 },
  { number: 17, par: 5, strokeIndex: 14, yardage: 535 },
  { number: 18, par: 4, strokeIndex: 6, yardage: 410 },
];

const dunesClubHoles: CourseHole[] = [
  { number: 1, par: 4, strokeIndex: 5, yardage: 405 },
  { number: 2, par: 4, strokeIndex: 11, yardage: 370 },
  { number: 3, par: 3, strokeIndex: 17, yardage: 165 },
  { number: 4, par: 5, strokeIndex: 1, yardage: 550 },
  { number: 5, par: 4, strokeIndex: 7, yardage: 400 },
  { number: 6, par: 4, strokeIndex: 3, yardage: 425 },
  { number: 7, par: 3, strokeIndex: 15, yardage: 180 },
  { number: 8, par: 4, strokeIndex: 9, yardage: 390 },
  { number: 9, par: 5, strokeIndex: 13, yardage: 525 },
  { number: 10, par: 4, strokeIndex: 6, yardage: 395 },
  { number: 11, par: 3, strokeIndex: 18, yardage: 150 },
  { number: 12, par: 4, strokeIndex: 2, yardage: 435 },
  { number: 13, par: 5, strokeIndex: 12, yardage: 540 },
  { number: 14, par: 4, strokeIndex: 8, yardage: 385 },
  { number: 15, par: 4, strokeIndex: 4, yardage: 415 },
  { number: 16, par: 3, strokeIndex: 16, yardage: 170 },
  { number: 17, par: 4, strokeIndex: 10, yardage: 375 },
  { number: 18, par: 4, strokeIndex: 14, yardage: 410 },
];

const barefootFazioHoles: CourseHole[] = [
  { number: 1, par: 4, strokeIndex: 7, yardage: 395 },
  { number: 2, par: 4, strokeIndex: 3, yardage: 420 },
  { number: 3, par: 5, strokeIndex: 11, yardage: 540 },
  { number: 4, par: 3, strokeIndex: 15, yardage: 175 },
  { number: 5, par: 4, strokeIndex: 1, yardage: 440 },
  { number: 6, par: 4, strokeIndex: 9, yardage: 385 },
  { number: 7, par: 3, strokeIndex: 17, yardage: 165 },
  { number: 8, par: 5, strokeIndex: 5, yardage: 555 },
  { number: 9, par: 4, strokeIndex: 13, yardage: 400 },
  { number: 10, par: 4, strokeIndex: 2, yardage: 430 },
  { number: 11, par: 4, strokeIndex: 8, yardage: 390 },
  { number: 12, par: 3, strokeIndex: 16, yardage: 170 },
  { number: 13, par: 5, strokeIndex: 6, yardage: 535 },
  { number: 14, par: 4, strokeIndex: 4, yardage: 425 },
  { number: 15, par: 4, strokeIndex: 10, yardage: 380 },
  { number: 16, par: 4, strokeIndex: 12, yardage: 395 },
  { number: 17, par: 3, strokeIndex: 18, yardage: 155 },
  { number: 18, par: 5, strokeIndex: 14, yardage: 545 },
];

const legendsHoles: CourseHole[] = [
  { number: 1, par: 4, strokeIndex: 9, yardage: 380 },
  { number: 2, par: 5, strokeIndex: 3, yardage: 535 },
  { number: 3, par: 4, strokeIndex: 7, yardage: 395 },
  { number: 4, par: 3, strokeIndex: 13, yardage: 170 },
  { number: 5, par: 4, strokeIndex: 1, yardage: 435 },
  { number: 6, par: 4, strokeIndex: 11, yardage: 375 },
  { number: 7, par: 3, strokeIndex: 17, yardage: 155 },
  { number: 8, par: 5, strokeIndex: 5, yardage: 550 },
  { number: 9, par: 4, strokeIndex: 15, yardage: 385 },
  { number: 10, par: 4, strokeIndex: 2, yardage: 425 },
  { number: 11, par: 3, strokeIndex: 16, yardage: 165 },
  { number: 12, par: 5, strokeIndex: 6, yardage: 540 },
  { number: 13, par: 4, strokeIndex: 8, yardage: 390 },
  { number: 14, par: 4, strokeIndex: 4, yardage: 420 },
  { number: 15, par: 4, strokeIndex: 10, yardage: 380 },
  { number: 16, par: 3, strokeIndex: 18, yardage: 150 },
  { number: 17, par: 5, strokeIndex: 14, yardage: 525 },
  { number: 18, par: 4, strokeIndex: 12, yardage: 400 },
];

export const COURSES: Record<string, CourseHole[]> = {
  'Grand Dunes': grandDunesHoles,
  'Dunes Club': dunesClubHoles,
  'Barefoot (Fazio)': barefootFazioHoles,
  'Legends': legendsHoles,
};

export const DEFAULT_TRIP: Omit<Trip, 'id'> = {
  name: 'Myrtle 2026',
  joinCode: 'MYRTLE26',
  dates: { start: '2026-03-17', end: '2026-03-21' },
  teams: {
    team1: { name: 'Birdie Bandits', color: '#00ffff' },
    team2: { name: 'Pixel Wolves', color: '#ff00ff' },
  },
  players: {
    p1: { name: 'Ted', handicapIndex: 10, strokes: 0, teamId: 'team1', avatarUrl: '' },
    p2: { name: 'Ryan', handicapIndex: 11.8, strokes: 2, teamId: 'team1', avatarUrl: '', isAdmin: true },
    p3: { name: 'Joe', handicapIndex: 15.2, strokes: 6, teamId: 'team1', avatarUrl: '' },
    p4: { name: 'Steve', handicapIndex: 22, strokes: 15, teamId: 'team1', avatarUrl: '' },
    p5: { name: 'Bernie', handicapIndex: 12.6, strokes: 3, teamId: 'team2', avatarUrl: '' },
    p6: { name: 'Chris', handicapIndex: 14.5, strokes: 5, teamId: 'team2', avatarUrl: '' },
    p7: { name: 'Kevin', handicapIndex: 14.9, strokes: 6, teamId: 'team2', avatarUrl: '' },
    p8: { name: 'BJ', handicapIndex: 20, strokes: 12, teamId: 'team2', avatarUrl: '' },
  },
  schedule: [
    { type: 'travel', date: '2026-03-17', time: '15:00', description: 'Flight to Myrtle Beach - UA3589 EWR\u2192MYR (lands 5:05p)' },
    { type: 'round', date: '2026-03-18', time: '09:00', description: 'Practice Round - Legends' },
    { type: 'round', date: '2026-03-18', time: '13:00', description: 'Round 1 - Grand Dunes (4v4 Best 2)', roundId: 'r1' },
    { type: 'round', date: '2026-03-19', time: '07:40', description: 'Round 2 - Dunes Club (2v2 Best Ball) - Tee 7:40/7:50a', roundId: 'r2' },
    { type: 'round', date: '2026-03-19', time: '13:40', description: 'Round 3 - Dunes Club (2v2 Best Ball) - Tee 1:40/1:50p', roundId: 'r3' },
    { type: 'dinner', date: '2026-03-19', time: '19:00', description: 'NY Prime Dinner' },
    { type: 'round', date: '2026-03-20', time: '08:44', description: 'Round 4 - Barefoot Fazio (1v1 Singles) - Tee 8:44/8:52a', roundId: 'r4' },
    { type: 'travel', date: '2026-03-21', time: '12:57', description: 'Flight Home - UA3420 MYR\u2192EWR (lands 2:56p)' },
  ],
};

export const DEFAULT_ROUNDS: Omit<Round, 'id'>[] = [
  {
    courseName: 'Grand Dunes',
    date: '2026-03-18',
    teeTime: '13:00',
    format: '4v4_best2',
    status: 'upcoming',
    courseHoles: grandDunesHoles,
    groups: [
      { id: 'g1', teamAPlayerIds: ['p1', 'p2', 'p3', 'p4'], teamBPlayerIds: ['p5', 'p6', 'p7', 'p8'] },
    ],
  },
  {
    courseName: 'Dunes Club',
    date: '2026-03-19',
    teeTime: '07:40',
    format: '2v2_bestball',
    status: 'upcoming',
    courseHoles: dunesClubHoles,
    groups: [
      { id: 'g1', teamAPlayerIds: ['p1', 'p3'], teamBPlayerIds: ['p8', 'p7'], teeTime: '7:40a' },
      { id: 'g2', teamAPlayerIds: ['p2', 'p4'], teamBPlayerIds: ['p5', 'p6'], teeTime: '7:50a' },
    ],
  },
  {
    courseName: 'Dunes Club',
    date: '2026-03-19',
    teeTime: '13:40',
    format: '2v2_bestball',
    status: 'upcoming',
    courseHoles: dunesClubHoles,
    groups: [
      { id: 'g1', teamAPlayerIds: ['p2', 'p1'], teamBPlayerIds: ['p5', 'p7'], teeTime: '1:40p' },
      { id: 'g2', teamAPlayerIds: ['p3', 'p4'], teamBPlayerIds: ['p8', 'p6'], teeTime: '1:50p' },
    ],
  },
  {
    courseName: 'Barefoot (Fazio)',
    date: '2026-03-20',
    teeTime: '08:44',
    format: '1v1',
    status: 'upcoming',
    courseHoles: barefootFazioHoles,
    groups: [
      { id: 'g1', teamAPlayerIds: ['p1'], teamBPlayerIds: ['p5'], teeTime: '8:44a' },
      { id: 'g2', teamAPlayerIds: ['p3'], teamBPlayerIds: ['p7'], teeTime: '8:44a' },
      { id: 'g3', teamAPlayerIds: ['p2'], teamBPlayerIds: ['p6'], teeTime: '8:52a' },
      { id: 'g4', teamAPlayerIds: ['p4'], teamBPlayerIds: ['p8'], teeTime: '8:52a' },
    ],
  },
];

export const FORMAT_LABELS: Record<string, string> = {
  practice: 'Practice Round',
  '4v4_best2': '4v4 Best 2 of 4',
  '2v2_bestball': '2v2 Best Ball',
  '1v1': '1v1 Singles',
};
