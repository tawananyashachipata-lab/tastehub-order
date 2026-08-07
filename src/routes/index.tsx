import { createFileRoute, Link } from "@tanstack/react-router";
import { ChefHat, Clock, Leaf } from "lucide-react";

import heroImage from "@/assets/hero.jpg";
import { MealCard } from "@/components/MealCard";
import { SiteLayout } from "@/components/SiteLayout";
import { Button } from "@/components/ui/button";
import { useMenu } from "@/lib/menu";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "TasteHub Restaurant — Wood-fired classics, ordered online" },
      {
        name: "description",
        content:
          "TasteHub serves flame-grilled steaks, wood-fired pizza and handmade pasta. Browse the menu and order for delivery in minutes.",
      },
      { property: "og:title", content: "TasteHub Restaurant" },
      {
        property: "og:description",
        content: "Flame-grilled steaks, wood-fired pizza and handmade pasta, ordered online.",
      },
    ],
  }),
  component: HomePage,
});

const highlights = [
  {
    icon: ChefHat,
    title: "Chef-led kitchen",
    text: "Every plate is finished by hand, à la minute, by our head chef and team.",
  },
  {
    icon: Leaf,
    title: "Market ingredients",
    text: "We shop the farmers' market twice a week so the menu follows the season.",
  },
  {
    icon: Clock,
    title: "35-minute delivery",
    text: "Order online and we'll have it warm at your door across the riverside.",
  },
];

function HomePage() {
  const { data: meals = [], isLoading } = useMenu();
  const featured = meals.slice(0, 3);

  return (
    <SiteLayout>
      {/* Hero */}
      <section className="relative isolate overflow-hidden">
        <img
          src={heroImage}
          alt="Grilled steak served by candlelight at TasteHub"
          width={1600}
          height={1008}
          className="absolute inset-0 -z-10 size-full object-cover"
        />
        <div className="absolute inset-0 -z-10 bg-espresso/72" />
        <div className="mx-auto max-w-6xl px-4 py-24 sm:px-6 sm:py-32 lg:py-40">
          <div className="max-w-2xl text-espresso-foreground">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">
              Riverside · Since 2014
            </p>
            <h1 className="mt-4 text-4xl font-bold leading-tight sm:text-6xl">
              Honest food, cooked over real fire.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed opacity-85 sm:text-lg">
              TasteHub is a neighbourhood kitchen built around a wood oven and a charcoal grill.
              Browse tonight's menu, build your order, and we'll bring it to the table or your door.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link to="/menu">View the menu</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <div className="grid gap-10 md:grid-cols-[1.1fr_1fr] md:items-center">
          <div>
            <h2 className="text-3xl font-bold sm:text-4xl">A kitchen you can taste</h2>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              We started with twelve seats, one oven and a short handwritten menu. A decade later the
              approach hasn't changed: a small list of dishes, cooked properly, using produce we can
              trace. Nothing arrives frozen, nothing sits under a lamp.
            </p>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              Whether you're eating in the dining room or ordering to your sofa, it's the same food,
              from the same pass.
            </p>
          </div>
          <div className="grid gap-4">
            {highlights.map((h) => (
              <div key={h.title} className="flex gap-4 rounded-2xl border border-border bg-card p-5">
                <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-accent text-accent-foreground">
                  <h.icon className="size-5" />
                </span>
                <div className="min-w-0">
                  <h3 className="font-display text-lg font-bold">{h.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{h.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured meals */}
      <section className="bg-cream py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4">
            <div className="min-w-0">
              <h2 className="text-3xl font-bold sm:text-4xl">Featured this week</h2>
              <p className="mt-2 text-muted-foreground">Three plates the kitchen is proud of.</p>
            </div>
            <Button asChild variant="outline">
              <Link to="/menu">Full menu</Link>
            </Button>
          </div>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {isLoading
              ? Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-96 animate-pulse rounded-2xl bg-muted" />
                ))
              : featured.map((meal) => <MealCard key={meal.id} meal={meal} />)}
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
