// src/components/products/ProductsContent.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import ProductCard from "@/components/products/ProductCard";
import FilterBar from "./FilterBar";
import type { Category } from "@/types/product";

const HEADER_HEIGHT = 100;
const SEARCH_AREA_HEIGHT = 110;

interface Props {
  groupedItems: Record<string, { name: string; items: any[] }>;
  categories: Category[];
}

export default function ProductsContent({ groupedItems, categories }: Props) {
  const searchParams = useSearchParams();
  const activeCat = searchParams.get("cat");

  const [visibleCat, setVisibleCat] = useState<string | null>(activeCat);
  const isScrollingProgrammatically = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!activeCat || !containerRef.current) return;

    setVisibleCat(activeCat);

    const el = document.getElementById(`cat-${activeCat}`);
    if (!el) return;

    isScrollingProgrammatically.current = true;

    const container = containerRef.current;
    const containerRect = container.getBoundingClientRect();
    const elementRect = el.getBoundingClientRect();
    const targetScroll =
      container.scrollTop + elementRect.top - containerRect.top - 20;

    container.scrollTo({
      top: targetScroll,
      behavior: "smooth",
    });

    const timeout = setTimeout(() => {
      isScrollingProgrammatically.current = false;
    }, 900);

    return () => clearTimeout(timeout);
  }, [activeCat]);

  // Manual scroll observer
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (isScrollingProgrammatically.current) return;

        const entriesSorted = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

        if (entriesSorted.length > 0) {
          const topSection = entriesSorted[0];
          const catId = topSection.target.id.replace("cat-", "");
          setVisibleCat(catId);
        }
      },
      {
        root: container,
        threshold: [0, 0.1, 0.2, 0.3],
        rootMargin: "-20% 0px -70% 0px",
      }
    );

    const sections = document.querySelectorAll('[id^="cat-"]');
    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, []);

  return (
    <>
      <FilterBar
        categories={categories}
        activeCat={visibleCat}
      />

      <div
        ref={containerRef}
        className="overflow-y-auto no-scrollbar flex flex-col gap-8 pb-20 "
        style={{
          marginTop: `${HEADER_HEIGHT + SEARCH_AREA_HEIGHT}px`,
        }}
      >
        {Object.entries(groupedItems).map(([catId, data]) => (
          <div key={catId} id={`cat-${catId}`} className="flex flex-col gap-4">
            <p className="text-center text-white text-2xl capitalize">
              {data.name}
            </p>

            {data.items.map((item) => (
              <ProductCard key={item._id} item={item} />
            ))}
          </div>
        ))}
      </div>
    </>
  );
}
