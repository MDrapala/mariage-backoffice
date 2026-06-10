import { useEffect, useState, type FormEvent } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import type { Invitee, InviteeInput, InviteeCategory } from "@/lib/api";
import { ApiError } from "@/lib/api";
import { INVITEE_CATEGORY_LABELS } from "@/config/invitees";
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

interface InviteeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invitee: Invitee | null; // null = création
  onSubmit: (input: InviteeInput) => Promise<void>;
}

const CATEGORIES: InviteeCategory[] = ["adulte", "enfant", "bebe"];

const EMPTY = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  household: "",
  category: "adulte" as InviteeCategory,
  notes: "",
};

export function InviteeDialog({
  open,
  onOpenChange,
  invitee,
  onSubmit,
}: InviteeDialogProps) {
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (invitee) {
      setForm({
        firstName: invitee.firstName,
        lastName: invitee.lastName,
        email: invitee.email ?? "",
        phone: invitee.phone ?? "",
        household: invitee.household ?? "",
        category: invitee.category,
        notes: invitee.notes ?? "",
      });
    } else {
      setForm(EMPTY);
    }
  }, [open, invitee]);

  const set =
    <K extends keyof typeof form>(key: K) =>
    (value: (typeof form)[K]) =>
      setForm((f) => ({ ...f, [key]: value }));

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!form.firstName.trim() || !form.lastName.trim()) {
      toast.error("Prénom et nom sont requis.");
      return;
    }
    setSaving(true);
    const toNull = (v: string) => (v.trim() ? v.trim() : null);
    const input: InviteeInput = {
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      email: toNull(form.email),
      phone: toNull(form.phone),
      household: toNull(form.household),
      category: form.category,
      notes: toNull(form.notes),
    };
    try {
      await onSubmit(input);
      toast.success(invitee ? "Invité mis à jour." : "Invité ajouté.");
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
            {invitee ? "Modifier l'invité" : "Nouvel invité"}
          </DialogTitle>
          <DialogDescription>
            Liste maîtresse — le suivi RSVP rapproche les noms automatiquement.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="i-first">Prénom *</Label>
              <Input
                id="i-first"
                value={form.firstName}
                onChange={(e) => set("firstName")(e.target.value)}
                placeholder="Ex. Marie"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="i-last">Nom *</Label>
              <Input
                id="i-last"
                value={form.lastName}
                onChange={(e) => set("lastName")(e.target.value)}
                placeholder="Ex. Dupont"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="i-email">Email</Label>
              <Input
                id="i-email"
                type="email"
                value={form.email}
                onChange={(e) => set("email")(e.target.value)}
                placeholder="marie@exemple.fr"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="i-phone">Téléphone</Label>
              <Input
                id="i-phone"
                value={form.phone}
                onChange={(e) => set("phone")(e.target.value)}
                placeholder="06 12 34 56 78"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="i-household">Foyer / groupe</Label>
              <Input
                id="i-household"
                value={form.household}
                onChange={(e) => set("household")(e.target.value)}
                placeholder="Ex. Famille Dupont"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="i-category">Catégorie</Label>
              <NativeSelect
                id="i-category"
                value={form.category}
                onChange={(e) =>
                  set("category")(e.target.value as InviteeCategory)
                }
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {INVITEE_CATEGORY_LABELS[c]}
                  </option>
                ))}
              </NativeSelect>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="i-notes">Notes</Label>
            <Textarea
              id="i-notes"
              value={form.notes}
              onChange={(e) => set("notes")(e.target.value)}
              placeholder="Infos utiles (lien de parenté, relance déjà faite…)"
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
              {invitee ? "Enregistrer" : "Ajouter"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
