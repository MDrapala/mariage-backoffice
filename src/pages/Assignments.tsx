import { useMemo, useState } from "react";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  RefreshCw,
  Inbox,
  BedDouble,
  Users,
  CalendarRange,
  NotebookPen,
} from "lucide-react";

import { useRooms } from "@/hooks/useRooms";
import { useAssignments } from "@/hooks/useAssignments";
import { useDashboardData } from "@/hooks/useDashboardData";
import type { RoomAssignment, RoomAssignmentInput } from "@/lib/api";
import { AssignmentDialog, rsvpLabel } from "@/components/AssignmentDialog";
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

function formatDate(iso: string | null): string | null {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function AssignmentCard({
  assignment,
  onEdit,
  onDelete,
}: {
  assignment: RoomAssignment;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const { room, rsvp } = assignment;
  const arrival = formatDate(assignment.arrival);
  const departure = formatDate(assignment.departure);

  return (
    <Card className="gap-0 py-0">
      <CardContent className="flex flex-col gap-3 p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <BedDouble className="size-4 text-primary" />
              <p className="font-serif text-xl font-semibold leading-tight">
                Chambre {room?.number ?? "?"}
              </p>
              <Badge
                variant={
                  assignment.status === "confirmée" ? "default" : "secondary"
                }
                className="capitalize"
              >
                {assignment.status ?? "provisoire"}
              </Badge>
            </div>
            {room?.category && (
              <p className="text-sm text-muted-foreground capitalize">
                {room.category}
                {room.bed ? ` · ${room.bed}` : ""}
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

        <div className="flex items-start gap-2 text-sm">
          <Users className="mt-0.5 size-3.5 shrink-0 text-primary/70" />
          <span>
            {assignment.occupants.length > 0
              ? assignment.occupants
                  .map((p) => `${p.prenom} ${p.nom}`)
                  .join(", ")
              : rsvp
                ? rsvpLabel(rsvp)
                : "Foyer supprimé"}
            <span className="text-muted-foreground">
              {" "}
              · {assignment.occupants.length || rsvp?.guestCount || 0} pers.
            </span>
          </span>
        </div>

        {(arrival || departure) && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CalendarRange className="size-3.5 text-primary/70" />
            <span>
              {arrival ?? "?"} → {departure ?? "?"}
            </span>
          </div>
        )}

        {assignment.notes && (
          <div className="flex gap-2 rounded-md bg-muted/60 p-2.5 text-sm text-foreground/80">
            <NotebookPen className="mt-0.5 size-3.5 shrink-0 text-primary/70" />
            <p className="whitespace-pre-wrap">{assignment.notes}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function Assignments() {
  const { rooms, loading: roomsLoading } = useRooms();
  const { rsvps, loading: rsvpsLoading } = useDashboardData();
  const { assignments, loading, error, reload, create, update, remove } =
    useAssignments();

  const [query, setQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<RoomAssignment | null>(null);
  const [toDelete, setToDelete] = useState<RoomAssignment | null>(null);
  const [deleting, setDeleting] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return assignments;
    return assignments.filter((a) => {
      const names = (a.rsvp?.persons ?? [])
        .map((p) => `${p.prenom} ${p.nom}`)
        .join(" ");
      return [a.room?.number, a.room?.category, names, a.notes]
        .filter(Boolean)
        .some((f) => (f as string).toLowerCase().includes(q));
    });
  }, [assignments, query]);

  const assignedRoomIds = useMemo(
    () => new Set(assignments.map((a) => a.roomId)),
    [assignments],
  );
  const freeRoomsCount = rooms.length - assignedRoomIds.size;

  function openCreate() {
    setEditing(null);
    setDialogOpen(true);
  }
  function openEdit(a: RoomAssignment) {
    setEditing(a);
    setDialogOpen(true);
  }
  async function handleSubmit(input: RoomAssignmentInput) {
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

  const busy = loading || roomsLoading || rsvpsLoading;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Hébergement
          </p>
          <h2 className="font-display text-4xl text-primary">
            Attribution des chambres
          </h2>
          <p className="font-serif text-lg text-muted-foreground">
            {assignments.length} attribution(s) · {freeRoomsCount} chambre(s)
            encore libre(s).
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={reload}>
            <RefreshCw className="size-4" /> Actualiser
          </Button>
          <Button
            size="sm"
            onClick={openCreate}
            disabled={rooms.length === 0 || rsvps.length === 0}
          >
            <Plus className="size-4" /> Attribuer
          </Button>
        </div>
      </div>

      <div className="relative w-full sm:max-w-sm">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Rechercher (chambre, invité, note…)"
          className="pl-9"
        />
      </div>

      {error ? (
        <Card className="border-destructive/30">
          <CardContent className="py-8 text-center text-sm text-destructive">
            {error}
          </CardContent>
        </Card>
      ) : busy ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-40 w-full" />
          ))}
        </div>
      ) : assignments.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
            <Inbox className="size-10 text-muted-foreground/50" />
            <div>
              <p className="font-serif text-lg">Aucune chambre attribuée</p>
              <p className="text-sm text-muted-foreground">
                {rooms.length === 0
                  ? "Ajoutez d'abord des chambres."
                  : rsvps.length === 0
                    ? "Aucun foyer inscrit pour le moment."
                    : "Associez une chambre à un foyer d'invités inscrits."}
              </p>
            </div>
            {rooms.length > 0 && rsvps.length > 0 && (
              <Button onClick={openCreate}>
                <Plus className="size-4" /> Attribuer une chambre
              </Button>
            )}
          </CardContent>
        </Card>
      ) : filtered.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          Aucune attribution ne correspond à votre recherche.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((a) => (
            <AssignmentCard
              key={a.id}
              assignment={a}
              onEdit={() => openEdit(a)}
              onDelete={() => setToDelete(a)}
            />
          ))}
        </div>
      )}

      <AssignmentDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        assignment={editing}
        rooms={rooms}
        rsvps={rsvps}
        onSubmit={handleSubmit}
      />

      <Dialog open={!!toDelete} onOpenChange={(o) => !o && setToDelete(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Supprimer cette attribution ?</DialogTitle>
            <DialogDescription>
              La chambre {toDelete?.room?.number} ne sera plus attribuée à ce
              foyer. La chambre elle-même n'est pas supprimée.
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
