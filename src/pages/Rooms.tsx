import { useMemo, useState } from "react";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  RefreshCw,
  Inbox,
  BedDouble,
  Snowflake,
  Sun,
  Trees,
  Accessibility,
  Bath,
  Users,
  Baby,
} from "lucide-react";

import { useRooms } from "@/hooks/useRooms";
import type { Room, RoomInput } from "@/lib/api";
import { RoomDialog } from "@/components/RoomDialog";
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

function floorLabel(floor: string | null): string {
  if (!floor) return "Étage non précisé";
  if (floor === "1") return "Étage 1";
  if (floor === "2") return "Étage 2";
  return floor.charAt(0).toUpperCase() + floor.slice(1);
}

function RoomCard({
  room,
  onEdit,
  onDelete,
}: {
  room: Room;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <Card className="gap-0 py-0">
      <CardContent className="flex flex-col gap-3 p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <BedDouble className="size-4 text-primary" />
              <p className="font-serif text-xl font-semibold leading-tight">
                {room.number}
              </p>
              {room.category && (
                <Badge variant="secondary" className="capitalize">
                  {room.category}
                </Badge>
              )}
            </div>
            {room.bed && (
              <p className="mt-0.5 text-sm text-muted-foreground">{room.bed}</p>
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

        <div className="flex flex-wrap gap-1.5">
          {room.adults && (
            <Badge variant="outline">
              <Users className="size-3" /> {room.adults}
            </Badge>
          )}
          {room.children && (
            <Badge variant="outline">
              <Baby className="size-3" /> {room.children}
            </Badge>
          )}
          {room.bathroom && (
            <Badge variant="outline">
              <Bath className="size-3" /> {room.bathroom}
            </Badge>
          )}
          {room.side && (
            <Badge variant="sage">
              <Trees className="size-3" /> {room.side}
            </Badge>
          )}
          <Badge variant="outline">
            {room.airConditioning ? (
              <>
                <Snowflake className="size-3" /> Clim
              </>
            ) : (
              <>
                <Sun className="size-3" /> Sans clim
              </>
            )}
          </Badge>
          <Badge variant="outline">
            {room.balcony ? "Balcon" : "Sans balcon"}
          </Badge>
          {room.flooring && <Badge variant="outline">{room.flooring}</Badge>}
          {room.pmr && (
            <Badge variant="default">
              <Accessibility className="size-3" /> PMR
            </Badge>
          )}
        </div>

        {room.dispos && (
          <p className="rounded-md bg-muted/60 p-2 text-sm text-foreground/80">
            {room.dispos}
          </p>
        )}
        {room.notes && (
          <p className="whitespace-pre-wrap text-sm text-muted-foreground">
            {room.notes}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export default function Rooms() {
  const { rooms, loading, error, reload, create, update, remove } = useRooms();
  const [query, setQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Room | null>(null);
  const [toDelete, setToDelete] = useState<Room | null>(null);
  const [deleting, setDeleting] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rooms;
    return rooms.filter((r) =>
      [r.number, r.category, r.floor, r.bed, r.side, r.dispos, r.notes]
        .filter(Boolean)
        .some((f) => (f as string).toLowerCase().includes(q)),
    );
  }, [rooms, query]);

  const grouped = useMemo(() => {
    const order = ["-1 (sous open space)", "-1", "rez de chaussée", "1", "2"];
    const map = new Map<string, Room[]>();
    for (const r of filtered) {
      const key = r.floor ?? "";
      const list = map.get(key) ?? [];
      list.push(r);
      map.set(key, list);
    }
    return Array.from(map.entries()).sort((a, b) => {
      const ia = order.indexOf(a[0]);
      const ib = order.indexOf(b[0]);
      if (ia !== -1 && ib !== -1) return ia - ib;
      if (ia !== -1) return -1;
      if (ib !== -1) return 1;
      return a[0].localeCompare(b[0], "fr");
    });
  }, [filtered]);

  function openCreate() {
    setEditing(null);
    setDialogOpen(true);
  }
  function openEdit(r: Room) {
    setEditing(r);
    setDialogOpen(true);
  }
  async function handleSubmit(input: RoomInput) {
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
            Hébergement
          </p>
          <h2 className="font-display text-4xl text-primary">Les chambres</h2>
          <p className="font-serif text-lg text-muted-foreground">
            Le plan complet des chambres de l'hôtel ({rooms.length}).
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
          placeholder="Rechercher (numéro, catégorie, étage…)"
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
            <Skeleton key={i} className="h-44 w-full" />
          ))}
        </div>
      ) : rooms.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
            <Inbox className="size-10 text-muted-foreground/50" />
            <div>
              <p className="font-serif text-lg">Aucune chambre pour l'instant</p>
              <p className="text-sm text-muted-foreground">
                Ajoutez les chambres de l'hôtel pour gérer l'hébergement.
              </p>
            </div>
            <Button onClick={openCreate}>
              <Plus className="size-4" /> Ajouter une chambre
            </Button>
          </CardContent>
        </Card>
      ) : grouped.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          Aucune chambre ne correspond à votre recherche.
        </p>
      ) : (
        <div className="space-y-8">
          {grouped.map(([floor, list]) => (
            <section key={floor || "none"}>
              <div className="mb-3 flex items-center gap-2">
                <h3 className="font-serif text-xl font-semibold">
                  {floorLabel(floor || null)}
                </h3>
                <Badge variant="secondary">{list.length}</Badge>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {list.map((r) => (
                  <RoomCard
                    key={r.id}
                    room={r}
                    onEdit={() => openEdit(r)}
                    onDelete={() => setToDelete(r)}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      <RoomDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        room={editing}
        onSubmit={handleSubmit}
      />

      <Dialog open={!!toDelete} onOpenChange={(o) => !o && setToDelete(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Supprimer cette chambre ?</DialogTitle>
            <DialogDescription>
              La chambre {toDelete?.number} et ses attributions seront supprimées.
              Cette action est irréversible.
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
