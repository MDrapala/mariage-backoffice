import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, Loader2, Lock } from "lucide-react";
import { toast } from "sonner";

import { useAuth } from "@/contexts/AuthContext";
import { WEDDING } from "@/config/wedding";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ApiError } from "@/lib/api";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await login(username.trim(), password);
      toast.success("Bienvenue 🤍");
      navigate("/", { replace: true });
    } catch (err) {
      const msg =
        err instanceof ApiError ? err.message : "Connexion impossible.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-background">
      {/* halo décoratif */}
      <div className="pointer-events-none absolute -top-40 -right-40 size-[36rem] rounded-full bg-secondary/40 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -left-40 size-[32rem] rounded-full bg-[#a9b49a]/30 blur-3xl" />

      <div className="relative z-10 flex min-h-screen items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm">
              <Heart className="size-5" fill="currentColor" />
            </div>
            <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
              Back-office
            </p>
            <h1 className="font-display text-5xl leading-tight text-primary">
              {WEDDING.bride} &amp; {WEDDING.groom}
            </h1>
            <p className="mt-1 font-serif text-lg text-muted-foreground">
              Espace d'administration
            </p>
          </div>

          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Identifiant</Label>
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="username"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Mot de passe</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  required
                />
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={loading || !password}
              >
                {loading ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Lock className="size-4" />
                )}
                Se connecter
              </Button>
            </form>
          </div>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            Réservé aux mariés · {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </div>
  );
}
