import { Plus } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart";

export type Meal = {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  image_url: string | null;
  is_available: boolean;
};

export function MealCard({ meal }: { meal: Meal }) {
  const { addItem } = useCart();

  return (
    <article className="surface-card flex flex-col overflow-hidden rounded-2xl">
      <div className="relative aspect-4/3 overflow-hidden bg-muted">
        {meal.image_url ? (
          <img
            src={meal.image_url}
            alt={meal.name}
            loading="lazy"
            width={1024}
            height={768}
            className="size-full object-cover"
          />
        ) : (
          <div className="grid size-full place-items-center text-sm text-muted-foreground">
            No image
          </div>
        )}
        <span className="absolute left-3 top-3 rounded-full bg-background/90 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-secondary">
          {meal.category}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="min-w-0 font-display text-lg font-bold">{meal.name}</h3>
          <span className="shrink-0 font-semibold text-primary">${meal.price.toFixed(2)}</span>
        </div>
        <p className="flex-1 text-sm leading-relaxed text-muted-foreground">{meal.description}</p>
        <Button
          className="mt-3 w-full"
          disabled={!meal.is_available}
          onClick={() => {
            addItem({
              id: meal.id,
              name: meal.name,
              price: meal.price,
              image_url: meal.image_url,
            });
            toast.success(`${meal.name} added to cart`);
          }}
        >
          <Plus className="size-4" />
          {meal.is_available ? "Add to cart" : "Sold out"}
        </Button>
      </div>
    </article>
  );
}
