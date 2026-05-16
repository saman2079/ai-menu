// src/components/admin/Sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  UtensilsCrossed,
  ShoppingBag,
  BarChart3,
  FolderTree,
  LogOut,
  QrCode,
  Users,
  Settings,
} from "lucide-react";

interface AdminPermissions {
  canManageMenu: boolean;
  canManageOrders: boolean;
  canManageReservations: boolean;
  canManageStaff: boolean;
  canViewReports: boolean;
  canManageSettings: boolean;
  canManageInventory: boolean;
  canManageCategories: boolean;
  canManageQRCodes: boolean;
}

interface Admin {
  _id: string;
  name: string;
  email: string;
  role: "owner" | "manager" | "staff";
  permissions: AdminPermissions;
  restaurant?: {
    name: string;
  };
}

interface SidebarLink {
  href: string;
  label: string;
  icon: any;
  permission?: keyof AdminPermissions;
}

export default function Sidebar({ admin }: { admin: Admin | null }) {
  const pathname = usePathname();

  const allLinks: SidebarLink[] = [
    { href: "/admin/dashboard", label: "داشبورد", icon: LayoutDashboard },
    {
      href: "/admin/menu",
      label: "منو",
      icon: UtensilsCrossed,
      permission: "canManageMenu",
    },
    {
      href: "/admin/categories",
      label: "دسته‌بندی‌ها",
      icon: FolderTree,
      permission: "canManageCategories",
    },
    {
      href: "/admin/orders",
      label: "سفارشات",
      icon: ShoppingBag,
      permission: "canManageOrders",
    },
    {
      href: "/admin/staff",
      label: "کارمندان",
      icon: Users,
      permission: "canManageStaff",
    },
    {
      href: "/admin/qr-codes",
      label: "QR کدها",
      icon: QrCode,
      permission: "canManageQRCodes",
    },
    {
      href: "/admin/reports",
      label: "گزارشات",
      icon: BarChart3,
      permission: "canViewReports",
    },
    {
      href: "/admin/settings",
      label: "تنظیمات",
      icon: Settings,
      permission: "canManageSettings",
    },
  ];

  // فیلتر کردن لینک‌ها بر اساس دسترسی
  const links = allLinks.filter((link) => {
    // اگه permission نداره، همه می‌تونن ببینن (مثل dashboard)
    if (!link.permission) return true;

    // owner همه چیز رو می‌بینه
    if (admin?.role === "owner") return true;

    // چک کردن permission
    return admin?.permissions?.[link.permission] === true;
  });

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_data");
    window.location.href = "/admin/login";
  };

  return (
    <aside className="md:w-64 bg-white border-l border-gray-200 flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-orange-600">
          {admin?.restaurant?.name || "رستوران"}
        </h1>
        <p className="text-sm text-gray-500 mt-1">{admin?.name}</p>
        <p className="text-xs text-gray-400 mt-1">
          {admin?.role === "owner"
            ? "مالک"
            : admin?.role === "manager"
            ? "مدیر"
            : "کارمند"}
        </p>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? "bg-orange-50 text-orange-600 font-medium"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{link.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-200">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 w-full text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span>خروج</span>
        </button>
      </div>
    </aside>
  );
}
