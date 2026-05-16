export const dynamic = "force-dynamic";

import Header from "@/components/layout/Header";
import CategoryGrid from "@/components/menu/CategoryGrid";
import Sidebar from "@/components/layout/Sidebar";
import { getCategories } from "@/services/categories";
import SessionInitializer from "@/components/menu/SessionInitializer";

async function page() {
  const categories = await getCategories();
  const activeCategories = categories.filter((cat) => cat.isActive);

  return (
    <>
      <SessionInitializer />
      <div className="flex flex-col px-2 pb-10">
        <p className="text-white text-[26px]">Menu</p>

        <div>
          <CategoryGrid categories={categories} />
        </div>
      </div>
    </>
  );
}

export default page;