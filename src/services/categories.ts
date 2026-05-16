import { Category } from "@/types/category";

export async function getCategories(): Promise<Category[]> {
    try {

        const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/admin/categories`, {
            cache: "no-store"
        }
        );
          if (!res.ok) {
      console.error("Failed to fetch categories:", res.statusText);
      return [];
    }
        const data = await res.json()
        return data.categories || []
    }
    catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
}