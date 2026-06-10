import { useEffect, useState, type FormEvent } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import type { Room, RoomInput } from "@/lib/api";
import { ApiError } from "@/lib/api";
import {
  ROOM_CATEGORIES,
  ROOM_FLOORS,
  ROOM_SIDES,
  ROOM_BATHROOMS,
  ROOM_FLOORINGS,
} from "@/config/rooms";
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

interface RoomDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  room: Room | null; // null = création
  onSubmit: (input: RoomInput) => Promise<void>;
}

const EMPTY = {
  number: "",
  floor: ROOM_FLOORS[2] as string,
  category: ROOM_CATEGORIES[0] as string,
  side: ROOM_SIDES[0] as string,
  adults: "2 adultes",
  children: "",
  bathroom: ROOM_BATHROOMS[0] as string,
  bed: "grand lit",
  dispos: "",
  flooring: ROOM_FLOORINGS[0] as string,
  airConditioning: false,
  balcony: false,
  pmr: false,
  notes: "",
};

// Sélecteur avec option « Autre… » qui bascule sur une saisie libre.
function SelectOrText({
  id,
  value,
  options,
  onChange,
  placeholder,
}: {
  id: string;
  value: string;
  options: readonly string[];
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  const inList = options.includes(value);
  const [free, setFree] = useState(!inList && value !== "");
  useEffect(() => {
    setFree(!options.includes(value) && value !== "");
  }, [value, options]);

  if (free) {
    return (
      <div className="flex gap-2">
        <Input
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => {
            setFree(false);
            onChange(options[0]);
          }}
        >
          Liste
        </Button>
      </div>
    );
  }
  return (
    <NativeSelect
      id={id}
      value={inList ? value : ""}
      onChange={(e) => {
        if (e.target.value === "__other__") {
          setFree(true);
          onChange("");
        } else {
          onChange(e.target.value);
        }
      }}
    >
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
      <option value="__other__">Autre…</option>
    </NativeSelect>
  );
}

function YesNo({
  id,
  value,
  onChange,
}: {
  id: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <NativeSelect
      id={id}
      value={value ? "oui" : "non"}
      onChange={(e) => onChange(e.target.value === "oui")}
    >
      <option value="oui">Oui</option>
      <option value="non">Non</option>
    </NativeSelect>
  );
}

export function RoomDialog({
  open,
  onOpenChange,
  room,
  onSubmit,
}: RoomDialogProps) {
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (room) {
      setForm({
        number: room.number,
        floor: room.floor ?? "",
        category: room.category ?? "",
        side: room.side ?? "",
        adults: room.adults ?? "",
        children: room.children ?? "",
        bathroom: room.bathroom ?? "",
        bed: room.bed ?? "",
        dispos: room.dispos ?? "",
        flooring: room.flooring ?? "",
        airConditioning: room.airConditioning,
        balcony: room.balcony,
        pmr: room.pmr,
        notes: room.notes ?? "",
      });
    } else {
      setForm(EMPTY);
    }
  }, [open, room]);

  const set =
    <K extends keyof typeof form>(key: K) =>
    (value: (typeof form)[K]) =>
      setForm((f) => ({ ...f, [key]: value }));

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!form.number.trim()) {
      toast.error("Le numéro de chambre est requis.");
      return;
    }
    setSaving(true);
    const toNull = (v: string) => (v.trim() ? v.trim() : null);
    const input: RoomInput = {
      number: form.number.trim(),
      floor: toNull(form.floor),
      category: toNull(form.category),
      side: toNull(form.side),
      adults: toNull(form.adults),
      children: toNull(form.children),
      bathroom: toNull(form.bathroom),
      bed: toNull(form.bed),
      dispos: toNull(form.dispos),
      flooring: toNull(form.flooring),
      airConditioning: form.airConditioning,
      balcony: form.balcony,
      pmr: form.pmr,
      notes: toNull(form.notes),
    };
    try {
      await onSubmit(input);
      toast.success(room ? "Chambre mise à jour." : "Chambre ajoutée.");
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
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl">
            {room ? `Modifier la chambre ${room.number}` : "Nouvelle chambre"}
          </DialogTitle>
          <DialogDescription>
            Plan d'hébergement de l'hôtel.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="r-number">Numéro *</Label>
              <Input
                id="r-number"
                value={form.number}
                onChange={(e) => set("number")(e.target.value)}
                placeholder="Ex. 101"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="r-floor">Étage</Label>
              <SelectOrText
                id="r-floor"
                value={form.floor}
                options={ROOM_FLOORS}
                onChange={set("floor")}
                placeholder="Ex. rez de chaussée"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="r-category">Catégorie</Label>
              <SelectOrText
                id="r-category"
                value={form.category}
                options={ROOM_CATEGORIES}
                onChange={set("category")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="r-side">Côté / exposition</Label>
              <SelectOrText
                id="r-side"
                value={form.side}
                options={ROOM_SIDES}
                onChange={set("side")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="r-adults">Adultes</Label>
              <Input
                id="r-adults"
                value={form.adults}
                onChange={(e) => set("adults")(e.target.value)}
                placeholder="Ex. 2 adultes"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="r-children">Enfants</Label>
              <Input
                id="r-children"
                value={form.children}
                onChange={(e) => set("children")(e.target.value)}
                placeholder="Ex. 2 enfants"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="r-bathroom">Salle de bain</Label>
              <SelectOrText
                id="r-bathroom"
                value={form.bathroom}
                options={ROOM_BATHROOMS}
                onChange={set("bathroom")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="r-bed">Couchage</Label>
              <Input
                id="r-bed"
                value={form.bed}
                onChange={(e) => set("bed")(e.target.value)}
                placeholder="Ex. grand lit"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="r-flooring">Sol</Label>
              <SelectOrText
                id="r-flooring"
                value={form.flooring}
                options={ROOM_FLOORINGS}
                onChange={set("flooring")}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="r-clim">Climatisation</Label>
              <YesNo
                id="r-clim"
                value={form.airConditioning}
                onChange={set("airConditioning")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="r-balcony">Balcon</Label>
              <YesNo id="r-balcony" value={form.balcony} onChange={set("balcony")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="r-pmr">Accessible PMR</Label>
              <YesNo id="r-pmr" value={form.pmr} onChange={set("pmr")} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="r-dispos">Dispositions</Label>
            <Input
              id="r-dispos"
              value={form.dispos}
              onChange={(e) => set("dispos")(e.target.value)}
              placeholder="Ex. lit supp possible, canapé lit double…"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="r-notes">Notes</Label>
            <Textarea
              id="r-notes"
              value={form.notes}
              onChange={(e) => set("notes")(e.target.value)}
              placeholder="Informations complémentaires…"
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
              {room ? "Enregistrer" : "Ajouter"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
