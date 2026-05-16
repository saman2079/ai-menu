"use client";

import Image from "next/image";
import Link from "next/link";
import { useUIStore } from "@/app/hooks/uiStore";

export default function Sidebar() {
  const isSidebarOpen = useUIStore((s) => s.isSidebarOpen);
  const closeSidebar = useUIStore((s) => s.closeSidebar);

  return (
    <>
      {isSidebarOpen && (
        <div
          onClick={closeSidebar}
          className="fixed inset-0 bg-black/40 z-50"
        />
      )}

      <div
        className={`fixed top-0 left-0 h-full w-[260px] bg-[#111] z-50 transform transition-transform duration-300
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="w-full h-full py-30 relative">
          <button
            onClick={closeSidebar}
            className="w-[25px] absolute right-6 top-7"
          >
            <Image
              width={25}
              height={20}
              src={"/icons/sidebar.svg"}
              alt="sidebar"
            />
          </button>
          <div className="p-6 flex flex-col gap-6 text-white">
            <Link href="/" onClick={closeSidebar}>Home</Link>
            <Link href="/menu" onClick={closeSidebar}>Menu</Link>
            <Link href="/ai" onClick={closeSidebar}>Chat/Assistant</Link>
            <Link href="/orders" onClick={closeSidebar}>My Orders</Link>
            <Link href="/about" onClick={closeSidebar}>About</Link>
          </div>
        </div>
      </div>
    </>
  );
}
