// src/app/admin/users/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  UserPlus,
  Pencil,
  Trash2,
  X,
  Shield,
  CheckCircle,
  XCircle,
  Loader2,
} from "lucide-react";

// ---------- TypeScript Interfaces ----------
interface IPermissions {
  canManageMenu: boolean;
  canManageCategories: boolean;
  canManageOrders: boolean;
  canManageUsers: boolean;
  canViewReports: boolean;
  canManageSettings: boolean;
}

interface IUser {
  _id: string;
  name: string;
  email: string;
  role: string;
  permissions: IPermissions;
  isActive: boolean;
  createdAt: string;
}

interface IFormData {
  name: string;
  email: string;
  password: string;
  role: string;
  permissions: IPermissions;
}

// ---------- Role Permission Templates ----------
const roleTemplates: Record<string, IPermissions> = {
  admin: {
    canManageMenu: true,
    canManageCategories: true,
    canManageOrders: true,
    canManageUsers: true,
    canViewReports: true,
    canManageSettings: true,
  },
  manager: {
    canManageMenu: true,
    canManageCategories: true,
    canManageOrders: true,
    canManageUsers: false,
    canViewReports: true,
    canManageSettings: false,
  },
  staff: {
    canManageMenu: false,
    canManageCategories: false,
    canManageOrders: true,       // only his own orders
    canManageUsers: false,
    canViewReports: false,
    canManageSettings: false,
  },
  viewer: {
    canManageMenu: false,
    canManageCategories: false,
    canManageOrders: false,
    canManageUsers: false,
    canViewReports: true,
    canManageSettings: false,
  },
};

