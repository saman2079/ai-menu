// src/app/(main)/menu/products/page.tsx
import ProductsContent from "@/components/products/ProductsContent";
import { getMenuItems } from "@/services/menu";

interface Props {
  searchParams: Promise<{ cat?: string }>;
}

export default async function ProductsPage({ searchParams }: Props) {
  const params = await searchParams;
  const { items, categories } = await getMenuItems(searchParams.cat);

  const groupedItems = items.reduce(
    (acc, item) => {
      const catId = item.category._id;
      if (!acc[catId])
        acc[catId] = {
          name: item.category.name,
          items: [],
        };
      acc[catId].items.push(item);
      return acc;
    },
    {} as Record<string, { name: string; items: typeof items }>,
  );

  return (
    <div className="h-[100dvh] w-full flex flex-col overflow-hidden relative gap-8">
      <ProductsContent groupedItems={groupedItems} categories={categories} />
    </div>
  );
}
