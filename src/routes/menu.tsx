import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { MealCard } from "@/components/MealCard";
import { SiteLayout } from "@/components/SiteLayout";
import { Button } from "@/components/ui/button";
import { useMenu } from "@/lib/menu";

export const Route = createFileRoute("/menu")({
  head: () => ({
    meta: [
      { title: "Menu — TasteHub Restaurant" },
      {
        name: "description",
        content:
          "Browse the full TasteHub menu: starters, mains, desserts and drinks with prices and descriptions.",
      },
      { property: "og:title", content: "Menu — TasteHub Restaurant" },
      {
        property: "og:description",
        content: "Starters, mains, desserts and drinks from the TasteHub kitchen.",
      },
    ],
  }),
  component: MenuPage,
});

function MenuPage() {
  const { data: meals = [], isLoading, error } = useMenu();
  const [category, setCategory] = useState("All");

  const categories = ["All", ...Array.from(new Set(meals.map((m) => m.category)))];
  const visible = category === "All" ? meals : meals.filter((m) => m.category === category);

  return (
    <SiteLayout>
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
        <header className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">Our food</p>
          <h1 className="mt-3 text-4xl font-bold sm:text-5xl">The TasteHub menu</h1>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            Everything is made to order. Add what you like to your cart and check out when you're
            ready.
          </p>
        </header>

        <div className="mt-10 flex flex-wrap justify-center gap-2">
          {categories.map((c) => (
            <Button
              key={c}
              size="sm"
              variant={c === category ? "default" : "outline"}
              onClick={() => setCategory(c)}
            >
              {c}
            </Button>
          ))}
        </div>

        {error && (
          <p className="mt-10 text-center text-destructive">
            We couldn't load the menu. Please refresh and try again.
          </p>
        )}

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {isLoading
            ? Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-96 animate-pulse rounded-2xl bg-muted" />
              ))
            : visible.map((meal) => <MealCard key={meal.id} meal={meal} />)}
        </div>

        {!isLoading && visible.length === 0 && (
          <p className="mt-10 text-center text-muted-foreground">No dishes in this category yet.</p>
        )}
      </div>
    </SiteLayout>
  );
}
