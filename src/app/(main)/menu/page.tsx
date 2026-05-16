// src/app/menu/page.tsx
import Header from "@/components/layout/Header";
import CategoryGrid from "@/components/menu/CategoryGrid";
import Sidebar from "@/components/layout/Sidebar";
import { getCategories } from "@/services/categories";
import SessionInitializer from "@/components/menu/SessionInitializer";

async function page() {
  const categories = await getCategories();
  const activeCategories = categories.filter((cat) => cat.isActive);


  // const groupByTwo = (arr) => {
  //   let result = []
  //   for (let i = 0; i < arr.length; i += 2) {
  //     result.push((arr.slice(i, i + 2)))
  //   }
  //   return result
  // }

  // // console.log(categories)
  // const a = groupByTwo(categories)
  // // console.log(a)

  return (
    <>
      <SessionInitializer /> 
      <div className="flex flex-col  px-2  pb-10">
        <p className="text-white text-[26px]">Menu</p>
        <div>
          <CategoryGrid categories={categories} />
        </div>
      </div>
    </>
  );
}

export default page;