// ---------- Main Component ----------
export default function UsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<IUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [form, setForm] = useState<IFormData>({
    name: "",
    email: "",
    password: "",
    role: "staff",
    permissions: { ...roleTemplates.staff },
  });

  const token = typeof window !== "undefined" ? localStorage.getItem("admin_token") : null;

  // ---------- Fetch Users ----------
  const fetchUsers = async () => {
    try {
      if (!token) {
        router.push("/admin/login");
        return;
      }
      const res = await fetch("/api/admin/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("خطا در دریافت کاربران");
      const data = await res.json();
      setUsers(data.users);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // ---------- Permission Helpers ----------
  const setPermission = (key: keyof IPermissions, value: boolean) => {
    setForm((prev) => ({
      ...prev,
      permissions: { ...prev.permissions, [key]: value },
    }));
  };

  const applyRoleTemplate = (role: string) => {
    const template = roleTemplates[role] || roleTemplates.staff;
    setForm((prev) => ({
      ...prev,
      role,
      permissions: { ...template },
    }));
  };

  // ---------- Modal Handlers ----------
  const openAddModal = () => {
    setModalMode("add");
    setForm({
      name: "",
      email: "",
      password: "",
      role: "staff",
      permissions: { ...roleTemplates.staff },
    });
    setSelectedUserId(null);
    setModalOpen(true);
  };

  const openEditModal = (user: IUser) => {
    setModalMode("edit");
    setSelectedUserId(user._id);
    setForm({
      name: user.name,
      email: user.email,
      password: "",    // leave empty – admin can type new password if needed
      role: user.role,
      permissions: { ...user.permissions },
    });
    setModalOpen(true);
  };

  const closeModal = () => setModalOpen(false);

  // ---------- Submit (Add / Edit) ----------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const url =
        modalMode === "add"
          ? "/api/admin/users"
          : `/api/admin/users/${selectedUserId}`;
      const method = modalMode === "add" ? "POST" : "PUT";

      const body: any = {
        name: form.name,
        email: form.email,
        role: form.role,
        permissions: form.permissions,
      };

      if (modalMode === "add" || form.password.trim()) {
        body.password = form.password;
      }

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "خطا");

      setSuccess(
        modalMode === "add" ? "کارمند با موفقیت اضافه شد" : "کارمند با موفقیت به‌روزرسانی شد"
      );
      fetchUsers();
      closeModal();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // ---------- Delete User ----------
  const handleDelete = async (userId: string) => {
    if (!window.confirm("آیا از حذف این کاربر اطمینان دارید؟")) return;

    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "خطا");
      setSuccess("کاربر با موفقیت حذف شد");
      fetchUsers();
    } catch (err: any) {
      setError(err.message);
    }
  };

  // ---------- Form Permissions Checkbox ----------
  const PermissionCheckbox = ({
    label,
    desc,
    permission,
  }: {
    label: string;
    desc: string;
    permission: keyof IPermissions;
  }) => (
    <label className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
      <input
        type="checkbox"
        checked={form.permissions[permission]}
        onChange={(e) => setPermission(permission, e.target.checked)}
        className="mt-1 w-5 h-5 text-orange-600 rounded focus:ring-2 focus:ring-orange-500"
      />
      <div>
        <div className="font-medium text-gray-900">{label}</div>
        <div className="text-sm text-gray-500">{desc}</div>
      </div>
    </label>
  );

  // =================== RENDER ===================
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-orange-600" />
      </div>
    );
  }

  return (
    <div className="p-6" dir="rtl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">مدیریت کارمندان</h1>
          <p className="text-gray-600">افزودن، ویرایش و حذف کارمندان</p>
        </div>
        <button
          onClick={openAddModal}
          className="mt-4 sm:mt-0 inline-flex items-center gap-2 bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition"
        >
          <UserPlus className="w-5 h-5" />
          افزودن کارمند جدید
        </button>
      </div>

      {/* Success / Error Messages */}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6 flex justify-between items-center">
          {success}
          <button onClick={() => setSuccess("")}>
            <X className="w-5 h-5" />
          </button>
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex justify-between items-center">
          {error}
          <button onClick={() => setError("")}>
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Users Table */}
      {users.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <Shield className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600">هیچ کارمندی وجود ندارد</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-right">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-700">نام</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-700">ایمیل</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-700">نقش</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-700">وضعیت</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-700">تاریخ ثبت</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-700">عملیات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 font-medium text-gray-900">{user.name}</td>
                    <td className="px-6 py-4 text-gray-600">{user.email}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          user.role === "admin"
                            ? "bg-purple-100 text-purple-700"
                            : user.role === "manager"
                            ? "bg-blue-100 text-blue-700"
                            : user.role === "staff"
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {user.role === "admin"
                          ? "مدیر کل"
                          : user.role === "manager"
                          ? "مدیر"
                          : user.role === "staff"
                          ? "کارمند"
                          : "ناظر"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {user.isActive ? (
                        <span className="inline-flex items-center gap-1 text-green-600">
                          <CheckCircle className="w-4 h-4" /> فعال
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-red-500">
                          <XCircle className="w-4 h-4" /> غیرفعال
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-sm">
                      {new Date(user.createdAt).toLocaleDateString("fa-IR")}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEditModal(user)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          title="ویرایش"
                        >
                          <Pencil className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(user._id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="حذف"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ---------- MODAL (Add / Edit Form) ---------- */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto" dir="rtl">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">
                {modalMode === "add" ? "افزودن کارمند جدید" : "ویرایش کارمند"}
              </h2>
              <button
                onClick={closeModal}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-8">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    نام کامل *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
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
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="example@domain.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    رمز عبور {modalMode === "edit" && "(اختیاری)"}
                  </label>
                  <input
                    type="password"
                    required={modalMode === "add"}
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder={modalMode === "add" ? "حداقل ۶ کاراکتر" : "خالی (بدون تغییر)"}
                    minLength={6}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    نقش *
                  </label>
                  <select
                    value={form.role}
                    onChange={(e) => applyRoleTemplate(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="staff">کارمند</option>
                    <option value="manager">مدیر</option>
                    <option value="admin">مدیر کل</option>
                    <option value="viewer">ناظر</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    با تغییر نقش، دسترسی‌های پیش‌فرض اعمال می‌شود.
                  </p>
                </div>
              </div>

              {/* Permissions */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  دسترسی‌ها
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <PermissionCheckbox
                    label="مدیریت منو"
                    desc="افزودن، ویرایش و حذف آیتم‌های منو"
                    permission="canManageMenu"
                  />
                  <PermissionCheckbox
                    label="مدیریت دسته‌بندی‌ها"
                    desc="ایجاد و ویرایش دسته‌بندی‌ها"
                    permission="canManageCategories"
                  />
                  <PermissionCheckbox
                    label="مدیریت سفارشات"
                    desc="مشاهده و مدیریت سفارشات"
                    permission="canManageOrders"
                  />
                  <PermissionCheckbox
                    label="مدیریت کاربران"
                    desc="افزودن و ویرایش کاربران"
                    permission="canManageUsers"
                  />
                  <PermissionCheckbox
                    label="مشاهده گزارشات"
                    desc="دسترسی به گزارشات و آمار"
                    permission="canViewReports"
                  />
                  <PermissionCheckbox
                    label="مدیریت تنظیمات"
                    desc="تغییر تنظیمات سیستم"
                    permission="canManageSettings"
                  />
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex gap-4 pt-4 border-t border-gray-200">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-orange-600 text-white py-3 rounded-lg hover:bg-orange-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                  ) : modalMode === "add" ? (
                    "ایجاد کارمند"
                  ) : (
                    "ذخیره تغییرات"
                  )}
                </button>
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  انصراف
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
