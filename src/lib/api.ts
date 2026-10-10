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

export type UserRole = "admin" | "temoin";

export interface AdminLoginResponse {
  token: string;
  username: string;
  role: UserRole;
  displayName: string | null;
  side: "marie" | "mariee" | null;
  mustChangePassword: boolean;
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

export function changePassword(newPassword: string): Promise<{ ok: boolean }> {
  return request<{ ok: boolean }>("/api/admin/change-password", {
    method: "POST",
    body: JSON.stringify({ newPassword }),
  });
}

// ── Stats ─────────────────────────────────────────────────────────────────

export interface DeviceBreakdown {
  mobile: number;
  tablet: number;
  desktop: number;
  inconnu: number;
}

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
  deviceBreakdown: DeviceBreakdown;
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
  device: string | null;
  createdAt: string;
  persons: RsvpPerson[];
  guestCount: number;
  adultCount: number;
  childCount: number;
}

export function getRsvps(): Promise<Rsvp[]> {
  return request<Rsvp[]>("/api/admin/rsvps");
}

export function deleteRsvp(id: string): Promise<void> {
  return request<void>(`/api/admin/rsvps/${id}`, { method: "DELETE" });
}

export function deleteRsvpPerson(rsvpId: string, personId: string): Promise<void> {
  return request<void>(`/api/admin/rsvps/${rsvpId}/persons/${personId}`, {
    method: "DELETE",
  });
}

// ── Prestataires (carnet d'adresses des témoins) ─────────────────────────────

export interface Vendor {
  id: string;
  category: string;
  name: string;
  contactName: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  website: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export type VendorInput = Omit<Vendor, "id" | "createdAt" | "updatedAt">;

export function getVendors(): Promise<Vendor[]> {
  return request<Vendor[]>("/api/vendors");
}

export function createVendor(input: VendorInput): Promise<Vendor> {
  return request<Vendor>("/api/vendors", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function updateVendor(
  id: string,
  input: VendorInput,
): Promise<Vendor> {
  return request<Vendor>(`/api/vendors/${id}`, {
    method: "PUT",
    body: JSON.stringify(input),
  });
}

export function deleteVendor(id: string): Promise<void> {
  return request<void>(`/api/vendors/${id}`, { method: "DELETE" });
}

// ── Chambres (plan d'hébergement) ────────────────────────────────────────────

export interface Room {
  id: string;
  number: string;
  floor: string | null;
  category: string | null;
  side: string | null;
  adults: string | null;
  children: string | null;
  bathroom: string | null;
  bed: string | null;
  dispos: string | null;
  flooring: string | null;
  airConditioning: boolean;
  balcony: boolean;
  pmr: boolean;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export type RoomInput = Omit<Room, "id" | "createdAt" | "updatedAt">;

export function getRooms(): Promise<Room[]> {
  return request<Room[]>("/api/rooms");
}

export function createRoom(input: RoomInput): Promise<Room> {
  return request<Room>("/api/rooms", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function updateRoom(id: string, input: RoomInput): Promise<Room> {
  return request<Room>(`/api/rooms/${id}`, {
    method: "PUT",
    body: JSON.stringify(input),
  });
}

export function deleteRoom(id: string): Promise<void> {
  return request<void>(`/api/rooms/${id}`, { method: "DELETE" });
}

// ── Attributions de chambres ─────────────────────────────────────────────────

export interface AssignmentRsvp {
  id: string;
  allergies: string | null;
  persons: RsvpPerson[];
  guestCount: number;
}

export interface RoomAssignment {
  id: string;
  roomId: string;
  rsvpId: string;
  occupantIds: string[];
  occupants: RsvpPerson[];
  arrival: string | null;
  departure: string | null;
  status: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  room: Room | null;
  rsvp: AssignmentRsvp | null;
}

export interface RoomAssignmentInput {
  roomId: string;
  rsvpId: string;
  occupants: string[];
  arrival: string | null;
  departure: string | null;
  status: string;
  notes: string | null;
}

export function getAssignments(): Promise<RoomAssignment[]> {
  return request<RoomAssignment[]>("/api/rooms/assignments");
}

export function createAssignment(
  input: RoomAssignmentInput,
): Promise<RoomAssignment> {
  return request<RoomAssignment>("/api/rooms/assignments", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function updateAssignment(
  id: string,
  input: RoomAssignmentInput,
): Promise<RoomAssignment> {
  return request<RoomAssignment>(`/api/rooms/assignments/${id}`, {
    method: "PUT",
    body: JSON.stringify(input),
  });
}

export function deleteAssignment(id: string): Promise<void> {
  return request<void>(`/api/rooms/assignments/${id}`, { method: "DELETE" });
}

// ── Liste maîtresse des invités + suivi RSVP ─────────────────────────────────

export type InviteeCategory = "adulte" | "enfant" | "bebe";

export interface Invitee {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  household: string | null;
  category: InviteeCategory;
  notes: string | null;
  responded: boolean;
  /** Réponse RSVP : true = vient, false = ne vient pas, null = en attente. */
  attending: boolean | null;
  createdAt: string;
  updatedAt: string;
}

export type InviteeInput = Omit<
  Invitee,
  "id" | "responded" | "attending" | "createdAt" | "updatedAt"
>;

export interface InviteeStats {
  total: number;
  responded: number;
  attending: number;
  declined: number;
  missing: number;
  responseRate: number;
}

export function getInvitees(): Promise<Invitee[]> {
  return request<Invitee[]>("/api/invitees");
}

export function getInviteeStats(): Promise<InviteeStats> {
  return request<InviteeStats>("/api/invitees/stats");
}

export function createInvitee(input: InviteeInput): Promise<Invitee> {
  return request<Invitee>("/api/invitees", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function updateInvitee(
  id: string,
  input: InviteeInput,
): Promise<Invitee> {
  return request<Invitee>(`/api/invitees/${id}`, {
    method: "PUT",
    body: JSON.stringify(input),
  });
}

export function deleteInvitee(id: string): Promise<void> {
  return request<void>(`/api/invitees/${id}`, { method: "DELETE" });
}
