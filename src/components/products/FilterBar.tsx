// src/components/products/FilterBar.tsx
"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import type { Category } from "@/types/product";

const HEADER_HEIGHT = 70;

interface Props {
  categories: Category[];
  activeCat?: string | null;
}

export default function FilterBar({ categories, activeCat }: Props) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const handleCategoryClick = (catId: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("cat", catId);

    router.replace(`/menu/products?${params.toString()}`, { scroll: false });
  };

  useEffect(() => {
    if (!activeCat || !scrollContainerRef.current) return;

    const activeButton = scrollContainerRef.current.querySelector(
      `[data-cat-id="${activeCat}"]`
    ) as HTMLElement;

    if (activeButton) {
      activeButton.scrollIntoView({
        behavior: "smooth",
        inline: "center",
        block: "nearest",
      });
    }
  }, [activeCat]);

  return (
    <div
      className="fixed  z-40 w-full max-w-[450px] "
      style={{ top: `${HEADER_HEIGHT}px` }}
    >
      <div className="px-4 py-4">
        <input
          placeholder="Search..."
          className="w-full h-[55px] rounded-xl bg-[#B1B1B1]/20 border border-[#B1B1B1]/40 px-4 text-white outline-none mb-2"
        />

        <div
          ref={scrollContainerRef}
          className="flex gap-4 overflow-x-scroll no-scrollbar px-2 py-3"
        >
          {categories.map((cat) => {
            const isActive = activeCat === cat._id;

            return (
              <button
                key={cat._id}
                data-cat-id={cat._id}
                onClick={() => handleCategoryClick(cat._id)}
                className={`whitespace-nowrap transition-colors duration-300 pb-1 ${
                  isActive
                    ? "border-b-2 border-white text-white "
                    : "text-[#707070]"
                }`}
              >
                {cat.name}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
