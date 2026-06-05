import { useCallback, useEffect, useState } from "react";
import { getStats, getRsvps, ApiError, type Stats, type Rsvp } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

interface DashboardData {
  stats: Stats | null;
  rsvps: Rsvp[];
  loading: boolean;
  error: string | null;
  reload: () => void;
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

  return { stats, rsvps, loading, error, reload };
}
