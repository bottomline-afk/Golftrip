# Myrtle 2026 Golf Trip App - Implementation Plan

## Tech Stack
- **Frontend:** React 18 + Vite + TypeScript
- **Styling:** TailwindCSS + custom retro theme
- **Backend:** Firebase (Firestore, Hosting, Anonymous Auth)
- **PWA:** vite-plugin-pwa (iOS home screen installable)
- **Routing:** React Router v6
- **State:** React Context + Firestore real-time listeners (no Redux needed)

## Firestore Data Model

```
trips/{tripId}
  name: "Myrtle 2026"
  joinCode: "MYRTLE26"
  dates: { start, end }
  teams: {
    team1: { name, logoUrl, color },
    team2: { name, logoUrl, color }
  }
  players: {
    [playerId]: {
      name, handicapIndex, strokes, teamId, avatarUrl
    }
  }
  schedule: [
    { type: "travel"|"round"|"dinner"|"other", date, time, description, roundId? }
  ]

trips/{tripId}/rounds/{roundId}
  courseName, date, teeTime
  format: "practice" | "4v4_best2" | "2v2_bestball" | "1v1"
  status: "upcoming" | "active" | "completed"
  courseHoles: [{ number, par, strokeIndex, yardage }]  // 18 entries
  groups: [
    { id, teamAPlayerIds, teamBPlayerIds }
  ]

trips/{tripId}/rounds/{roundId}/scores/{playerId}
  holes: {
    "1": { gross: 5 },
    "2": { gross: 4 },
    ...
  }
  updatedAt: timestamp
  updatedBy: playerId
```

**Why this structure:**
- Player scores as individual docs = efficient real-time listeners per player
- Hole scores as a map = single doc read for full player round, Firestore handles concurrent field-level writes
- Skins/match results calculated client-side from scores (no duplication, always consistent)
- Flat `players` map on trip doc = single read to get all player info
- `courseHoles` on round doc = stroke index available for handicap calculations

## Scoring Engine

### Handicap Stroke Allocation
1. For each match, calculate relative strokes (lowest player in match = 0)
2. Map strokes to holes using course stroke index (hole with SI=1 gets first stroke, etc.)
3. If strokes > 18, second stroke on lowest SI holes first
4. Net score = gross - allocated strokes for that hole

### Skins Calculation (all formats)
```
For each hole (1-18):
  1. Get net scores for the competing sides
     - 1v1: player A net vs player B net
     - 2v2 best ball: min(teamA player nets) vs min(teamB player nets)
     - 4v4 best 2: sort each team's nets, sum best 2 vs sum best 2
  2. Compare:
     - Lower side wins → 1 skin to that team
     - Tied → 0.5 skins to each team (push)
  3. No carryover (every hole independent)

Match result:
  - Team with more skins wins → 1 team point
  - Equal skins → 0.5 team points each
```

### Team Standings
- Sum all team points across all matches across all rounds
- Display running total on leaderboard

## Pages & Routing

| Route | Page | Description |
|-------|------|-------------|
| `/` | Join | Enter trip code, retro splash screen |
| `/select` | Player Select | SSB-style character select grid |
| `/home` | Dashboard | Trip overview, team scores, next up |
| `/schedule` | Schedule | Full itinerary timeline |
| `/round/:id` | Round Hub | Groups, pairings, match status |
| `/round/:id/scorecard/:groupId` | Scorecard | Live score entry |
| `/round/:id/match/:groupId` | Match Detail | Skins breakdown, hole-by-hole |
| `/leaderboard` | Leaderboard | Team standings, skins leaders, stats |
| `/players` | Players | Team rosters, player cards |
| `/players/:id` | Player Profile | Individual stats, avatar |
| `/admin` | Admin | Configure pairings, manage trip |

## Project Structure

```
src/
  components/
    ui/              # RetroButton, RetroCard, NeonText, GlowBorder, etc.
    scoring/         # ScoreInput, HoleCard, SkinsBadge
    leaderboard/     # TeamStandings, SkinsTable, MatchResult
    layout/          # AppShell, BottomNav, RetroHeader
    players/         # PlayerCard, CharacterSelect, TeamRoster
  pages/             # One file per route above
  hooks/
    useTrip.ts       # Trip context & Firestore listener
    useRound.ts      # Round scores real-time listener
    usePlayer.ts     # Current player context
    useScoring.ts    # Scoring engine hook (calculates nets, skins, standings)
  lib/
    firebase.ts      # Firebase init + offline persistence
    scoring.ts       # Pure functions: net scores, skins, standings
    types.ts         # TypeScript interfaces
    constants.ts     # Course data, trip config
    theme.ts         # Retro theme constants
  context/
    TripContext.tsx   # Trip + players provider
    PlayerContext.tsx # Current player session
  App.tsx
  main.tsx
  index.css          # Tailwind + retro global styles
functions/             # Cloud Functions (minimal - maybe just trip creation)
public/
  manifest.json
  fonts/
firebase.json
firestore.rules
tailwind.config.ts
vite.config.ts
```

## Retro 80s/90s Theme

