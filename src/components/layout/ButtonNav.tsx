"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

export default function ButtonNav() {
  const pathname = usePathname();

  const links = [
    { id: 1, title: "منو کافه", icons: "/icons/home.svg", href: "/menu" },
    { id: 2, title: "دستیار هوشمند", icons: "/icons/ai.svg", href: "/ai" },
    { id: 3, title: "سفارش من", icons: "/icons/shop.svg", href: "/orders" },
  ];

  return (
    <div className="fixed bottom-2 left-1/2 -translate-x-1/2 w-full rounded-b-[5px] max-w-[420px] bg-white shadow-[0px_-2px_4.7px_0px_#00000021] z-50">
      <div className="flex justify-around items-center py-3 ">

        {links.map((item) => {
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.id}
              href={item.href}
              className="relative flex flex-col items-center justify-center px-3.5 py-2.5 gap-1"
            >
              {/* 🔥 Smooth moving pill */}
              {isActive && (
                <motion.div
                  layoutId="active-pill"
                  className="absolute inset-0 bg-[#201F20] scale-110 rounded-[27px]"
                  transition={{
                    type: "spring",
                    stiffness: 500,
                    damping: 35,
                  }}
                />
              )}

              <div className="relative z-10 flex flex-col items-center gap-1">
                <Image
                  src={item.icons}
                  alt=""
                  width={22}
                  height={22}
                  className={`transition-all duration-200 ${
                    isActive ? "brightness-0 invert" : "opacity-50"
                  }`}
                />

                <p
                  className={`text-[10px] transition-all duration-200 ${
                    isActive ? "text-white" : "text-[#858689]"
                  }`}
                >
                  {item.title}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}