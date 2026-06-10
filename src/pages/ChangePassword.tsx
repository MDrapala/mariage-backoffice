import { useState, type FormEvent } from "react";
import { Heart, Loader2, KeyRound, LogOut } from "lucide-react";
import { toast } from "sonner";

import { useAuth } from "@/contexts/AuthContext";
import { ApiError } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ChangePassword() {
  const { displayName, username, changePassword, logout } = useAuth();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (password.length < 8) {
      toast.error("Le mot de passe doit contenir au moins 8 caractères.");
      return;
    }
    if (password !== confirm) {
      toast.error("Les deux mots de passe ne correspondent pas.");
      return;
    }
    setLoading(true);
    try {
      await changePassword(password);
      toast.success("Mot de passe enregistré 🤍");
    } catch (err) {
      toast.error(
        err instanceof ApiError ? err.message : "Changement impossible.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-background">
      <div className="pointer-events-none absolute -top-40 -right-40 size-[36rem] rounded-full bg-secondary/40 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -left-40 size-[32rem] rounded-full bg-[#a9b49a]/30 blur-3xl" />

      <div className="relative z-10 flex min-h-screen items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm">
              <Heart className="size-5" fill="currentColor" />
            </div>
            <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
              Première connexion
            </p>
            <h1 className="font-display text-4xl leading-tight text-primary">
              Bienvenue {displayName || username} !
            </h1>
            <p className="mt-1 font-serif text-lg text-muted-foreground">
              Choisissez votre mot de passe personnel pour sécuriser votre accès.
            </p>
          </div>

          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="np">Nouveau mot de passe</Label>
                <Input
                  id="np"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                  placeholder="Au moins 8 caractères"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="npc">Confirmer le mot de passe</Label>
                <Input
                  id="npc"
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  autoComplete="new-password"
                  placeholder="••••••••"
                  required
                />
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={loading || !password || !confirm}
              >
                {loading ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <KeyRound className="size-4" />
                )}
                Enregistrer et continuer
              </Button>
            </form>
          </div>

          <button
            onClick={logout}
            className="mx-auto mt-6 flex items-center gap-1.5 text-center text-xs text-muted-foreground hover:text-foreground"
          >
            <LogOut className="size-3.5" /> Se déconnecter
          </button>
        </div>
      </div>
    </div>
  );
}
