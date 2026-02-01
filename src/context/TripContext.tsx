import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { doc, onSnapshot, setDoc, collection } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { db, auth, signInAnon } from '../lib/firebase';
import { DEFAULT_TRIP, DEFAULT_ROUNDS } from '../lib/constants';
import type { Trip, Round, PlayerScores } from '../lib/types';

interface TripContextValue {
  trip: Trip | null;
  rounds: Round[];
  scores: Record<string, Record<string, PlayerScores>>; // roundId -> playerId -> scores
  loading: boolean;
  tripId: string;
  seedTrip: () => Promise<void>;
}

const TripContext = createContext<TripContextValue | null>(null);

const TRIP_ID = 'myrtle2026';

export function TripProvider({ children }: { children: ReactNode }) {
  const [trip, setTrip] = useState<Trip | null>(null);
  const [rounds, setRounds] = useState<Round[]>([]);
  const [scores, setScores] = useState<Record<string, Record<string, PlayerScores>>>({});
  const [loading, setLoading] = useState(true);
  const [authReady, setAuthReady] = useState(false);

  // Wait for auth before subscribing to Firestore
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        await signInAnon();
        // onAuthStateChanged will fire again once signed in
        return;
      }
      setAuthReady(true);
    });
    return unsub;
  }, []);

  // Listen to trip document
  useEffect(() => {
    if (!authReady) return;
    const unsub = onSnapshot(
      doc(db, 'trips', TRIP_ID),
      (snap) => {
        if (snap.exists()) {
          setTrip({ id: snap.id, ...snap.data() } as Trip);
        } else {
          setTrip(null);
        }
        setLoading(false);
      },
      (error) => {
        console.error('Trip listener error:', error);
        // Use default data offline
        setTrip({ id: TRIP_ID, ...DEFAULT_TRIP });
        setLoading(false);
      }
    );
    return unsub;
  }, [authReady]);

  // Listen to rounds collection
  useEffect(() => {
    if (!authReady) return;
    const unsub = onSnapshot(
      collection(db, 'trips', TRIP_ID, 'rounds'),
      (snap) => {
        const roundsData = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Round));
        roundsData.sort((a, b) => a.date.localeCompare(b.date));
        setRounds(roundsData);
      },
      (error) => {
        console.error('Rounds listener error:', error);
        setRounds(DEFAULT_ROUNDS.map((r, i) => ({ ...r, id: `r${i + 1}` })));
      }
    );
    return unsub;
  }, [authReady]);

  // Listen to scores for each round
  useEffect(() => {
    if (!authReady || rounds.length === 0) return;

    const unsubs = rounds.map((round) =>
      onSnapshot(
        collection(db, 'trips', TRIP_ID, 'rounds', round.id, 'scores'),
        (snap) => {
          const roundScores: Record<string, PlayerScores> = {};
          snap.docs.forEach((d) => {
            roundScores[d.id] = { playerId: d.id, ...d.data() } as PlayerScores;
          });
          setScores((prev) => ({ ...prev, [round.id]: roundScores }));
        },
        (error) => {
          console.error(`Scores listener error for round ${round.id}:`, error);
        }
      )
    );
    return () => unsubs.forEach((u) => u());
  }, [authReady, rounds]);

  const seedTrip = useCallback(async () => {
    try {
      await setDoc(doc(db, 'trips', TRIP_ID), DEFAULT_TRIP);
      for (let i = 0; i < DEFAULT_ROUNDS.length; i++) {
        await setDoc(doc(db, 'trips', TRIP_ID, 'rounds', `r${i + 1}`), DEFAULT_ROUNDS[i]);
      }
    } catch (error) {
      console.error('Failed to seed trip:', error);
    }
  }, []);

  return (
    <TripContext.Provider value={{ trip, rounds, scores, loading, tripId: TRIP_ID, seedTrip }}>
      {children}
    </TripContext.Provider>
  );
}

export function useTrip() {
  const ctx = useContext(TripContext);
  if (!ctx) throw new Error('useTrip must be used within TripProvider');
  return ctx;
}
