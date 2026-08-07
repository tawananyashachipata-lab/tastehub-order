import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { SiteLayout } from "@/components/SiteLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/lib/cart";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "Your cart — TasteHub Restaurant" },
      {
        name: "description",
        content: "Review the meals in your TasteHub cart and place your delivery order.",
      },
      { property: "og:title", content: "Your cart — TasteHub Restaurant" },
      { property: "og:description", content: "Review your meals and place your order." },
    ],
  }),
  component: CartPage,
});

function CartPage() {
  const { items, removeItem, setQuantity, total, clear } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [placing, setPlacing] = useState(false);

  async function placeOrder(e: React.FormEvent) {
    e.preventDefault();
    if (!user) {
      toast.error("Please sign in to place an order.");
      void navigate({ to: "/auth" });
      return;
    }
    setPlacing(true);

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        user_id: user.id,
        customer_name: name,
        phone,
        address,
        total,
      })
      .select("id")
      .single();

    if (orderError || !order) {
      setPlacing(false);
      toast.error(orderError?.message ?? "Could not place the order.");
      return;
    }

    const { error: itemsError } = await supabase.from("order_items").insert(
      items.map((i) => ({
        order_id: order.id,
        menu_item_id: i.id,
        name: i.name,
        price: i.price,
        quantity: i.quantity,
      })),
    );

    setPlacing(false);
    if (itemsError) {
      toast.error(itemsError.message);
      return;
    }

    clear();
    setName("");
    setPhone("");
    setAddress("");
    toast.success("Order placed! The kitchen is on it.");
  }

  return (
    <SiteLayout>
      <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6 sm:py-20">
        <h1 className="text-4xl font-bold sm:text-5xl">Your cart</h1>

        {items.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-border bg-card p-10 text-center">
            <p className="text-muted-foreground">Your cart is empty.</p>
            <Button asChild className="mt-6">
              <Link to="/menu">Browse the menu</Link>
            </Button>
          </div>
        ) : (
          <div className="mt-10 grid gap-8 lg:grid-cols-[1.4fr_1fr] lg:items-start">
            <ul className="space-y-4">
              {items.map((item) => (
                <li
                  key={item.id}
                  className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-4 rounded-2xl border border-border bg-card p-4"
                >
                  {item.image_url && (
                    <img
                      src={item.image_url}
                      alt={item.name}
                      loading="lazy"
                      width={1024}
                      height={768}
                      className="size-20 shrink-0 rounded-xl object-cover"
                    />
                  )}
                  <div className="min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <p className="min-w-0 truncate font-semibold">{item.name}</p>
                      <p className="shrink-0 font-semibold text-primary">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                    <p className="mt-0.5 text-sm text-muted-foreground">
                      ${item.price.toFixed(2)} each
                    </p>
                    <div className="mt-3 flex items-center gap-2">
                      <Button
                        size="icon"
                        variant="outline"
                        className="size-8"
                        aria-label="Decrease quantity"
                        onClick={() => setQuantity(item.id, item.quantity - 1)}
                      >
                        <Minus className="size-4" />
                      </Button>
                      <span className="w-6 text-center text-sm font-medium">{item.quantity}</span>
                      <Button
                        size="icon"
                        variant="outline"
                        className="size-8"
                        aria-label="Increase quantity"
                        onClick={() => setQuantity(item.id, item.quantity + 1)}
                      >
                        <Plus className="size-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="ml-auto size-8 text-destructive"
                        aria-label={`Remove ${item.name}`}
                        onClick={() => removeItem(item.id)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <form
              onSubmit={placeOrder}
              className="space-y-4 rounded-2xl border border-border bg-card p-6"
            >
              <div className="flex items-center justify-between text-lg">
                <span className="font-semibold">Total</span>
                <span className="font-display text-2xl font-bold text-primary">
                  ${total.toFixed(2)}
                </span>
              </div>

              {user ? (
                <>
                  <div className="space-y-1.5">
                    <Label htmlFor="name">Full name</Label>
                    <Input
                      id="name"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Alex Morgan"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+1 555 000 0000"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="address">Delivery address</Label>
                    <Textarea
                      id="address"
                      required
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="18 Harvest Lane, Riverside"
                    />
                  </div>
                  <Button type="submit" className="w-full" size="lg" disabled={placing}>
                    {placing ? "Placing order…" : "Place order"}
                  </Button>
                </>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Sign in to confirm your delivery details and place the order.
                  </p>
                  <Button asChild className="w-full" size="lg">
                    <Link to="/auth">Sign in to order</Link>
                  </Button>
                </div>
              )}
            </form>
          </div>
        )}
      </div>
    </SiteLayout>
  );
}
