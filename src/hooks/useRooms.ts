import { useCallback, useEffect, useState } from "react";
import {
  getRooms,
  createRoom as apiCreate,
  updateRoom as apiUpdate,
  deleteRoom as apiDelete,
  ApiError,
  type Room,
  type RoomInput,
} from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

interface UseRooms {
  rooms: Room[];
  loading: boolean;
  error: string | null;
  reload: () => void;
  create: (input: RoomInput) => Promise<void>;
  update: (id: string, input: RoomInput) => Promise<void>;
  remove: (id: string) => Promise<void>;
}

export function useRooms(): UseRooms {
  const { logout } = useAuth();
  const [rooms, setRooms] = useState<Room[]>([]);
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
    getRooms()
      .then((r) => {
        if (!cancelled) setRooms(r);
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

  const create = useCallback(async (input: RoomInput) => {
    const created = await apiCreate(input);
    setRooms((prev) => [...prev, created]);
  }, []);

  const update = useCallback(async (id: string, input: RoomInput) => {
    const updated = await apiUpdate(id, input);
    setRooms((prev) => prev.map((r) => (r.id === id ? updated : r)));
  }, []);

  const remove = useCallback(async (id: string) => {
    await apiDelete(id);
    setRooms((prev) => prev.filter((r) => r.id !== id));
  }, []);

  return { rooms, loading, error, reload, create, update, remove };
}
