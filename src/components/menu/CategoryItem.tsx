// src/components/menu/CategoryItem.tsx
"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { Category } from "@/types/category";

export default function CategoryItem({ title, image, name, _id }: Category) {
  const router = useRouter();

  const handleClick = () => {
    // بهتر است کمی تاخیر بدهیم تا کاربر انیمیشن کلیک را ببیند بعد صفحه عوض شود (اختیاری)
    setTimeout(() => {
      router.push(`/menu/products?cat=${_id}`);
    }, 150); 
  };

  const imageUrl = image || "/food/default.png";

  return (
    <div
      onClick={handleClick}
      // اضافه شدن active:scale-95 برای افکت فشردن دکمه در موبایل
      className="group relative flex flex-col overflow-hidden rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md shadow-lg cursor-pointer transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-orange-500/20 hover:border-white/20 active:scale-[0.96] active:shadow-orange-500/30 touch-manipulation"
    >
      <div className="relative w-full h-48 overflow-hidden">
        <Image
          src={imageUrl}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          // اضافه شدن group-active برای زوم شدن هنگام لمس
          className="object-cover transition-transform duration-500 ease-in-out group-hover:scale-110 group-active:scale-110"
          alt={name || title}
        />
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-80 transition-opacity duration-300 group-hover:opacity-100 group-active:opacity-100" />
      </div>

      {/* اضافه شدن group-active برای حرکت متن هنگام لمس */}
      <div className="absolute bottom-0 left-0 w-full p-5 transform transition-transform duration-300 translate-y-2 group-hover:translate-y-0 group-active:translate-y-0">
        <h3 className="text-xl font-bold text-white tracking-wide drop-shadow-lg">
          {title}
        </h3>
        {/* ظاهر شدن خط تزئینی هنگام لمس در موبایل */}
        <div className="w-12 h-1 mt-2 bg-orange-500 rounded-full opacity-0 transform -translate-x-4 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0 group-active:opacity-100 group-active:translate-x-0" />
      </div>
    </div>
  );
}
