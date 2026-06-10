import { useCallback, useEffect, useState } from "react";
import {
  getVendors,
  createVendor as apiCreate,
  updateVendor as apiUpdate,
  deleteVendor as apiDelete,
  ApiError,
  type Vendor,
  type VendorInput,
} from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

interface UseVendors {
  vendors: Vendor[];
  loading: boolean;
  error: string | null;
  reload: () => void;
  create: (input: VendorInput) => Promise<void>;
  update: (id: string, input: VendorInput) => Promise<void>;
  remove: (id: string) => Promise<void>;
}

export function useVendors(): UseVendors {
  const { logout } = useAuth();
  const [vendors, setVendors] = useState<Vendor[]>([]);
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
    getVendors()
      .then((v) => {
        if (!cancelled) setVendors(v);
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

  const create = useCallback(async (input: VendorInput) => {
    const created = await apiCreate(input);
    setVendors((prev) => [...prev, created]);
  }, []);

  const update = useCallback(async (id: string, input: VendorInput) => {
    const updated = await apiUpdate(id, input);
    setVendors((prev) => prev.map((v) => (v.id === id ? updated : v)));
  }, []);

  const remove = useCallback(async (id: string) => {
    await apiDelete(id);
    setVendors((prev) => prev.filter((v) => v.id !== id));
  }, []);

  return { vendors, loading, error, reload, create, update, remove };
}
