import { useCallback, useEffect, useState } from "react";
import {
  getInvitees,
  getInviteeStats,
  createInvitee as apiCreate,
  updateInvitee as apiUpdate,
  deleteInvitee as apiDelete,
  ApiError,
  type Invitee,
  type InviteeInput,
  type InviteeStats,
} from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

interface UseInvitees {
  invitees: Invitee[];
  stats: InviteeStats | null;
  loading: boolean;
  error: string | null;
  reload: () => void;
  create: (input: InviteeInput) => Promise<void>;
  update: (id: string, input: InviteeInput) => Promise<void>;
  remove: (id: string) => Promise<void>;
}

// `responded` et les stats sont recalculés côté serveur (rapprochement par nom) :
// on recharge la liste après chaque mutation.
export function useInvitees(): UseInvitees {
  const { logout } = useAuth();
  const [invitees, setInvitees] = useState<Invitee[]>([]);
  const [stats, setStats] = useState<InviteeStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  const reload = useCallback(() => setTick((t) => t + 1), []);

  const handleAuth = useCallback(
    (err: unknown) => {
      if (err instanceof ApiError && (err.status === 401 || err.status === 403)) {
        logout();
        return true;
      }
      return false;
    },
    [logout],
  );

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    Promise.all([getInvitees(), getInviteeStats()])
      .then(([list, s]) => {
        if (cancelled) return;
        setInvitees(list);
        setStats(s);
      })
      .catch((err) => {
        if (cancelled) return;
        if (handleAuth(err)) return;
        setError(err instanceof ApiError ? err.message : "Erreur de chargement.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [tick, handleAuth]);

  const create = useCallback(
    async (input: InviteeInput) => {
      await apiCreate(input);
      reload();
    },
    [reload],
  );

  const update = useCallback(
    async (id: string, input: InviteeInput) => {
      await apiUpdate(id, input);
      reload();
    },
    [reload],
  );

  const remove = useCallback(
    async (id: string) => {
      await apiDelete(id);
      reload();
    },
    [reload],
  );

  return { invitees, stats, loading, error, reload, create, update, remove };
}
