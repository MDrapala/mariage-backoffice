import { useMemo, useState } from "react";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  RefreshCw,
  Inbox,
  Download,
  Users,
  CheckCircle2,
  Clock,
  Percent,
  Mail,
  Phone,
} from "lucide-react";

import { useInvitees } from "@/hooks/useInvitees";
import type { Invitee, InviteeInput } from "@/lib/api";
import { INVITEE_CATEGORY_LABELS } from "@/config/invitees";
import { InviteeDialog } from "@/components/InviteeDialog";
import { StatCard } from "@/components/StatCard";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type FilterMode = "tous" | "repondu" | "manquant";

function exportMissingCsv(invitees: Invitee[]) {
  const missing = invitees.filter((i) => !i.responded);
  const header = ["Prénom", "Nom", "Email", "Téléphone", "Foyer", "Catégorie"];
  const rows = missing.map((i) => [
    i.firstName,
    i.lastName,
    i.email ?? "",
    i.phone ?? "",
    i.household ?? "",
    INVITEE_CATEGORY_LABELS[i.category],
  ]);
  const escape = (v: string) => `"${v.replace(/"/g, '""')}"`;
  const csv = [header, ...rows]
    .map((r) => r.map((c) => escape(String(c))).join(","))
    .join("\n");
  const blob = new Blob([`﻿${csv}`], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "invites-sans-reponse.csv";
  a.click();
  URL.revokeObjectURL(url);
}

export default function Followup() {
  const { invitees, stats, loading, error, reload, create, update, remove } =
    useInvitees();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<FilterMode>("tous");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Invitee | null>(null);
  const [toDelete, setToDelete] = useState<Invitee | null>(null);
  const [deleting, setDeleting] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return invitees.filter((i) => {
      if (filter === "repondu" && !i.responded) return false;
      if (filter === "manquant" && i.responded) return false;
      if (!q) return true;
      return [i.firstName, i.lastName, i.household, i.email, i.phone]
        .filter(Boolean)
        .some((f) => (f as string).toLowerCase().includes(q));
    });
  }, [invitees, query, filter]);

  function openCreate() {
    setEditing(null);
    setDialogOpen(true);
  }
  function openEdit(i: Invitee) {
    setEditing(i);
    setDialogOpen(true);
  }
  async function handleSubmit(input: InviteeInput) {
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

  const FILTERS: { key: FilterMode; label: string }[] = [
    { key: "tous", label: "Tous" },
    { key: "repondu", label: "Ont répondu" },
    { key: "manquant", label: "Sans réponse" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Suivi RSVP
          </p>
          <h2 className="font-display text-4xl text-primary">
            Liste des invités
          </h2>
          <p className="font-serif text-lg text-muted-foreground">
            Qui a répondu, qui reste à relancer.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={reload}>
            <RefreshCw className="size-4" /> Actualiser
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => exportMissingCsv(invitees)}
            disabled={!invitees.some((i) => !i.responded)}
          >
            <Download className="size-4" /> Export manquants
          </Button>
          <Button size="sm" onClick={openCreate}>
            <Plus className="size-4" /> Ajouter
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Invités"
          value={stats?.total ?? 0}
          icon={Users}
          loading={loading}
          accent="terracotta"
        />
        <StatCard
          label="Ont répondu"
          value={stats?.responded ?? 0}
          icon={CheckCircle2}
          loading={loading}
          accent="sage"
        />
        <StatCard
          label="Sans réponse"
          value={stats?.missing ?? 0}
          icon={Clock}
          loading={loading}
          accent="rose"
        />
        <StatCard
          label="Taux de réponse"
          value={`${stats?.responseRate ?? 0} %`}
          icon={Percent}
          loading={loading}
          accent="brique"
        />
      </div>

      {/* Recherche + filtres */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative w-full sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher (nom, foyer, email…)"
            className="pl-9"
          />
        </div>
        <div className="flex gap-1">
          {FILTERS.map((f) => (
            <Button
              key={f.key}
              variant={filter === f.key ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter(f.key)}
            >
              {f.label}
            </Button>
          ))}
        </div>
      </div>

      {error ? (
        <Card className="border-destructive/30">
          <CardContent className="py-8 text-center text-sm text-destructive">
            {error}
          </CardContent>
        </Card>
      ) : loading ? (
        <Skeleton className="h-72 w-full" />
      ) : invitees.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
            <Inbox className="size-10 text-muted-foreground/50" />
            <div>
              <p className="font-serif text-lg">Aucun invité dans la liste</p>
              <p className="text-sm text-muted-foreground">
                Ajoutez les invités conviés pour suivre les réponses et préparer
                les relances.
              </p>
            </div>
            <Button onClick={openCreate}>
              <Plus className="size-4" /> Ajouter un invité
            </Button>
          </CardContent>
        </Card>
      ) : filtered.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          Aucun invité ne correspond.
        </p>
      ) : (
        <Card className="overflow-hidden py-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invité</TableHead>
                <TableHead className="hidden md:table-cell">Foyer</TableHead>
                <TableHead className="hidden sm:table-cell">Contact</TableHead>
                <TableHead>Réponse</TableHead>
                <TableHead className="w-20 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((i) => (
                <TableRow key={i.id}>
                  <TableCell>
                    <span className="font-medium">
                      {i.firstName} {i.lastName}
                    </span>
                    {i.category !== "adulte" && (
                      <Badge variant="outline" className="ml-2">
                        {INVITEE_CATEGORY_LABELS[i.category]}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="hidden text-sm text-muted-foreground md:table-cell">
                    {i.household ?? "—"}
                  </TableCell>
                  <TableCell className="hidden text-sm text-muted-foreground sm:table-cell">
                    <div className="flex flex-col gap-0.5">
                      {i.email && (
                        <span className="flex items-center gap-1.5">
                          <Mail className="size-3" /> {i.email}
                        </span>
                      )}
                      {i.phone && (
                        <span className="flex items-center gap-1.5">
                          <Phone className="size-3" /> {i.phone}
                        </span>
                      )}
                      {!i.email && !i.phone && "—"}
                    </div>
                  </TableCell>
                  <TableCell>
                    {i.responded ? (
                      <Badge variant="sage">
                        <CheckCircle2 className="size-3" /> Répondu
                      </Badge>
                    ) : (
                      <Badge variant="outline">
                        <Clock className="size-3" /> En attente
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8"
                        onClick={() => openEdit(i)}
                        title="Modifier"
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 text-destructive hover:text-destructive"
                        onClick={() => setToDelete(i)}
                        title="Supprimer"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      <p className="text-xs text-muted-foreground">
        Le rapprochement « a répondu » se fait par prénom + nom. Si un invité
        apparaît à tort « en attente », vérifiez l'orthographe par rapport à sa
        réponse RSVP.
      </p>

      <InviteeDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        invitee={editing}
        onSubmit={handleSubmit}
      />

      <Dialog open={!!toDelete} onOpenChange={(o) => !o && setToDelete(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Retirer cet invité ?</DialogTitle>
            <DialogDescription>
              {toDelete?.firstName} {toDelete?.lastName} sera retiré de la liste.
              Cela ne supprime pas sa réponse RSVP éventuelle.
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
              <Trash2 className="size-4" /> Retirer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
