import { useMemo, useState } from "react";
import {
  Search,
  Users,
  Baby,
  TriangleAlert,
  RefreshCw,
  Download,
  Inbox,
} from "lucide-react";

import { useDashboardData } from "@/hooks/useDashboardData";
import type { Rsvp } from "@/lib/api";
import { deviceMeta } from "@/lib/device";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function matches(rsvp: Rsvp, q: string): boolean {
  if (!q) return true;
  const needle = q.toLowerCase();
  return rsvp.persons.some(
    (p) =>
      p.prenom.toLowerCase().includes(needle) ||
      p.nom.toLowerCase().includes(needle),
  );
}

function exportCsv(rsvps: Rsvp[]) {
  const header = [
    "Prénom",
    "Nom",
    "Type",
    "Allergies",
    "Appareil",
    "Date de réponse",
  ];
  const lines = rsvps.flatMap((r) =>
    r.persons.map((p) =>
      [
        p.prenom,
        p.nom,
        p.isChild ? "Enfant" : "Adulte",
        (r.allergies ?? "").replace(/[\n;]/g, " "),
        deviceMeta(r.device).label,
        formatDate(r.createdAt),
      ]
        .map((c) => `"${String(c).replace(/"/g, '""')}"`)
        .join(";"),
    ),
  );
  const csv = [header.join(";"), ...lines].join("\n");
  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `invites-mariage-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function Guests() {
  const { rsvps, loading, error, reload } = useDashboardData();
  const [query, setQuery] = useState("");

  const filtered = useMemo(
    () => rsvps.filter((r) => matches(r, query)),
    [rsvps, query],
  );

  const totalGuests = rsvps.reduce((s, r) => s + r.guestCount, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Liste des invités
          </p>
          <h2 className="font-display text-4xl text-primary">
            {totalGuests} convives
          </h2>
          <p className="font-serif text-lg text-muted-foreground">
            {rsvps.length} foyers ont confirmé leur présence.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={reload}>
            <RefreshCw className="size-4" /> Actualiser
          </Button>
          <Button
            size="sm"
            onClick={() => exportCsv(rsvps)}
            disabled={rsvps.length === 0}
          >
            <Download className="size-4" /> Exporter CSV
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="gap-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <CardTitle>Réponses RSVP</CardTitle>
              <CardDescription>
                Détail de chaque foyer et de ses convives
              </CardDescription>
            </div>
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Rechercher un invité…"
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {error ? (
            <p className="py-8 text-center text-sm text-destructive">{error}</p>
          ) : loading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-12 text-center">
              <Inbox className="size-8 text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground">
                {rsvps.length === 0
                  ? "Aucune réponse reçue pour le moment."
                  : "Aucun invité ne correspond à votre recherche."}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Foyer / Invités</TableHead>
                  <TableHead className="text-center">Convives</TableHead>
                  <TableHead>Allergies</TableHead>
                  <TableHead>Appareil</TableHead>
                  <TableHead className="text-right">Répondu le</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((r) => (
                  <TableRow key={r.id} className="align-top">
                    <TableCell className="max-w-[420px] py-3">
                      <div className="flex flex-wrap gap-1.5">
                        {r.persons.map((p) => (
                          <span
                            key={p.id}
                            className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-1 text-sm"
                          >
                            {p.isChild ? (
                              <Baby className="size-3.5 text-[#5f6b50]" />
                            ) : (
                              <Users className="size-3.5 text-primary" />
                            )}
                            {p.prenom} {p.nom}
                          </span>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="font-medium">{r.guestCount}</span>
                      <span className="text-muted-foreground">
                        {" "}
                        ({r.adultCount}A·{r.childCount}E)
                      </span>
                    </TableCell>
                    <TableCell>
                      {r.allergies ? (
                        <Badge variant="sage" className="gap-1">
                          <TriangleAlert className="size-3" />
                          {r.allergies}
                        </Badge>
                      ) : (
                        <span className="text-sm text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {(() => {
                        const m = deviceMeta(r.device);
                        const Icon = m.icon;
                        return (
                          <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                            <Icon className="size-3.5" style={{ color: m.color }} />
                            {m.label}
                          </span>
                        );
                      })()}
                    </TableCell>
                    <TableCell className="text-right text-sm text-muted-foreground">
                      {formatDate(r.createdAt)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
