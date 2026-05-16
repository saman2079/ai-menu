"use client";

import { Bell, Search } from "lucide-react";

export default function Header({ admin }: { admin: any }) {
    return (
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4 flex-1 max-w-xl">
                <div className="relative flex-1">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="جستجو..."
                        className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                </div>
            </div>

            <div className="flex items-center gap-4">
                {/* <button className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                    <Bell className="w-6 h-6" />
                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                </button> */}

                <div className="flex items-center gap-3">
                    <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">{admin?.name}</p>
                        <p className="text-xs text-gray-500">{admin?.role === "admin" ? "مدیر" : "کارمند"}</p>
                    </div>
                    <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold">
                        {admin?.name?.charAt(0) || "A"}
                    </div>
                </div>
            </div>
        </header>
    );
}
