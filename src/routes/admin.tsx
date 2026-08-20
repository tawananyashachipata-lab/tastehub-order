import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { SiteLayout } from "@/components/SiteLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useMenu } from "@/lib/menu";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin dashboard — TasteHub Restaurant" },
      { name: "description", content: "Manage TasteHub menu items and review incoming orders." },
      { property: "og:title", content: "Admin dashboard — TasteHub Restaurant" },
      { property: "og:description", content: "Manage menu items and review incoming orders." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminPage,
});

type FormState = {
  id: string | null;
  name: string;
  description: string;
  category: string;
  price: string;
  image_url: string;
};

const emptyForm: FormState = {
  id: null,
  name: "",
  description: "",
  category: "Mains",
  price: "",
  image_url: "",
};

function AdminPage() {
  const { user, isAdmin, roles, dbStatus, loading, refreshRole, promoteToAdmin } = useAuth();
  const [rechecking, setRechecking] = useState(false);

  if (loading) {
    return (
      <SiteLayout>
        <div className="mx-auto max-w-3xl px-4 py-24 text-center text-muted-foreground">
          Checking your access…
        </div>
      </SiteLayout>
    );
  }

  if (!user || !isAdmin) {
    return (
      <SiteLayout>
        <div className="mx-auto max-w-md px-4 py-24 text-center">
          <h1 className="text-3xl font-bold">Restricted area</h1>
          <p className="mt-3 text-muted-foreground">
            This dashboard is for restaurant staff. {user ? "Your account isn't an admin yet." : ""}
          </p>

          {user && (
            <div className="mt-6 space-y-4">
              <div className="rounded-xl border border-border bg-card p-4 text-left text-xs">
                <p className="font-semibold text-foreground">Signed-in Account:</p>
                <p className="mt-1 text-muted-foreground">
                  <span className="font-medium text-foreground">Email:</span> {user.email}
                </p>
                <p className="mt-1 font-mono text-[11px] text-muted-foreground">
                  <span className="font-sans font-medium text-foreground">User ID:</span> {user.id}
                </p>
                <p className="mt-1 text-muted-foreground">
                  <span className="font-medium text-foreground">Database Status:</span>{" "}
                  <span className="font-mono font-medium text-primary">
                    {dbStatus ?? (roles.length > 0 ? `[ ${roles.join(", ")} ]` : "[ none ]")}
                  </span>
                </p>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row">
                <Button
                  className="flex-1"
                  disabled={rechecking}
                  onClick={async () => {
                    setRechecking(true);
                    const res = await promoteToAdmin();
                    setRechecking(false);
                    if (res.success) {
                      toast.success(res.message);
                    } else {
                      toast.error(res.message);
                    }
                  }}
                >
                  {rechecking ? "Applying…" : "Grant My Account Admin"}
                </Button>

                <Button
                  variant="outline"
                  className="flex-1"
                  disabled={rechecking}
                  onClick={async () => {
                    setRechecking(true);
                    const result = await refreshRole();
                    setRechecking(false);
                    if (result.isAdmin) {
                      toast.success("Admin role confirmed! Unlocking dashboard...");
                    } else {
                      toast.error(`Database response: ${result.status}`);
                    }
                  }}
                >
                  {rechecking ? "Checking…" : "Re-check access"}
                </Button>
              </div>
            </div>
          )}

          {!user && (
            <Button asChild className="mt-6">
              <Link to="/auth">Sign in</Link>
            </Button>
          )}
        </div>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
        <h1 className="text-4xl font-bold sm:text-5xl">Admin dashboard</h1>
        <p className="mt-2 text-muted-foreground">Manage the menu and keep an eye on orders.</p>

        <Tabs defaultValue="menu" className="mt-10">
          <TabsList>
            <TabsTrigger value="menu">Menu items</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
          </TabsList>
          <TabsContent value="menu" className="mt-6">
            <MenuManager />
          </TabsContent>
          <TabsContent value="orders" className="mt-6">
            <OrdersTable />
          </TabsContent>
        </Tabs>
      </div>
    </SiteLayout>
  );
}

function MenuManager() {
  const { data: meals = [] } = useMenu();
  const queryClient = useQueryClient();
  const [form, setForm] = useState<FormState>(emptyForm);

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["menu-items"] });

  const save = useMutation({
    mutationFn: async (values: FormState) => {
      const payload = {
        name: values.name,
        description: values.description,
        category: values.category,
        price: Number(values.price),
        image_url: values.image_url || null,
      };
      const { error } = values.id
        ? await supabase.from("menu_items").update(payload).eq("id", values.id)
        : await supabase.from("menu_items").insert(payload);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success(form.id ? "Menu item updated." : "Menu item added.");
      setForm(emptyForm);
      void invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("menu_items").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Menu item deleted.");
      void invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_1.3fr] lg:items-start">
      <form
        className="space-y-4 rounded-2xl border border-border bg-card p-6"
        onSubmit={(e) => {
          e.preventDefault();
          save.mutate(form);
        }}
      >
        <h2 className="font-display text-xl font-bold">
          {form.id ? "Edit menu item" : "Add menu item"}
        </h2>
        <div className="space-y-1.5">
          <Label htmlFor="m-name">Name</Label>
          <Input
            id="m-name"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="m-desc">Description</Label>
          <Textarea
            id="m-desc"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="m-cat">Category</Label>
            <Input
              id="m-cat"
              required
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="m-price">Price</Label>
            <Input
              id="m-price"
              type="number"
              step="0.01"
              min="0"
              required
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="m-img">Image URL</Label>
          <Input
            id="m-img"
            value={form.image_url}
            placeholder="/images/steak.jpg"
            onChange={(e) => setForm({ ...form, image_url: e.target.value })}
          />
        </div>
        <div className="flex gap-2">
          <Button type="submit" disabled={save.isPending}>
            {form.id ? "Save changes" : "Add item"}
          </Button>
          {form.id && (
            <Button type="button" variant="outline" onClick={() => setForm(emptyForm)}>
              Cancel
            </Button>
          )}
        </div>
      </form>

      <ul className="space-y-3">
        {meals.map((meal) => (
          <li
            key={meal.id}
            className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 rounded-2xl border border-border bg-card p-4"
          >
            <div className="min-w-0">
              <p className="truncate font-semibold">{meal.name}</p>
              <p className="text-sm text-muted-foreground">
                {meal.category} · ${meal.price.toFixed(2)}
              </p>
            </div>
            <div className="flex shrink-0 gap-1">
              <Button
                size="icon"
                variant="outline"
                aria-label={`Edit ${meal.name}`}
                onClick={() =>
                  setForm({
                    id: meal.id,
                    name: meal.name,
                    description: meal.description,
                    category: meal.category,
                    price: String(meal.price),
                    image_url: meal.image_url ?? "",
                  })
                }
              >
                <Pencil className="size-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="text-destructive"
                aria-label={`Delete ${meal.name}`}
                onClick={() => remove.mutate(meal.id)}
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function OrdersTable() {
  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("id, customer_name, phone, address, total, status, created_at, order_items(name, quantity)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  if (isLoading) return <p className="text-muted-foreground">Loading orders…</p>;
  if (orders.length === 0) return <p className="text-muted-foreground">No orders yet.</p>;

  return (
    <ul className="space-y-4">
      {orders.map((order) => (
        <li key={order.id} className="rounded-2xl border border-border bg-card p-5">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4">
            <div className="min-w-0">
              <p className="truncate font-semibold">{order.customer_name}</p>
              <p className="text-sm text-muted-foreground">
                {order.phone} · {order.address}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {new Date(order.created_at).toLocaleString()}
              </p>
            </div>
            <div className="shrink-0 text-right">
              <p className="font-display text-lg font-bold text-primary">
                ${Number(order.total).toFixed(2)}
              </p>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                {order.status}
              </p>
            </div>
          </div>
          <ul className="mt-3 border-t border-border pt-3 text-sm text-muted-foreground">
            {order.order_items.map((item, i) => (
              <li key={i}>
                {item.quantity} × {item.name}
              </li>
            ))}
          </ul>
        </li>
      ))}
    </ul>
  );
}