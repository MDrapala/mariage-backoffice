import { useCallback, useEffect, useState } from "react";
import {
  getStats,
  getRsvps,
  deleteRsvp,
  deleteRsvpPerson,
  ApiError,
  type Stats,
  type Rsvp,
} from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

interface DashboardData {
  stats: Stats | null;
  rsvps: Rsvp[];
  loading: boolean;
  error: string | null;
  reload: () => void;
  removeRsvp: (id: string) => Promise<void>;
  removePerson: (rsvpId: string, personId: string) => Promise<void>;
}

export function useDashboardData(): DashboardData {
  const { logout } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [rsvps, setRsvps] = useState<Rsvp[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  const reload = useCallback(() => setTick((t) => t + 1), []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    Promise.all([getStats(), getRsvps()])
      .then(([s, r]) => {
        if (cancelled) return;
        setStats(s);
        setRsvps(r);
      })
      .catch((err) => {
        if (cancelled) return;
        if (err instanceof ApiError && (err.status === 401 || err.status === 403)) {
          logout();
          return;
        }
        setError(
          err instanceof ApiError ? err.message : "Erreur de chargement.",
        );
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [tick, logout]);

  const removeRsvp = useCallback(async (id: string) => {
    await deleteRsvp(id);
    setRsvps((prev) => prev.filter((r) => r.id !== id));
  }, []);

  // Retire un convive ; le foyer disparaît s'il n'en reste plus (comme côté API).
  const removePerson = useCallback(async (rsvpId: string, personId: string) => {
    await deleteRsvpPerson(rsvpId, personId);
    setRsvps((prev) =>
      prev.flatMap((r) => {
        if (r.id !== rsvpId) return [r];
        const persons = r.persons.filter((p) => p.id !== personId);
        if (persons.length === 0) return [];
        const childCount = persons.filter((p) => p.isChild).length;
        return [
          {
            ...r,
            persons,
            guestCount: persons.length,
            adultCount: persons.length - childCount,
            childCount,
          },
        ];
      }),
    );
  }, []);

  return { stats, rsvps, loading, error, reload, removeRsvp, removePerson };
}
