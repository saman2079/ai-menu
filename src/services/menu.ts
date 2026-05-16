import type { MenuItem, Category } from "@/types/product";

export async function getMenuItems(categoryId?: string): Promise<{
  items: MenuItem[];
  categories: Category[];
}> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
  const url = categoryId 
    ? `${baseUrl}/api/menu?category=${categoryId}`
    : `${baseUrl}/api/menu`;

  const res = await fetch(url, { cache: "no-store" });

  if (!res.ok) {
    throw new Error("Failed to fetch menu items");
  }

  return res.json();
}
