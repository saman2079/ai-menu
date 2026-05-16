"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUIStore } from "@/app/hooks/uiStore";

export default function Header() {
  const pathname = usePathname();

  const isSidebarOpen = useUIStore((s) => s.isSidebarOpen);
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);
  const activeSection = useUIStore((s) => s.activeSection);
  const toggleActiveSection = useUIStore((s) => s.toggleActiveSection);

  if (pathname === "/ai") {
    return (
      <div className="max-w-[450px] w-full flex justify-between px-6 pt-2 items-center h-[55px] fixed top-0 z-40">

        <div className="absolute inset-0 h-[120px] -z-10 bg-gradient-to-b from-black/100 to-black/0" />

        <button className="flex gap-5">
          <Image
            width={25}
            height={20}
            src={"/icons/sidebar.svg"}
            alt="sidebar"
            onClick={toggleSidebar}
            className="cursor-pointer"
          />
          <p className="text-[25px] text-white">Logo</p>
        </button>

        <button onClick={toggleActiveSection}>
          <Image
            width={30}
            height={30}
            src={activeSection === "chat" ? "/stream.png" : "/icons/menu.svg"}
            alt="switch"
            className="mr-3"
          />
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[450px] flex justify-between px-8 pt-4 items-center h-[55px] fixed top-0  z-40">
      <div className="absolute top-0 left-0 w-full h-[120px] -z-10 bg-gradient-to-b from-black/100 to-black/0" />

      <span className="flex gap-5">
        <Image
          width={25}
          height={20}
          src={"/icons/sidebar.svg"}
          alt="sidebar"
          onClick={toggleSidebar}
          className="cursor-pointer"
        />
        <p className="text-[25px] text-white">Logo</p>
      </span>

      <Link href={"/ai"}>
        <Image width={30} height={30} src={"/stream.png"} alt="ai" />
      </Link>
    </div>
  );
}