### Colors (Tailwind config)
- `bg-void`: #0a0a1a (deep background)
- `bg-surface`: #1a1a2e (card/panel backgrounds)
- `neon-pink`: #ff00ff
- `neon-cyan`: #00ffff
- `neon-green`: #39ff14
- `neon-yellow`: #ffff00
- `neon-orange`: #ff6600
- `retro-purple`: #6b00b3

### Typography
- Headings: "Press Start 2P" (Google Fonts - pixel font)
- Body/scores: "VT323" (Google Fonts - retro terminal)
- Fallback: system monospace

### Effects (CSS)
- Scanline overlay (repeating-linear-gradient, subtle)
- Neon text glow (text-shadow with color spread)
- CRT vignette on cards (radial-gradient overlay)
- Pixel-art borders (box-shadow stacking)
- Button press effect (transform + inset shadow)
- Gradient backgrounds (synthwave sunset: pink → purple → dark blue)

### Key UI Moments
- **Join screen:** CRT boot-up animation, flickering text
- **Player select:** SSB-style grid with player avatars, "READY!" animation
- **Score entry:** Big chunky number buttons, flash effects on birdie/eagle
- **Skin won:** Retro "PLAYER 1 WINS" flash, coin/token animation
- **Match complete:** VS screen with results, dramatic reveal
- **Leaderboard:** Arcade high-score table aesthetic

## Score Entry UX (Critical Path)

The #1 most-used feature. Must work perfectly one-handed on iPhone.

1. Select round → select your group → see scorecard
2. Current hole highlighted, tap to enter scores
3. **Score input:** Par-centered picker (big +/- buttons around par value)
   - Default shows par. Tap + for bogey, ++ for double, etc.
   - Tap - for birdie. One tap for most entries.
   - Alternative: number pad grid (1-9) for direct entry
4. Enter score for each player in the group (swipe or tab between)
5. Auto-save on each entry (Firestore write)
6. Auto-advance to next hole after all players scored
7. Net score, skin result shown immediately
8. Running skins tally visible at top

## Offline Support
- `enableMultiTabIndexedDbPersistence()` on Firestore init
- Scores entered offline queue locally, sync when back online
- PWA service worker caches app shell and assets
- Visual indicator when offline (subtle, non-intrusive)

## Firebase Security Rules
- Anonymous Auth (silent, no user interaction) for device identity
- Trip access gated by knowing the join code
- Any authenticated user in a trip can read all trip data
- Any authenticated user in a trip can write scores
- Admin flag on player for trip configuration

## Implementation Phases

### Phase 1: Foundation
- Vite + React + TS project setup
- Firebase project setup (Firestore, Hosting, Auth)
- TailwindCSS with retro theme configuration
- Retro UI component library (buttons, cards, text, layout)
- PWA manifest + service worker
- Firebase init with offline persistence
- TypeScript types for all data models
- Router setup with all routes

### Phase 2: Core Data & Auth
- Join flow (trip code → player select)
- Trip context provider with Firestore listener
- Player session (stored in localStorage + context)
- Admin page: create/configure trip, set teams, manage pairings
- Seed script for Myrtle 2026 trip data (players, rounds, course data)

### Phase 3: Scoring (The Main Event)
- Score entry UI (mobile-optimized input)
- Real-time scorecard with Firestore listeners
- Scoring engine: net score calculation with handicap strokes
- Skins calculation for all 3 formats (4v4, 2v2, 1v1)
- Match result calculation
- Round hub with groups and live status

### Phase 4: Leaderboard & Polish
- Team standings leaderboard
- Individual skins leaderboard
- Match detail view with hole-by-hole skins breakdown
- Schedule/itinerary page
- Player profiles
- Dashboard with trip overview

### Phase 5: Theme & Animations
- Full retro theme pass on all pages
- Animations (scoring events, transitions, page enters)
- Sound effects (optional, user-togglable)
- Player avatars (placeholder for AI-generated images)
- Final polish, PWA testing on iOS Safari

### Phase 6: Deploy & Test
- Firebase Hosting deployment
- Firestore security rules deployment
- End-to-end testing with real scoring scenarios
- iOS Safari PWA install testing
- Offline mode testing

## Course Data Needed
Before Phase 3, need hole-by-hole data for:
- Grand Dunes (par, stroke index per hole)
- Dunes Club (par, stroke index per hole)
- Tidewater (par, stroke index per hole)

This is on physical scorecards and usually on course websites. Can hardcode in `constants.ts`.

## Verification Plan
1. Create trip with join code, verify join flow works
2. Add all 8 players to correct teams
3. Configure pairings for each round
4. Enter test scores for a full 18-hole 1v1 match, verify:
   - Net scores calculated correctly with handicap strokes
   - Skins awarded correctly (wins + pushes)
   - Match result correct
5. Test 2v2 best ball scoring
6. Test 4v4 best 2 of 4 scoring
7. Test real-time: enter score on one device, verify it appears on another
8. Test offline: enter scores with airplane mode, reconnect and verify sync
9. Test PWA: install to iOS home screen, verify full functionality
10. Test leaderboard: verify team points sum correctly across all matches
