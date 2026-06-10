import {
  UtensilsCrossed,
  Music,
  Camera,
  Flower2,
  CakeSlice,
  Building2,
  Scissors,
  Sparkles,
  Bus,
  BedDouble,
  PartyPopper,
  HeartHandshake,
  Store,
  type LucideIcon,
} from "lucide-react";

export const VENDOR_CATEGORIES = [
  "Traiteur",
  "DJ / Musique",
  "Photographe / Vidéaste",
  "Fleuriste",
  "Pâtisserie / Gâteau",
  "Lieu / Salle",
  "Coiffure / Maquillage",
  "Décoration",
  "Transport",
  "Hébergement",
  "Animation",
  "Officiant·e",
  "Autre",
] as const;

export const CATEGORY_ICONS: Record<string, LucideIcon> = {
  Traiteur: UtensilsCrossed,
  "DJ / Musique": Music,
  "Photographe / Vidéaste": Camera,
  Fleuriste: Flower2,
  "Pâtisserie / Gâteau": CakeSlice,
  "Lieu / Salle": Building2,
  "Coiffure / Maquillage": Scissors,
  Décoration: Sparkles,
  Transport: Bus,
  Hébergement: BedDouble,
  Animation: PartyPopper,
  "Officiant·e": HeartHandshake,
  Autre: Store,
};

export function categoryIcon(category: string): LucideIcon {
  return CATEGORY_ICONS[category] ?? Store;
}
