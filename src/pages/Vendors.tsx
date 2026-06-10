import { useMemo, useState } from "react";
import {
  Plus,
  Search,
  Phone,
  Mail,
  MapPin,
  Globe,
  Pencil,
  Trash2,
  RefreshCw,
  User,
  NotebookPen,
  Inbox,
} from "lucide-react";

import { useVendors } from "@/hooks/useVendors";
import type { Vendor, VendorInput } from "@/lib/api";
import { categoryIcon } from "@/config/vendors";
import { VendorDialog } from "@/components/VendorDialog";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

function mapsUrl(q: string) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;
}

function ContactLine({
  icon: Icon,
  children,
  href,
}: {
  icon: typeof Phone;
  children: React.ReactNode;
  href?: string;
}) {
  const content = (
    <span className="flex items-center gap-2 text-sm text-muted-foreground">
      <Icon className="size-3.5 shrink-0 text-primary/70" />
      <span className="truncate">{children}</span>
    </span>
  );
  return href ? (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="block truncate hover:text-primary hover:underline"
    >
      {content}
    </a>
  ) : (
    content
  );
}

function VendorCard({
  vendor,
  onEdit,
  onDelete,
}: {
  vendor: Vendor;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <Card className="gap-0 py-0">
      <CardContent className="flex flex-col gap-3 p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate font-serif text-lg font-semibold leading-tight">
              {vendor.name}
            </p>
            {vendor.contactName && (
              <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <User className="size-3.5" /> {vendor.contactName}
              </p>
            )}
          </div>
          <div className="flex shrink-0 gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="size-8"
              onClick={onEdit}
              title="Modifier"
            >
              <Pencil className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="size-8 text-destructive hover:text-destructive"
              onClick={onDelete}
              title="Supprimer"
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        </div>

        <div className="space-y-1.5">
          {vendor.phone && (
            <ContactLine icon={Phone} href={`tel:${vendor.phone.replace(/\s/g, "")}`}>
              {vendor.phone}
            </ContactLine>
          )}
          {vendor.email && (
            <ContactLine icon={Mail} href={`mailto:${vendor.email}`}>
              {vendor.email}
            </ContactLine>
          )}
          {vendor.address && (
            <ContactLine icon={MapPin} href={mapsUrl(vendor.address)}>
              {vendor.address}
            </ContactLine>
          )}
          {vendor.website && (
            <ContactLine
              icon={Globe}
              href={
                vendor.website.startsWith("http")
                  ? vendor.website
                  : `https://${vendor.website}`
              }
            >
              {vendor.website.replace(/^https?:\/\//, "")}
            </ContactLine>
          )}
        </div>

        {vendor.notes && (
          <div className="flex gap-2 rounded-md bg-muted/60 p-2.5 text-sm text-foreground/80">
            <NotebookPen className="mt-0.5 size-3.5 shrink-0 text-primary/70" />
            <p className="whitespace-pre-wrap">{vendor.notes}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function Vendors() {
  const { vendors, loading, error, reload, create, update, remove } =
    useVendors();
  const [query, setQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Vendor | null>(null);
  const [toDelete, setToDelete] = useState<Vendor | null>(null);
  const [deleting, setDeleting] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return vendors;
    return vendors.filter((v) =>
      [v.name, v.category, v.contactName, v.notes, v.address]
        .filter(Boolean)
        .some((f) => (f as string).toLowerCase().includes(q)),
    );
  }, [vendors, query]);

  const grouped = useMemo(() => {
    const map = new Map<string, Vendor[]>();
    for (const v of filtered) {
      const list = map.get(v.category) ?? [];
      list.push(v);
      map.set(v.category, list);
    }
    return Array.from(map.entries()).sort((a, b) =>
      a[0].localeCompare(b[0], "fr"),
    );
  }, [filtered]);

  function openCreate() {
    setEditing(null);
    setDialogOpen(true);
  }
  function openEdit(v: Vendor) {
    setEditing(v);
    setDialogOpen(true);
  }
  async function handleSubmit(input: VendorInput) {
    if (editing) await update(editing.id, input);
    else await create(input);
  }
  async function confirmDelete() {
    if (!toDelete) return;
    setDeleting(true);
    try {
      await remove(toDelete.id);
      setToDelete(null);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Espace témoins
          </p>
          <h2 className="font-display text-4xl text-primary">
            Carnet des prestataires
          </h2>
          <p className="font-serif text-lg text-muted-foreground">
            Tous les contacts utiles pour aider les témoins le jour J.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={reload}>
            <RefreshCw className="size-4" /> Actualiser
          </Button>
          <Button size="sm" onClick={openCreate}>
            <Plus className="size-4" /> Ajouter
          </Button>
        </div>
      </div>

      <div className="relative w-full sm:max-w-sm">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Rechercher (nom, catégorie, note…)"
          className="pl-9"
        />
      </div>

      {error ? (
        <Card className="border-destructive/30">
          <CardContent className="py-8 text-center text-sm text-destructive">
            {error}
          </CardContent>
        </Card>
      ) : loading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-40 w-full" />
          ))}
        </div>
      ) : vendors.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
            <Inbox className="size-10 text-muted-foreground/50" />
            <div>
              <p className="font-serif text-lg">Aucun prestataire pour l'instant</p>
              <p className="text-sm text-muted-foreground">
                Ajoutez vos traiteurs, DJ, photographes et autres contacts utiles.
              </p>
            </div>
            <Button onClick={openCreate}>
              <Plus className="size-4" /> Ajouter un prestataire
            </Button>
          </CardContent>
        </Card>
      ) : grouped.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          Aucun prestataire ne correspond à votre recherche.
        </p>
      ) : (
        <div className="space-y-8">
          {grouped.map(([category, list]) => {
            const Icon = categoryIcon(category);
            return (
              <section key={category}>
                <div className="mb-3 flex items-center gap-2">
                  <Icon className="size-4 text-primary" />
                  <h3 className="font-serif text-xl font-semibold">{category}</h3>
                  <Badge variant="secondary">{list.length}</Badge>
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {list.map((v) => (
                    <VendorCard
                      key={v.id}
                      vendor={v}
                      onEdit={() => openEdit(v)}
                      onDelete={() => setToDelete(v)}
                    />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}

      <VendorDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        vendor={editing}
        onSubmit={handleSubmit}
      />

      <Dialog
        open={!!toDelete}
        onOpenChange={(o) => !o && setToDelete(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Supprimer ce prestataire ?</DialogTitle>
            <DialogDescription>
              {toDelete?.name} sera retiré du carnet d'adresses. Cette action est
              irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setToDelete(null)}>
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={deleting}
            >
              <Trash2 className="size-4" /> Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
