import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

interface PlayerContextValue {
  playerId: string | null;
  setPlayerId: (id: string) => void;
  clearPlayer: () => void;
  joinCode: string | null;
  setJoinCode: (code: string) => void;
}

const PlayerContext = createContext<PlayerContextValue | null>(null);

const STORAGE_KEY_PLAYER = 'golftrip_player_id';
const STORAGE_KEY_JOIN = 'golftrip_join_code';

export function PlayerProvider({ children }: { children: ReactNode }) {
  const [playerId, setPlayerIdState] = useState<string | null>(() => {
    try {
      return localStorage.getItem(STORAGE_KEY_PLAYER);
    } catch {
      return null;
    }
  });

  const [joinCode, setJoinCodeState] = useState<string | null>(() => {
    try {
      return localStorage.getItem(STORAGE_KEY_JOIN);
    } catch {
      return null;
    }
  });

  const setPlayerId = (id: string) => {
    setPlayerIdState(id);
    try {
      localStorage.setItem(STORAGE_KEY_PLAYER, id);
    } catch { /* noop */ }
  };

  const setJoinCode = (code: string) => {
    setJoinCodeState(code);
    try {
      localStorage.setItem(STORAGE_KEY_JOIN, code);
    } catch { /* noop */ }
  };

  const clearPlayer = () => {
    setPlayerIdState(null);
    try {
      localStorage.removeItem(STORAGE_KEY_PLAYER);
    } catch { /* noop */ }
  };

  // Auto-sign in anonymously on mount
  useEffect(() => {
    import('../lib/firebase').then(({ signInAnon }) => signInAnon());
  }, []);

  return (
    <PlayerContext.Provider value={{ playerId, setPlayerId, clearPlayer, joinCode, setJoinCode }}>
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error('usePlayer must be used within PlayerProvider');
  return ctx;
}
