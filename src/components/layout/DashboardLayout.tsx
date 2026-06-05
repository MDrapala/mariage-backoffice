import { useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Info,
  Heart,
  LogOut,
  Menu,
  X,
  CalendarDays,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { WEDDING, daysUntilWedding } from "@/config/wedding";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

const NAV = [
  { to: "/", label: "Vue d'ensemble", icon: LayoutDashboard, end: true },
  { to: "/invites", label: "Invités", icon: Users, end: false },
  { to: "/informations", label: "Informations", icon: Info, end: false },
];

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const { username, logout } = useAuth();
  const days = daysUntilWedding();

  return (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      {/* Brand */}
      <div className="flex items-center gap-3 px-5 py-5">
        <div className="flex size-9 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <Heart className="size-4" fill="currentColor" />
        </div>
        <div className="leading-tight">
          <p className="font-display text-2xl text-sidebar-foreground">
            {WEDDING.bride} &amp; {WEDDING.groom}
          </p>
          <p className="text-[11px] uppercase tracking-[0.2em] text-sidebar-foreground/55">
            Back-office
          </p>
        </div>
      </div>

      {/* Countdown */}
      <div className="mx-4 mb-2 rounded-lg border border-sidebar-border bg-sidebar-accent px-4 py-3">
        <div className="flex items-center gap-2 text-sidebar-foreground/60">
          <CalendarDays className="size-3.5" />
          <span className="text-[11px] uppercase tracking-wider">
            Jour J
          </span>
        </div>
        <p className="mt-1 font-display text-3xl text-primary">
          J−{days}
        </p>
        <p className="text-xs text-sidebar-foreground/55">
          {new Date(WEDDING.date).toLocaleDateString("fr-FR", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </p>
      </div>

      {/* Nav */}
      <nav className="mt-3 flex-1 space-y-1 px-3">
        {NAV.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-sidebar-foreground/75 hover:bg-sidebar-accent hover:text-sidebar-foreground",
              )
            }
          >
            <item.icon className="size-4" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* User */}
      <div className="mt-auto border-t border-sidebar-border p-3">
        <div className="flex items-center gap-3 rounded-md px-2 py-2">
          <Avatar className="size-8 bg-primary/20">
            <AvatarFallback className="bg-primary/20 text-primary-foreground">
              {(username ?? "A").slice(0, 1).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1 leading-tight">
            <p className="truncate text-sm font-medium">{username ?? "Admin"}</p>
            <p className="truncate text-[11px] text-sidebar-foreground/50">
              Administrateur
            </p>
          </div>
          <button
            onClick={logout}
            title="Se déconnecter"
            className="rounded-md p-2 text-sidebar-foreground/60 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground"
          >
            <LogOut className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

const TITLES: Record<string, string> = {
  "/": "Vue d'ensemble",
  "/invites": "Invités",
  "/informations": "Informations",
};

export default function DashboardLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const title = TITLES[location.pathname] ?? "Tableau de bord";

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar desktop */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-sidebar-border lg:block">
        <SidebarContent />
      </aside>

      {/* Sidebar mobile */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 w-64">
            <SidebarContent onNavigate={() => setMobileOpen(false)} />
          </div>
        </div>
      )}

      <div className="lg:pl-64">
        {/* Topbar */}
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b bg-background/80 px-4 backdrop-blur-md sm:px-6">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setMobileOpen((v) => !v)}
          >
            {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </Button>
          <div>
            <h1 className="text-lg font-semibold leading-tight">{title}</h1>
            <p className="text-xs text-muted-foreground">
              Suivi des réponses &amp; informations du mariage
            </p>
          </div>
        </header>

        <main className="p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
