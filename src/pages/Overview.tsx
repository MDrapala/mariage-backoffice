import { useMemo } from "react";
import {
  Users,
  MailCheck,
  Baby,
  TriangleAlert,
  RefreshCw,
  TrendingUp,
  CalendarHeart,
  MonitorSmartphone,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { useDashboardData } from "@/hooks/useDashboardData";
import { deviceMeta } from "@/lib/device";
import { daysUntilWedding } from "@/config/wedding";
import { StatCard } from "@/components/StatCard";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

function formatDay(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
  });
}

export default function Overview() {
  const { stats, loading, error, reload } = useDashboardData();

  const cumulative = useMemo(() => {
    if (!stats) return [];
    let sum = 0;
    return stats.submissionsPerDay.map((d) => {
      sum += d.count;
      return { day: formatDay(d.day), Réponses: d.count, Cumul: sum };
    });
  }, [stats]);

  const composition = useMemo(() => {
    if (!stats) return [];
    return [
      { name: "Adultes", value: stats.totalAdults, color: "#c76b49" },
      { name: "Enfants", value: stats.totalChildren, color: "#a9b49a" },
    ];
  }, [stats]);

  if (error) {
    return (
      <Card className="border-destructive/30">
        <CardHeader>
          <CardTitle className="text-destructive">
            Impossible de charger les données
          </CardTitle>
          <CardDescription>{error}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={reload} variant="outline">
            <RefreshCw className="size-4" /> Réessayer
          </Button>
        </CardContent>
      </Card>
    );
  }

  const days = daysUntilWedding();

  return (
    <div className="space-y-6">
      {/* En-tête éditorial */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Tableau de bord
          </p>
          <h2 className="font-display text-4xl text-primary">
            Plus que {days} jours
          </h2>
          <p className="font-serif text-lg text-muted-foreground">
            Voici où en sont les réponses de vos invités.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={reload}>
          <RefreshCw className="size-4" /> Actualiser
        </Button>
      </div>

      {/* Cartes statistiques */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Invités confirmés"
          value={stats?.totalGuests ?? 0}
          icon={Users}
          accent="terracotta"
          hint={`${stats?.totalSubmissions ?? 0} foyers ont répondu`}
          loading={loading}
        />
        <StatCard
          label="Réponses (RSVP)"
          value={stats?.totalSubmissions ?? 0}
          icon={MailCheck}
          accent="rose"
          hint={`${stats?.avgGuestsPerSubmission ?? 0} invités / réponse en moy.`}
          loading={loading}
        />
        <StatCard
          label="Adultes / Enfants"
          value={
            stats ? `${stats.totalAdults} / ${stats.totalChildren}` : "0 / 0"
          }
          icon={Baby}
          accent="sage"
          hint="Répartition des convives"
          loading={loading}
        />
        <StatCard
          label="Allergies signalées"
          value={stats?.submissionsWithAllergies ?? 0}
          icon={TriangleAlert}
          accent="brique"
          hint="Foyers avec restrictions"
          loading={loading}
        />
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="size-4 text-primary" />
              Réponses au fil du temps
            </CardTitle>
            <CardDescription>
              Cumul des RSVP reçus jour après jour
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-[280px] w-full" />
            ) : cumulative.length === 0 ? (
              <EmptyChart />
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart
                  data={cumulative}
                  margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="fillCumul" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#c76b49" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#c76b49" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(155,74,45,0.12)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="day"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: "#8a6f5e", fontSize: 12 }}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    width={32}
                    tick={{ fill: "#8a6f5e", fontSize: 12 }}
                    allowDecimals={false}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 10,
                      border: "1px solid rgba(155,74,45,0.16)",
                      fontSize: 13,
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="Cumul"
                    stroke="#c76b49"
                    strokeWidth={2.5}
                    fill="url(#fillCumul)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarHeart className="size-4 text-primary" />
              Convives
            </CardTitle>
            <CardDescription>Adultes et enfants attendus</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-[280px] w-full" />
            ) : (stats?.totalGuests ?? 0) === 0 ? (
              <EmptyChart />
            ) : (
              <div className="flex flex-col items-center">
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={composition}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={62}
                      outerRadius={92}
                      paddingAngle={3}
                      strokeWidth={0}
                    >
                      {composition.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        borderRadius: 10,
                        border: "1px solid rgba(155,74,45,0.16)",
                        fontSize: 13,
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="-mt-[140px] mb-[120px] text-center">
                  <p className="font-serif text-4xl font-semibold leading-none">
                    {stats?.totalGuests ?? 0}
                  </p>
                  <p className="text-xs text-muted-foreground">invités</p>
                </div>
                <div className="flex gap-4">
                  {composition.map((c) => (
                    <div key={c.name} className="flex items-center gap-2">
                      <span
                        className="size-3 rounded-full"
                        style={{ backgroundColor: c.color }}
                      />
                      <span className="text-sm text-muted-foreground">
                        {c.name} · <b className="text-foreground">{c.value}</b>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      {/* Allergies */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TriangleAlert className="size-4 text-primary" />
            Allergies &amp; régimes particuliers
          </CardTitle>
          <CardDescription>
            Restrictions renseignées par les invités — à transmettre au traiteur
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-7 w-28" />
              ))}
            </div>
          ) : stats && stats.allergies.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {stats.allergies.map((a, i) => (
                <Badge key={i} variant="sage" className="px-3 py-1 text-sm">
                  {a}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Aucune allergie signalée pour le moment.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Répartition par appareil */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MonitorSmartphone className="size-4 text-primary" />
            Appareils utilisés
          </CardTitle>
          <CardDescription>Comment les invités ont répondu</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-full" />
            ))
          ) : (stats?.totalSubmissions ?? 0) === 0 ? (
            <p className="text-sm text-muted-foreground">
              Aucune réponse pour le moment.
            </p>
          ) : (
            (["mobile", "tablet", "desktop", "inconnu"] as const)
              .map((key) => ({
                key,
                count: stats?.deviceBreakdown[key] ?? 0,
                meta: deviceMeta(key === "inconnu" ? null : key),
              }))
              .filter((d) => d.count > 0)
              .map(({ key, count, meta }) => {
                const total = stats?.totalSubmissions || 1;
                const pct = Math.round((count / total) * 100);
                const Icon = meta.icon;
                return (
                  <div key={key} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2">
                        <Icon className="size-4" style={{ color: meta.color }} />
                        {meta.label}
                      </span>
                      <span className="text-muted-foreground">
                        {count} · {pct}%
                      </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${pct}%`, backgroundColor: meta.color }}
                      />
                    </div>
                  </div>
                );
              })
          )}
        </CardContent>
      </Card>
      </div>
    </div>
  );
}

function EmptyChart() {
  return (
    <div className="flex h-[260px] flex-col items-center justify-center gap-2 text-center">
      <CalendarHeart className="size-8 text-muted-foreground/50" />
      <p className="text-sm text-muted-foreground">
        Pas encore de réponses à afficher.
      </p>
    </div>
  );
}
