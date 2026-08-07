import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Meal } from "@/components/MealCard";

async function fetchMenu(): Promise<Meal[]> {
  const { data, error } = await supabase
    .from("menu_items")
    .select("id, name, description, category, price, image_url, is_available")
    .order("category", { ascending: true })
    .order("name", { ascending: true });

  if (error) throw error;
  return (data ?? []).map((row) => ({ ...row, price: Number(row.price) }));
}

/** Shared query config so the menu is fetched the same way everywhere. */
export const menuQueryOptions = {
  queryKey: ["menu-items"],
  queryFn: fetchMenu,
};

export function useMenu() {
  return useQuery(menuQueryOptions);
}
