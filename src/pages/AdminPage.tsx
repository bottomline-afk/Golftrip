import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useTrip } from '../context/TripContext';
import { usePlayer } from '../context/PlayerContext';
import RetroHeader from '../components/layout/RetroHeader';
import RetroCard from '../components/ui/RetroCard';
import RetroButton from '../components/ui/RetroButton';
import NeonText from '../components/ui/NeonText';

type RoundStatus = 'upcoming' | 'active' | 'completed';

const STATUS_OPTIONS: RoundStatus[] = ['upcoming', 'active', 'completed'];

export default function AdminPage() {
  const { trip, rounds, loading, tripId, seedTrip } = useTrip();
  const { playerId } = usePlayer();
  const navigate = useNavigate();

  const [seeding, setSeeding] = useState(false);
  const [updatingRound, setUpdatingRound] = useState<string | null>(null);

  const currentPlayer = trip && playerId ? trip.players[playerId] : null;
  const isAdmin = currentPlayer?.isAdmin === true;

  const handleSeed = async () => {
    setSeeding(true);
    try {
      await seedTrip();
    } catch (err) {
      console.error('Seed failed:', err);
    } finally {
      setSeeding(false);
    }
  };

  const handleStatusChange = async (roundId: string, newStatus: RoundStatus) => {
    setUpdatingRound(roundId);
    try {
      const roundDocRef = doc(db, 'trips', tripId, 'rounds', roundId);
      await updateDoc(roundDocRef, { status: newStatus });
    } catch (err) {
      console.error('Failed to update round status:', err);
    } finally {
      setUpdatingRound(null);
    }
  };

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

  if (!isAdmin) {
    return (
      <div className="min-h-dvh bg-void flex flex-col">
        <RetroHeader title="ADMIN" showBack backTo="/home" />
        <div className="flex-1 flex flex-col items-center justify-center gap-4 px-4">
          <NeonText color="orange" size="lg" as="p">ACCESS DENIED</NeonText>
          <p className="font-body text-sm text-dim-white/60 text-center">
            You do not have admin privileges.
          </p>
          <RetroButton variant="cyan" onClick={() => navigate('/home')}>
            RETURN HOME
          </RetroButton>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-void flex flex-col">
      <RetroHeader title="ADMIN" showBack backTo="/home" />

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {/* Trip info */}
        <RetroCard>
          <NeonText color="cyan" size="sm" as="h2" className="mb-3">
            TRIP INFO
          </NeonText>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="font-body text-sm text-dim-white/60">Name</span>
              <span className="font-body text-sm text-dim-white">{trip.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-body text-sm text-dim-white/60">Code</span>
              <span className="font-heading text-[10px] text-neon-green">{trip.joinCode}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-body text-sm text-dim-white/60">Dates</span>
              <span className="font-body text-sm text-dim-white">
                {trip.dates.start} - {trip.dates.end}
              </span>
            </div>
          </div>
        </RetroCard>

        {/* Seed / reset */}
        <RetroCard>
          <NeonText color="orange" size="sm" as="h2" className="mb-3">
            DATA MANAGEMENT
          </NeonText>
          <p className="font-body text-sm text-dim-white/60 mb-3">
            Seed or reset all trip data to defaults. This will overwrite current data.
          </p>
          <RetroButton
            variant="orange"
            onClick={handleSeed}
            disabled={seeding}
            className="w-full"
          >
            {seeding ? 'SEEDING...' : 'SEED / RESET TRIP DATA'}
          </RetroButton>
        </RetroCard>

        {/* Round status toggles */}
        <RetroCard>
          <NeonText color="green" size="sm" as="h2" className="mb-3">
            ROUND STATUS
          </NeonText>

          <div className="space-y-4">
            {rounds.map((round) => {
              const isUpdating = updatingRound === round.id;

              return (
                <div key={round.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="font-heading text-[10px] text-dim-white">
                      {round.courseName.toUpperCase()}
                    </p>
                    {isUpdating && (
                      <span className="font-heading text-[8px] text-neon-yellow animate-flicker">
                        SAVING...
                      </span>
                    )}
                  </div>

                  <div className="flex gap-2">
                    {STATUS_OPTIONS.map((status) => {
                      const isActive = round.status === status;
                      const statusColors: Record<RoundStatus, string> = {
                        upcoming: isActive
                          ? 'bg-dim-white/20 border-dim-white text-dim-white'
                          : 'border-surface-light text-dim-white/30',
                        active: isActive
                          ? 'bg-neon-yellow/20 border-neon-yellow text-neon-yellow'
                          : 'border-surface-light text-dim-white/30',
                        completed: isActive
                          ? 'bg-neon-green/20 border-neon-green text-neon-green'
                          : 'border-surface-light text-dim-white/30',
                      };

                      return (
                        <button
                          key={status}
                          onClick={() => handleStatusChange(round.id, status)}
                          disabled={isUpdating}
                          className={`
                            flex-1 py-2 border rounded-sm font-heading text-[8px] uppercase
                            retro-press transition-colors disabled:opacity-50
                            ${statusColors[status]}
                          `}
                        >
                          {status}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </RetroCard>
      </div>
    </div>
  );
}
