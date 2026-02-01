import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { TripProvider } from './context/TripContext';
import { PlayerProvider } from './context/PlayerContext';
import AppShell from './components/layout/AppShell';
import JoinPage from './pages/JoinPage';
import PlayerSelectPage from './pages/PlayerSelectPage';
import DashboardPage from './pages/DashboardPage';
import SchedulePage from './pages/SchedulePage';
import RoundHubPage from './pages/RoundHubPage';
import ScorecardPage from './pages/ScorecardPage';
import MatchDetailPage from './pages/MatchDetailPage';
import LeaderboardPage from './pages/LeaderboardPage';
import PlayersPage from './pages/PlayersPage';
import PlayerProfilePage from './pages/PlayerProfilePage';
import AdminPage from './pages/AdminPage';

function App() {
  return (
    <BrowserRouter>
      <TripProvider>
        <PlayerProvider>
          <Routes>
            <Route path="/" element={<JoinPage />} />
            <Route path="/select" element={<PlayerSelectPage />} />
            <Route element={<AppShell />}>
              <Route path="/home" element={<DashboardPage />} />
              <Route path="/schedule" element={<SchedulePage />} />
              <Route path="/round/:id" element={<RoundHubPage />} />
              <Route path="/round/:id/scorecard/:groupId" element={<ScorecardPage />} />
              <Route path="/round/:id/match/:groupId" element={<MatchDetailPage />} />
              <Route path="/leaderboard" element={<LeaderboardPage />} />
              <Route path="/players" element={<PlayersPage />} />
              <Route path="/players/:id" element={<PlayerProfilePage />} />
              <Route path="/admin" element={<AdminPage />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </PlayerProvider>
      </TripProvider>
    </BrowserRouter>
  );
}

export default App;
