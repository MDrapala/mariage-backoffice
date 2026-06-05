import {
  MapPin,
  Building2,
  CalendarHeart,
  KeyRound,
  Phone,
  Globe,
  Clock,
  ExternalLink,
} from "lucide-react";

import { WEDDING, daysUntilWedding } from "@/config/wedding";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

function InfoRow({
  icon: Icon,
  label,
  value,
  href,
}: {
  icon: typeof MapPin;
  label: string;
  value: string;
  href?: string;
}) {
  const content = (
    <div className="flex items-start gap-3 py-2.5">
      <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
        <Icon className="size-4" />
      </div>
      <div className="min-w-0">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        <p className="font-serif text-base leading-snug text-foreground">
          {value}
          {href && (
            <ExternalLink className="ml-1 inline size-3 text-muted-foreground" />
          )}
        </p>
      </div>
    </div>
  );
  return href ? (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="block rounded-md transition-colors hover:bg-muted/60"
    >
      {content}
    </a>
  ) : (
    content
  );
}

export default function Info() {
  const date = new Date(WEDDING.date);
  const days = daysUntilWedding();
  const mapsUrl = (q: string) =>
    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;

  return (
    <div className="space-y-6">
      {/* Bandeau */}
      <Card className="overflow-hidden border-0 bg-primary text-primary-foreground">
        <CardContent className="flex flex-wrap items-center justify-between gap-6 py-2">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-primary-foreground/70">
              Le mariage de
            </p>
            <h2 className="font-display text-5xl">
              {WEDDING.bride} &amp; {WEDDING.groom}
            </h2>
            <p className="font-serif text-lg text-primary-foreground/85">
              {date.toLocaleDateString("fr-FR", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>
          <div className="text-right">
            <p className="font-display text-6xl leading-none">J−{days}</p>
            <p className="text-sm text-primary-foreground/70">avant le jour J</p>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Lieu de réception */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="size-4 text-primary" />
              Lieu de réception
            </CardTitle>
            <CardDescription>Cérémonie &amp; soirée</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <InfoRow
              icon={Building2}
              label="Domaine"
              value={WEDDING.venue.name}
            />
            <Separator />
            <InfoRow
              icon={MapPin}
              label="Adresse"
              value={WEDDING.venue.address}
              href={mapsUrl(WEDDING.venue.name + " " + WEDDING.venue.address)}
            />
          </CardContent>
        </Card>

        {/* Mairie */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="size-4 text-primary" />
              Mairie
            </CardTitle>
            <CardDescription>Cérémonie civile</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <InfoRow
              icon={Building2}
              label="Mairie"
              value={WEDDING.cityHall.name}
            />
            <Separator />
            <InfoRow
              icon={MapPin}
              label="Adresse"
              value={WEDDING.cityHall.address}
              href={mapsUrl(WEDDING.cityHall.name + " " + WEDDING.cityHall.address)}
            />
          </CardContent>
        </Card>

        {/* Date & accès */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarHeart className="size-4 text-primary" />
              Date &amp; accès
            </CardTitle>
            <CardDescription>Informations clés du site invité</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <InfoRow
              icon={Clock}
              label="Date"
              value={date.toLocaleDateString("fr-FR", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            />
            <Separator />
            <div className="flex items-start gap-3 py-2.5">
              <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                <KeyRound className="size-4" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">
                  Code d'accès du site
                </p>
                <Badge variant="outline" className="mt-1 font-mono text-sm">
                  {WEDDING.accessCode}
                </Badge>
              </div>
            </div>
            <Separator />
            <InfoRow
              icon={Globe}
              label="Site des invités"
              value={WEDDING.siteUrl}
              href={WEDDING.siteUrl}
            />
          </CardContent>
        </Card>

        {/* Contacts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="size-4 text-primary" />
              Contacts des mariés
            </CardTitle>
            <CardDescription>Pour les invités &amp; prestataires</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <InfoRow
              icon={Phone}
              label={WEDDING.contacts.bride.name}
              value={WEDDING.contacts.bride.phone}
            />
            <Separator />
            <InfoRow
              icon={Phone}
              label={WEDDING.contacts.groom.name}
              value={WEDDING.contacts.groom.phone}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
