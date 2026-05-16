// src/components/menu/CategoryItem.tsx
"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { Category } from "@/types/category";

interface CategoryItemProps {
  category: Category;
}

export default function CategoryItem({ category }: CategoryItemProps) {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/menu/products?cat=${category._id}`);
  };

  // fallback image اگر عکس نداشت
  const imageUrl = category.image || "/food/default.png";

  return (
    <div
      onClick={handleClick}
      className="flex flex-col border-[1px] z-10 rounded-[10px] border-white/60 items-center gap-8 cursor-pointer hover:opacity-80 transition-opacity"
    >
      <div className="relative w-36 h-36">
        <Image
          src={imageUrl}
          fill
          className="rounded-full object-cover"
          alt={category.name}
          sizes="144px"
        />
      </div>
      <p className="text-white">{category.name}</p>
    </div>
  );
}
