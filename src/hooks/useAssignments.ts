import { useCallback, useEffect, useState } from "react";
import {
  getAssignments,
  createAssignment as apiCreate,
  updateAssignment as apiUpdate,
  deleteAssignment as apiDelete,
  ApiError,
  type RoomAssignment,
  type RoomAssignmentInput,
} from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

interface UseAssignments {
  assignments: RoomAssignment[];
  loading: boolean;
  error: string | null;
  reload: () => void;
  create: (input: RoomAssignmentInput) => Promise<void>;
  update: (id: string, input: RoomAssignmentInput) => Promise<void>;
  remove: (id: string) => Promise<void>;
}

export function useAssignments(): UseAssignments {
  const { logout } = useAuth();
  const [assignments, setAssignments] = useState<RoomAssignment[]>([]);
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
    getAssignments()
      .then((a) => {
        if (!cancelled) setAssignments(a);
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

  const create = useCallback(async (input: RoomAssignmentInput) => {
    const created = await apiCreate(input);
    setAssignments((prev) => [created, ...prev]);
  }, []);

  const update = useCallback(
    async (id: string, input: RoomAssignmentInput) => {
      const updated = await apiUpdate(id, input);
      setAssignments((prev) => prev.map((a) => (a.id === id ? updated : a)));
    },
    [],
  );

  const remove = useCallback(async (id: string) => {
    await apiDelete(id);
    setAssignments((prev) => prev.filter((a) => a.id !== id));
  }, []);

  return { assignments, loading, error, reload, create, update, remove };
}
