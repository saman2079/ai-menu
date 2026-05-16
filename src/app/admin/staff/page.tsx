// app/admin/staff/page.tsx
"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, Edit, Mail, Phone } from "lucide-react";

interface Staff {
    _id: string;
    name: string;
    email: string;
    phone?: string;
    role: "manager" | "staff";
    permissions: {
        canManageMenu: boolean;
        canManageOrders: boolean;
        canManageReservations: boolean;
        canManageStaff: boolean;
        canViewReports: boolean;
        canManageSettings: boolean;
        canManageInventory: boolean;
    };
    isActive: boolean;
    lastLogin?: string;
}

const initialPermissions = {
    canManageMenu: false,
    canManageOrders: false,
    canManageReservations: false,
    canManageStaff: false,
    canViewReports: false,
    canManageSettings: false,
    canManageInventory: false,
};

const initialFormData = {
    name: "",
    email: "",
    phone: "",
    password: "",
    role: "staff" as "manager" | "staff",
    permissions: initialPermissions,
};

const initialMember = {
    _id: "",
    name: "",
    email: "",
    phone: "",
    role: "staff" as "manager" | "staff",
};

export default function StaffManagement() {

    const [staff, setStaff] = useState<Staff[]>([]);
    const [loading, setLoading] = useState(true);

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);

    const [formData, setFormData] = useState(initialFormData);

    const [member, setMember] = useState(initialMember);

    useEffect(() => {
        fetchStaff();
    }, []);

    const fetchStaff = async () => {
        try {
            const token = localStorage.getItem("admin_token");

            const res = await fetch("/api/admin/staff", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const data = await res.json();

            if (!res.ok) {
                alert(data.error || "خطا در دریافت کارمندان");
                return;
            }

            setStaff(Array.isArray(data) ? data : data.staff || []);

        } catch (error) {
            console.log(error);
            alert("خطا در ارتباط با سرور");
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (
        e: React.FormEvent<HTMLFormElement>
    ) => {
        e.preventDefault();

        try {
            const token = localStorage.getItem("admin_token");

            const res = await fetch("/api/admin/staff", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(formData),
            });

            const data = await res.json();

            if (!res.ok) {
                alert(data.error || "خطا در افزودن کارمند");
                return;
            }

            await fetchStaff();

            setShowCreateModal(false);

            setFormData(initialFormData);

            alert("کارمند اضافه شد");

        } catch (error) {
            console.log(error);
            alert("خطا در ارتباط با سرور");
        }
    };

    const handleDelete = async (
        id: string,
        name: string
    ) => {

        const confirmDelete = confirm(
            `آیا از حذف ${name} مطمئن هستید؟`
        );

        if (!confirmDelete) return;

        try {
            const token = localStorage.getItem("admin_token");

            const res = await fetch(`/api/admin/staff/${id}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            let data = null;

            try {
                data = await res.json();
            } catch { }

            if (!res.ok) {
                alert(data?.error || "خطا در حذف کارمند");
                return;
            }

            await fetchStaff();

            alert("کارمند حذف شد");

        } catch (error) {
            console.log(error);
            alert("خطا در ارتباط با سرور");
        }
    };

    const openEditModal = async (id: string) => {
        try {

            const token = localStorage.getItem("admin_token");

            const res = await fetch(`/api/admin/staff/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const data = await res.json();

            if (!res.ok) {
                alert(data.error);
                return;
            }

            setMember({
                _id: data.staff._id,
                name: data.staff.name,
                email: data.staff.email,
                phone: data.staff.phone || "",
                role: data.staff.role,
            });

            setShowEditModal(true);

        } catch (error) {
            console.log(error);
            alert("خطا در دریافت اطلاعات");
        }
    };

    const handleUpdate = async (
        e: React.FormEvent<HTMLFormElement>
    ) => {

        e.preventDefault();

        try {

            const token = localStorage.getItem("admin_token");

            const res = await fetch(
                `/api/admin/staff/${member._id}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        name: member.name,
                        email: member.email,
                        phone: member.phone,
                        role: member.role,
                    }),
                }
            );

            const data = await res.json();

            if (!res.ok) {
                alert(data.error);
                return;
            }

            await fetchStaff();

            setShowEditModal(false);

            setMember(initialMember);

            alert("ویرایش انجام شد");

        } catch (error) {
            console.log(error);
            alert("خطا در ارتباط با سرور");
        }
    };

    const permissionLabels = {
        canManageMenu: "مدیریت منو",
        canManageOrders: "مدیریت سفارشات",
        canManageReservations: "مدیریت رزرو",
        canManageStaff: "مدیریت کارمندان",
        canViewReports: "مشاهده گزارشات",
        canManageSettings: "مدیریت تنظیمات",
        canManageInventory: "مدیریت انبار",
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                در حال بارگذاری...
            </div>
        );
    }

    return (
        <div className="p-6 max-w-7xl mx-auto">

            <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-bold">
                    مدیریت کارمندان
                </h1>

                <button
                    onClick={() => setShowCreateModal(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                >
                    <Plus size={18} />
                    افزودن کارمند
                </button>
            </div>

            <div className="grid gap-4">

                {staff.map((member) => (
                    <div
                        key={member._id}
                        className="bg-white border rounded-xl p-6 shadow-sm"
                    >

                        <div className="flex items-start justify-between">

                            <div className="flex-1">

                                <div className="flex items-center gap-3 mb-3">

                                    <h2 className="text-xl font-bold">
                                        {member.name}
                                    </h2>

                                    <span
                                        className={`px-3 py-1 rounded-full text-sm ${member.role === "manager"
                                            ? "bg-purple-100 text-purple-700"
                                            : "bg-blue-100 text-blue-700"
                                            }`}
                                    >
                                        {member.role === "manager"
                                            ? "مدیر"
                                            : "کارمند"}
                                    </span>

                                    <span
                                        className={`px-3 py-1 rounded-full text-sm ${member.isActive
                                            ? "bg-green-100 text-green-700"
                                            : "bg-red-100 text-red-700"
                                            }`}
                                    >
                                        {member.isActive
                                            ? "فعال"
                                            : "غیرفعال"}
                                    </span>

                                </div>

                                <div className="flex flex-col gap-2 text-gray-600">

                                    <div className="flex items-center gap-2">
                                        <Mail size={16} />
                                        <span>{member.email}</span>
                                    </div>

                                    {member.phone && (
                                        <div className="flex items-center gap-2">
                                            <Phone size={16} />
                                            <span>{member.phone}</span>
                                        </div>
                                    )}

                                </div>

                                <div className="flex flex-wrap gap-2 mt-4">

                                    {Object.entries(member.permissions).map(
                                        ([key, value]) =>
                                            value ? (
                                                <span
                                                    key={key}
                                                    className="bg-gray-100 text-gray-700 text-sm px-3 py-1 rounded-full"
                                                >
                                                    {
                                                        permissionLabels[
                                                        key as keyof typeof permissionLabels
                                                        ]
                                                    }
                                                </span>
                                            ) : null
                                    )}

                                </div>

                            </div>

                            <div className="flex items-center gap-2">

                                <button
                                    onClick={() => openEditModal(member._id)}
                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                                >
                                    <Edit size={20} />
                                </button>

                                <button
                                    onClick={() =>
                                        handleDelete(
                                            member._id,
                                            member.name
                                        )
                                    }
                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                                >
                                    <Trash2 size={20} />
                                </button>

                            </div>

                        </div>

                    </div>
                ))}

                {staff.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                        هیچ کارمندی وجود ندارد
                    </div>
                )}

            </div>

            {/* Create Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">

                    <div className="bg-white rounded-xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">

                        <h2 className="text-2xl font-bold mb-6">
                            افزودن کارمند
                        </h2>

                        <form
                            onSubmit={handleCreate}
                            className="space-y-4"
                        >

                            <input
                                type="text"
                                placeholder="نام"
                                required
                                value={formData.name}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        name: e.target.value,
                                    })
                                }
                                className="w-full border rounded-lg p-3"
                            />

                            <input
                                type="email"
                                placeholder="ایمیل"
                                required
                                value={formData.email}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        email: e.target.value,
                                    })
                                }
                                className="w-full border rounded-lg p-3"
                            />

                            <input
                                type="tel"
                                placeholder="تلفن"
                                value={formData.phone}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        phone: e.target.value,
                                    })
                                }
                                className="w-full border rounded-lg p-3"
                            />

                            <input
                                type="password"
                                placeholder="رمز عبور"
                                required
                                value={formData.password}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        password: e.target.value,
                                    })
                                }
                                className="w-full border rounded-lg p-3"
                            />

                            <select
                                value={formData.role}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        role: e.target.value as "manager" | "staff",
                                    })
                                }
                                className="w-full border rounded-lg p-3"
                            >
                                <option value="staff">
                                    کارمند
                                </option>

                                <option value="manager">
                                    مدیر
                                </option>
                            </select>

                            <div className="space-y-2">

                                {Object.entries(permissionLabels).map(
                                    ([key, label]) => (
                                        <label
                                            key={key}
                                            className="flex items-center gap-2"
                                        >

                                            <input
                                                type="checkbox"
                                                checked={
                                                    formData.permissions[
                                                    key as keyof typeof formData.permissions
                                                    ]
                                                }
                                                onChange={(e) =>
                                                    setFormData({
                                                        ...formData,
                                                        permissions: {
                                                            ...formData.permissions,
                                                            [key]: e.target.checked,
                                                        },
                                                    })
                                                }
                                            />

                                            <span>{label}</span>

                                        </label>
                                    )
                                )}

                            </div>

                            <div className="flex gap-3 pt-4">

                                <button
                                    type="submit"
                                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg"
                                >
                                    افزودن
                                </button>

                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowCreateModal(false)
                                    }
                                    className="flex-1 bg-gray-200 hover:bg-gray-300 py-3 rounded-lg"
                                >
                                    انصراف
                                </button>

                            </div>

                        </form>

                    </div>

                </div>
            )}

            {/* Edit Modal */}
            {showEditModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">

                    <div className="bg-white rounded-xl w-full max-w-md p-6">

                        <h2 className="text-2xl font-bold mb-6">
                            ویرایش کارمند
                        </h2>

                        <form
                            onSubmit={handleUpdate}
                            className="space-y-4"
                        >

                            <input
                                type="text"
                                value={member.name}
                                onChange={(e) =>
                                    setMember({
                                        ...member,
                                        name: e.target.value,
                                    })
                                }
                                className="w-full border rounded-lg p-3"
                            />

                            <input
                                type="email"
                                value={member.email}
                                onChange={(e) =>
                                    setMember({
                                        ...member,
                                        email: e.target.value,
                                    })
                                }
                                className="w-full border rounded-lg p-3"
                            />

                            <input
                                type="tel"
                                value={member.phone}
                                onChange={(e) =>
                                    setMember({
                                        ...member,
                                        phone: e.target.value,
                                    })
                                }
                                className="w-full border rounded-lg p-3"
                            />

                            <select
                                value={member.role}
                                onChange={(e) =>
                                    setMember({
                                        ...member,
                                        role: e.target.value as "manager" | "staff",
                                    })
                                }
                                className="w-full border rounded-lg p-3"
                            >
                                <option value="staff">
                                    کارمند
                                </option>

                                <option value="manager">
                                    مدیر
                                </option>
                            </select>

                            <div className="flex gap-3 pt-4">

                                <button
                                    type="submit"
                                    className="flex-1 bg-black text-white py-3 rounded-lg"
                                >
                                    ذخیره
                                </button>

                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowEditModal(false)
                                    }
                                    className="flex-1 bg-gray-200 py-3 rounded-lg"
                                >
                                    بستن
                                </button>

                            </div>

                        </form>

                    </div>

                </div>
            )}

        </div>
    );
}
