// src/components/menu/CategoryGrid.tsx
"use client";

import { Category } from "@/types/category";
import CategoryItem from "./CategoryItem";

interface CategoryGridProps {
    categories: Category[];
}


export default function CategoryGrid({ categories }: CategoryGridProps) {

    console.log(categories)
    if (categories.length === 0) {
        return (
            <div className="text-white text-center mt-14">
                هیچ دسته‌بندی فعالی یافت نشد
            </div>
        );
    }


    return (
        <div className="grid grid-cols-2 gap-10 mt-14  px-3">
            {categories.map((category , i) => (
                <div className="relative "> 
                    {/* <div key={i} className="bg-[rgba(88,205,255,0.3)] -z-10 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-150 h-30 backdrop-blur-[1px] pointer-events-none z-[1] rotate-150"
                        style={{
                            maskImage:
                                "radial-gradient(ellipse, rgba(88,205,255,1) 0%, rgba(88,205,255,0) 40%)",
                            WebkitMaskImage:
                                "radial-gradient(ellipse,rgba(88,205,255,1) 0%, rgba(88,205,255,0) 40%)",
                        }} /> */}
                    
                    {category.map(item => (
                        <CategoryItem key={item._id} category={item} />
                    ))}
                </div>
            ))}
        </div>
    );
}
