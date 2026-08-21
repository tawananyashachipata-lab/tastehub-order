import { Link } from "@tanstack/react-router";
import { Menu, ShoppingBag, UtensilsCrossed, X } from "lucide-react";
import { useState, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/lib/cart";

const navLinks = [
  { to: "/", label: "Home" },
  { to: "/menu", label: "Menu" },
  { to: "/contact", label: "Contact" },
] as const;

export function SiteLayout({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const { count } = useCart();
  const { user, isAdmin, signOut } = useAuth();

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 border-b border-border/70 bg-background/90 backdrop-blur">
        <div className="mx-auto grid max-w-6xl grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-4 py-3 sm:px-6">
          <Link to="/" className="flex min-w-0 items-center gap-2">
            <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-gradient-warm text-primary-foreground">
              <UtensilsCrossed className="size-5" />
            </span>
            <span className="truncate font-display text-xl font-bold">TasteHub</span>
          </Link>

          <div className="flex items-center gap-1">
            <nav className="mr-2 hidden items-center gap-1 md:flex">
              {navLinks.map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  activeOptions={{ exact: l.to === "/" }}
                  activeProps={{ className: "text-primary" }}
                  className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
                >
                  {l.label}
                </Link>
              ))}
              {isAdmin && (
                <Link
                  to="/admin"
                  activeProps={{ className: "text-primary" }}
                  className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
                >
                  Admin
                </Link>
              )}
            </nav>

            <Link to="/cart" className="relative rounded-md p-2 hover:bg-accent" aria-label="Cart">
              <ShoppingBag className="size-5" />
              {count > 0 && (
                <span className="absolute -right-0.5 -top-0.5 grid size-5 place-items-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground">
                  {count}
                </span>
              )}
            </Link>

            {user ? (
              <Button variant="outline" size="sm" className="hidden sm:inline-flex" onClick={signOut}>
                Sign out
              </Button>
            ) : (
              <Button asChild size="sm" className="hidden sm:inline-flex">
                <Link to="/auth">Sign in</Link>
              </Button>
            )}

            <button
              className="rounded-md p-2 hover:bg-accent md:hidden"
              onClick={() => setOpen((v) => !v)}
              aria-label="Toggle navigation"
            >
              {open ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </div>

        {open && (
          <nav className="border-t border-border bg-background px-4 py-3 md:hidden">
            <div className="flex flex-col gap-1">
              {navLinks.map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  onClick={() => setOpen(false)}
                  className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent"
                >
                  {l.label}
                </Link>
              ))}
              {isAdmin && (
                <Link
                  to="/admin"
                  onClick={() => setOpen(false)}
                  className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent"
                >
                  Admin
                </Link>
              )}
              {user ? (
                <button
                  onClick={() => {
                    setOpen(false);
                    void signOut();
                  }}
                  className="rounded-md px-3 py-2 text-left text-sm font-medium text-muted-foreground hover:bg-accent"
                >
                  Sign out
                </button>
              ) : (
                <Link
                  to="/auth"
                  onClick={() => setOpen(false)}
                  className="rounded-md px-3 py-2 text-sm font-medium text-primary hover:bg-accent"
                >
                  Sign in
                </Link>
              )}
            </div>
          </nav>
        )}
      </header>

      <main className="flex-1">{children}</main>

      <footer className="mt-20 bg-espresso text-espresso-foreground">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-3">
          <div>
            <h3 className="font-display text-xl font-bold">TasteHub Restaurant</h3>
            <p className="mt-2 max-w-xs text-sm opacity-70">
              Slow-cooked classics and wood-fired favourites, served warm .
            </p>
          </div>
          <div className="text-sm">
            <p className="font-semibold">Opening hours</p>
            <p className="mt-2 opacity-70">Mon – Thu · 11:00 – 22:00</p>
            <p className="opacity-70">Fri – Sun · 11:00 – 23:30</p>
          </div>
          <div className="text-sm">
            <p className="font-semibold">Find us</p>
            <p className="mt-2 opacity-70">18 Harvest Lane, Riverside</p>
            <p className="opacity-70">tawananyashachipata@gmail.com</p>
            <p className="opacity-70">+263718676637</p>
          </div>
        </div>
        <div className="border-t border-espresso-foreground/10 px-4 py-4 text-center text-xs opacity-60">
          © {new Date().getFullYear()} TasteHub Restaurant. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
