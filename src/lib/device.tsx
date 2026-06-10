import { Smartphone, Tablet, Monitor, HelpCircle, type LucideIcon } from "lucide-react";

export interface DeviceMeta {
  label: string;
  icon: LucideIcon;
  color: string;
}

export function deviceMeta(device: string | null): DeviceMeta {
  switch (device) {
    case "mobile":
      return { label: "Téléphone", icon: Smartphone, color: "#c76b49" };
    case "tablet":
      return { label: "Tablette", icon: Tablet, color: "#a9b49a" };
    case "desktop":
      return { label: "Ordinateur", icon: Monitor, color: "#9b4a2d" };
    default:
      return { label: "Inconnu", icon: HelpCircle, color: "#8a6f5e" };
  }
}
