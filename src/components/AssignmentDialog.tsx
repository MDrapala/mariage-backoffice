import { useEffect, useState, type FormEvent } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import type {
  Room,
  Rsvp,
  RoomAssignment,
  RoomAssignmentInput,
} from "@/lib/api";
import { ApiError } from "@/lib/api";
import { ASSIGNMENT_STATUSES } from "@/config/rooms";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { NativeSelect } from "@/components/ui/native-select";

interface AssignmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  assignment: RoomAssignment | null; // null = création
  rooms: Room[];
  rsvps: Rsvp[];
  onSubmit: (input: RoomAssignmentInput) => Promise<void>;
}

export function rsvpLabel(rsvp: {
  id: string;
  persons: { prenom: string; nom: string }[];
}): string {
  const names = rsvp.persons.map((p) => `${p.prenom} ${p.nom}`).join(", ");
  return names || `Foyer ${rsvp.id.slice(0, 6)}`;
}

const EMPTY = {
  roomId: "",
  rsvpId: "",
  occupants: [] as string[],
  arrival: "",
  departure: "",
  status: ASSIGNMENT_STATUSES[0] as string,
  notes: "",
};

export function AssignmentDialog({
  open,
  onOpenChange,
  assignment,
  rooms,
  rsvps,
  onSubmit,
}: AssignmentDialogProps) {
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (assignment) {
      setForm({
        roomId: assignment.roomId,
        rsvpId: assignment.rsvpId,
        occupants: assignment.occupantIds ?? [],
        arrival: assignment.arrival ?? "",
        departure: assignment.departure ?? "",
        status: assignment.status ?? ASSIGNMENT_STATUSES[0],
        notes: assignment.notes ?? "",
      });
    } else {
      const firstRsvp = rsvps[0];
      setForm({
        ...EMPTY,
        roomId: rooms[0]?.id ?? "",
        rsvpId: firstRsvp?.id ?? "",
        // par défaut, tous les membres du foyer occupent la chambre
        occupants: firstRsvp?.persons.map((p) => p.id) ?? [],
      });
    }
  }, [open, assignment, rooms, rsvps]);

  const set = (key: keyof typeof form) => (value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  // Changement de foyer : on présélectionne tous ses membres comme occupants.
  const onRsvpChange = (rsvpId: string) => {
    const next = rsvps.find((r) => r.id === rsvpId);
    setForm((f) => ({
      ...f,
      rsvpId,
      occupants: next?.persons.map((p) => p.id) ?? [],
    }));
  };

  const toggleOccupant = (personId: string) => {
    setForm((f) => ({
      ...f,
      occupants: f.occupants.includes(personId)
        ? f.occupants.filter((id) => id !== personId)
        : [...f.occupants, personId],
    }));
  };

  const selectedRsvp = rsvps.find((r) => r.id === form.rsvpId);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!form.roomId || !form.rsvpId) {
      toast.error("Sélectionnez une chambre et un foyer.");
      return;
    }
    setSaving(true);
    const toNull = (v: string) => (v.trim() ? v.trim() : null);
    const input: RoomAssignmentInput = {
      roomId: form.roomId,
      rsvpId: form.rsvpId,
      occupants: form.occupants,
      arrival: toNull(form.arrival),
      departure: toNull(form.departure),
      status: form.status,
      notes: toNull(form.notes),
    };
    try {
      await onSubmit(input);
      toast.success(assignment ? "Attribution mise à jour." : "Chambre attribuée.");
      onOpenChange(false);
    } catch (err) {
      toast.error(
        err instanceof ApiError ? err.message : "Enregistrement impossible.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl">
            {assignment ? "Modifier l'attribution" : "Attribuer une chambre"}
          </DialogTitle>
          <DialogDescription>
            Associez une chambre à un foyer d'invités inscrits.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="a-room">Chambre *</Label>
            <NativeSelect
              id="a-room"
              value={form.roomId}
              onChange={(e) => set("roomId")(e.target.value)}
            >
              <option value="" disabled>
                Sélectionner une chambre
              </option>
              {rooms.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.number}
                  {r.category ? ` — ${r.category}` : ""}
                  {r.bed ? ` (${r.bed})` : ""}
                </option>
              ))}
            </NativeSelect>
          </div>

          <div className="space-y-2">
            <Label htmlFor="a-rsvp">Foyer invités *</Label>
            <NativeSelect
              id="a-rsvp"
              value={form.rsvpId}
              onChange={(e) => onRsvpChange(e.target.value)}
            >
              <option value="" disabled>
                Sélectionner un foyer
              </option>
              {rsvps.map((r) => (
                <option key={r.id} value={r.id}>
                  {rsvpLabel(r)}
                </option>
              ))}
            </NativeSelect>
          </div>

          {selectedRsvp && (
            <div className="space-y-2">
              <Label>Occupants de la chambre</Label>
              <div className="space-y-1.5 rounded-md border p-3">
                {selectedRsvp.persons.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Aucune personne dans ce foyer.
                  </p>
                ) : (
                  selectedRsvp.persons.map((p) => (
                    <label
                      key={p.id}
                      className="flex cursor-pointer items-center gap-2 text-sm"
                    >
                      <input
                        type="checkbox"
                        className="size-4 accent-primary"
                        checked={form.occupants.includes(p.id)}
                        onChange={() => toggleOccupant(p.id)}
                      />
                      <span>
                        {p.prenom} {p.nom}
                        {p.isChild && (
                          <span className="text-muted-foreground"> (enfant)</span>
                        )}
                      </span>
                    </label>
                  ))
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {form.occupants.length} occupant(s) sélectionné(s).
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="a-arrival">Arrivée</Label>
              <Input
                id="a-arrival"
                type="date"
                value={form.arrival}
                onChange={(e) => set("arrival")(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="a-departure">Départ</Label>
              <Input
                id="a-departure"
                type="date"
                value={form.departure}
                onChange={(e) => set("departure")(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="a-status">Statut</Label>
            <NativeSelect
              id="a-status"
              value={form.status}
              onChange={(e) => set("status")(e.target.value)}
            >
              {ASSIGNMENT_STATUSES.map((s) => (
                <option key={s} value={s} className="capitalize">
                  {s}
                </option>
              ))}
            </NativeSelect>
          </div>

          <div className="space-y-2">
            <Label htmlFor="a-notes">Informations complémentaires</Label>
            <Textarea
              id="a-notes"
              value={form.notes}
              onChange={(e) => set("notes")(e.target.value)}
              placeholder="Lit bébé, demande particulière, accompagnants…"
              className="min-h-20"
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={saving}>
              {saving && <Loader2 className="size-4 animate-spin" />}
              {assignment ? "Enregistrer" : "Attribuer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
