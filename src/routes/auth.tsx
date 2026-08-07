import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { SiteLayout } from "@/components/SiteLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in or register — TasteHub Restaurant" },
      {
        name: "description",
        content: "Create a TasteHub account or sign in with your email to order your favourite meals.",
      },
      { property: "og:title", content: "Sign in or register — TasteHub Restaurant" },
      { property: "og:description", content: "Create an account or sign in to order online." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState<"login" | "register">("login");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (user) void navigate({ to: "/" });
  }, [user, navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);

    if (mode === "register") {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: window.location.origin,
          data: { full_name: fullName },
        },
      });
      setBusy(false);
      if (error) {
        toast.error(error.message);
        return;
      }
      if (!data.session) {
        toast.success("Account created. Check your email to confirm it, then sign in.");
        setMode("login");
        return;
      }
      toast.success("Welcome to TasteHub!");
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      setBusy(false);
      if (error) {
        toast.error(error.message);
        return;
      }
      toast.success("Signed in.");
    }
  }

  return (
    <SiteLayout>
      <div className="mx-auto flex max-w-md flex-col px-4 py-16 sm:py-24">
        <div className="rounded-2xl border border-border bg-card p-7 shadow-sm">
          <h1 className="text-3xl font-bold">
            {mode === "login" ? "Welcome back" : "Create your account"}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {mode === "login"
              ? "Sign in with your email and password to order."
              : "It takes a few seconds — email and password only."}
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {mode === "register" && (
              <div className="space-y-1.5">
                <Label htmlFor="fullName">Full name</Label>
                <Input
                  id="fullName"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Alex Morgan"
                />
              </div>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                required
                minLength={6}
                autoComplete={mode === "login" ? "current-password" : "new-password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
              />
            </div>
            <Button type="submit" className="w-full" size="lg" disabled={busy}>
              {busy ? "Please wait…" : mode === "login" ? "Sign in" : "Create account"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            {mode === "login" ? "New to TasteHub?" : "Already have an account?"}{" "}
            <button
              type="button"
              className="font-semibold text-primary hover:underline"
              onClick={() => setMode(mode === "login" ? "register" : "login")}
            >
              {mode === "login" ? "Register" : "Sign in"}
            </button>
          </p>
        </div>
      </div>
    </SiteLayout>
  );
}
