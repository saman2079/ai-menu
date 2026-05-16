"use client";

import Sidebar from "@/components/admin/Sidebar";
import QueryProvider from "@/providers/query-provider";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const pathname = usePathname();
    const [admin, setAdmin] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem("admin_token");
        const adminData = localStorage.getItem("admin_data");

        if (!token && pathname !== "/admin/login") {
            router.push("/admin/login");
            return;
        }

        if (adminData) {
            setAdmin(JSON.parse(adminData));
        }

        setLoading(false);
    }, [pathname, router]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
            </div>
        );
    }

    if (pathname === "/admin/login") {
        return <>{children}</>;
    }

    return (
        <div className="md:min-h-screen w-full bg-gray-50 md:flex text-black" dir="rtl">
            <Sidebar admin={admin} />
            <div className="flex-1 flex flex-col">
                <main className="flex-1 p-6 overflow-y-auto">
                    <QueryProvider>
                        {children}
                    </QueryProvider>
                </main>
            </div>
        </div>
    );
}
