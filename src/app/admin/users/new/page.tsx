// src/app/admin/users/new/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function NewUserPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const [formData, setFormData] = useState({
        name: "",
        email: "admin@gamil.com",
        password: "",
        role: "staff",
        permissions: {
            canManageMenu: false,
            canManageCategories: false,
            canManageOrders: false,
            canManageUsers: false,
            canViewReports: false,
            canManageSettings: false,
        },
    });

    const token = localStorage.getItem("admin_token");

    console.log(token)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        // try {
            const token = localStorage.getItem("admin_token");
            if (!token) {
                router.push("/admin/login");
                return;
            }

            const response = await fetch("/api/admin/users", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "خطا در ایجاد کاربر");
            }

            alert("کاربر با موفقیت ایجاد شد");
            router.push("/admin/users");
        // } catch (err: any) {
        //     setError(err.message);
        // } finally {
        //     setLoading(false);
        // }
    };

    const handlePermissionChange = (permission: string) => {
        setFormData({
            ...formData,
            permissions: {
                ...formData.permissions,
                [permission]: !formData.permissions[permission as keyof typeof formData.permissions],
            },
        });
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6" dir="rtl">
            <div className="max-w-3xl mx-auto">
                {/* هدر */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <div className="flex items-center gap-4">
                        <Link
                            href="/admin/users"
                            className="text-gray-600 hover:text-gray-900"
                        >
                            ← بازگشت
                        </Link>
                        <h1 className="text-2xl font-bold text-gray-900">
                            افزودن کاربر جدید
                        </h1>
                    </div>
                </div>

                {/* فرم */}
                <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-6">
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                            {error}
                        </div>
                    )}

                    {/* اطلاعات پایه */}
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                نام کامل *
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.name}
                                onChange={(e) =>
                                    setFormData({ ...formData, name: e.target.value })
                                }
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="نام و نام خانوادگی"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                ایمیل *
                            </label>
                            <input
                                type="email"
                                required
                                value={formData.email}
                                onChange={(e) =>
                                    setFormData({ ...formData, email: e.target.value })
                                }
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="example@domain.com"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                رمز عبور *
                            </label>
                            <input
                                type="password"
                                required
                                value={formData.password}
                                onChange={(e) =>
                                    setFormData({ ...formData, password: e.target.value })
                                }
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="حداقل 6 کاراکتر"
                                minLength={6}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                نقش *
                            </label>
                            <select
                                value={formData.role}
                                onChange={(e) =>
                                    setFormData({ ...formData, role: e.target.value })
                                }
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="staff">کارمند</option>
                                <option value="manager">مدیر</option>
                                <option value="admin">مدیر کل</option>
                                <option value="viewer">بازدیدکننده</option>
                            </select>
                        </div>
                    </div>

                    {/* دسترسی‌ها */}
                    <div className="mt-8">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            دسترسی‌ها
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.permissions.canManageMenu}
                                    onChange={() => handlePermissionChange("canManageMenu")}
                                    className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                                />
                                <div>
                                    <div className="font-medium text-gray-900">مدیریت منو</div>
                                    <div className="text-sm text-gray-500">
                                        افزودن، ویرایش و حذف آیتم‌های منو
                                    </div>
                                </div>
                            </label>

                            <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.permissions.canManageCategories}
                                    onChange={() => handlePermissionChange("canManageCategories")}
                                    className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                                />
                                <div>
                                    <div className="font-medium text-gray-900">
                                        مدیریت دسته‌بندی‌ها
                                    </div>
                                    <div className="text-sm text-gray-500">
                                        ایجاد و ویرایش دسته‌بندی‌ها
                                    </div>
                                </div>
                            </label>

                            <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.permissions.canManageOrders}
                                    onChange={() => handlePermissionChange("canManageOrders")}
                                    className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                                />
                                <div>
                                    <div className="font-medium text-gray-900">مدیریت سفارشات</div>
                                    <div className="text-sm text-gray-500">
                                        مشاهده و مدیریت سفارشات
                                    </div>
                                </div>
                            </label>

                            <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.permissions.canManageUsers}
                                    onChange={() => handlePermissionChange("canManageUsers")}
                                    className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                                />
                                <div>
                                    <div className="font-medium text-gray-900">مدیریت کاربران</div>
                                    <div className="text-sm text-gray-500">
                                        افزودن و ویرایش کاربران
                                    </div>
                                </div>
                            </label>

                            <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.permissions.canViewReports}
                                    onChange={() => handlePermissionChange("canViewReports")}
                                    className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                                />
                                <div>
                                    <div className="font-medium text-gray-900">مشاهده گزارشات</div>
                                    <div className="text-sm text-gray-500">
                                        دسترسی به گزارشات و آمار
                                    </div>
                                </div>
                            </label>

                            <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.permissions.canManageSettings}
                                    onChange={() => handlePermissionChange("canManageSettings")}
                                    className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                                />
                                <div>
                                    <div className="font-medium text-gray-900">مدیریت تنظیمات</div>
                                    <div className="text-sm text-gray-500">
                                        تغییر تنظیمات سیستم
                                    </div>
                                </div>
                            </label>
                        </div>
                    </div>

                    {/* دکمه‌ها */}
                    <div className="flex gap-4 mt-8">
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? "در حال ایجاد..." : "ایجاد کاربر"}
                        </button>
                        <Link
                            href="/admin/users"
                            className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-center"
                        >
                            انصراف
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
