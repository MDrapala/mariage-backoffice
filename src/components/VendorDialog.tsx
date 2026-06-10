import { useEffect, useState, type FormEvent } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import type { Vendor, VendorInput } from "@/lib/api";
import { ApiError } from "@/lib/api";
import { VENDOR_CATEGORIES } from "@/config/vendors";
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

interface VendorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vendor: Vendor | null; // null = création
  onSubmit: (input: VendorInput) => Promise<void>;
}

const EMPTY = {
  category: VENDOR_CATEGORIES[0] as string,
  name: "",
  contactName: "",
  phone: "",
  email: "",
  address: "",
  website: "",
  notes: "",
};

export function VendorDialog({
  open,
  onOpenChange,
  vendor,
  onSubmit,
}: VendorDialogProps) {
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (vendor) {
      setForm({
        category: vendor.category,
        name: vendor.name,
        contactName: vendor.contactName ?? "",
        phone: vendor.phone ?? "",
        email: vendor.email ?? "",
        address: vendor.address ?? "",
        website: vendor.website ?? "",
        notes: vendor.notes ?? "",
      });
    } else {
      setForm(EMPTY);
    }
  }, [open, vendor]);

  const set = (key: keyof typeof form) => (value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error("Le nom du prestataire est requis.");
      return;
    }
    setSaving(true);
    const toNull = (v: string) => (v.trim() ? v.trim() : null);
    const input: VendorInput = {
      category: form.category,
      name: form.name.trim(),
      contactName: toNull(form.contactName),
      phone: toNull(form.phone),
      email: toNull(form.email),
      address: toNull(form.address),
      website: toNull(form.website),
      notes: toNull(form.notes),
    };
    try {
      await onSubmit(input);
      toast.success(vendor ? "Prestataire mis à jour." : "Prestataire ajouté.");
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
            {vendor ? "Modifier le prestataire" : "Nouveau prestataire"}
          </DialogTitle>
          <DialogDescription>
            Carnet d'adresses partagé avec les témoins.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="v-category">Catégorie</Label>
              <NativeSelect
                id="v-category"
                value={form.category}
                onChange={(e) => set("category")(e.target.value)}
              >
                {VENDOR_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </NativeSelect>
            </div>
            <div className="space-y-2">
              <Label htmlFor="v-name">Nom *</Label>
              <Input
                id="v-name"
                value={form.name}
                onChange={(e) => set("name")(e.target.value)}
                placeholder="Ex. Traiteur Belle Assiette"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="v-contact">Personne à contacter</Label>
              <Input
                id="v-contact"
                value={form.contactName}
                onChange={(e) => set("contactName")(e.target.value)}
                placeholder="Ex. Julie Martin"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="v-phone">Téléphone</Label>
              <Input
                id="v-phone"
                value={form.phone}
                onChange={(e) => set("phone")(e.target.value)}
                placeholder="06 12 34 56 78"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="v-email">Email</Label>
              <Input
                id="v-email"
                type="email"
                value={form.email}
                onChange={(e) => set("email")(e.target.value)}
                placeholder="contact@prestataire.fr"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="v-website">Site web</Label>
              <Input
                id="v-website"
                value={form.website}
                onChange={(e) => set("website")(e.target.value)}
                placeholder="https://…"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="v-address">Adresse</Label>
            <Input
              id="v-address"
              value={form.address}
              onChange={(e) => set("address")(e.target.value)}
              placeholder="12 rue des Lilas, 68000 Colmar"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="v-notes">Notes (pour les témoins)</Label>
            <Textarea
              id="v-notes"
              value={form.notes}
              onChange={(e) => set("notes")(e.target.value)}
              placeholder="Horaires, acompte versé, choses à vérifier le jour J…"
              className="min-h-24"
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
              {vendor ? "Enregistrer" : "Ajouter"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
