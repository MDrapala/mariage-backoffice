const API_BASE = import.meta.env.VITE_API_URL ?? "";

const TOKEN_KEY = "bo_admin_token";

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}
export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}
export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...((options.headers as Record<string, string>) ?? {}),
  };

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new ApiError(
      (body as { message?: string }).message ?? `HTTP ${res.status}`,
      res.status,
    );
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

// ── Auth ────────────────────────────────────────────────────────────────────

export interface AdminLoginResponse {
  token: string;
  username: string;
}

export function adminLogin(
  username: string,
  password: string,
): Promise<AdminLoginResponse> {
  return request<AdminLoginResponse>("/api/admin/login", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
}

// ── Stats ─────────────────────────────────────────────────────────────────

export interface Stats {
  totalSubmissions: number;
  totalGuests: number;
  totalAdults: number;
  totalChildren: number;
  submissionsWithAllergies: number;
  avgGuestsPerSubmission: number;
  lastSubmissionAt: string | null;
  submissionsPerDay: { day: string; count: number }[];
  allergies: string[];
}

export function getStats(): Promise<Stats> {
  return request<Stats>("/api/admin/stats");
}

// ── RSVPs ───────────────────────────────────────────────────────────────────

export interface RsvpPerson {
  id: string;
  prenom: string;
  nom: string;
  isChild: boolean;
}

export interface Rsvp {
  id: string;
  allergies: string | null;
  createdAt: string;
  persons: RsvpPerson[];
  guestCount: number;
  adultCount: number;
  childCount: number;
}

export function getRsvps(): Promise<Rsvp[]> {
  return request<Rsvp[]>("/api/admin/rsvps");
}
