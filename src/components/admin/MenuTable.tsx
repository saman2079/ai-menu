import Link from "next/link";
import { Edit, Trash2, Eye, EyeOff } from "lucide-react";
import Image from "next/image";

interface MenuItem {
    _id: string;
    name: string;
    nameEn?: string;
    price: number;
    category: { name: string };
    image?: string;
    isAvailable: boolean;
    calories?: number;
}

export default function MenuTable({
    items,
    onDelete,
}: {
    items: MenuItem[];
    onDelete: (id: string) => void;
}) {
    return (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                        <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">
                            تصویر
                        </th>
                        <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">
                            نام
                        </th>
                        <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">
                            دسته‌بندی
                        </th>
                        <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">
                            قیمت
                        </th>
                        <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">
                            کالری
                        </th>
                        <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">
                            وضعیت
                        </th>
                        <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">
                            عملیات
                        </th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                    {items.map((item) => (
                        <tr key={item._id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4">
                                {item.image ? (
                                    <Image
                                        src={item.image}
                                        alt={item.name}
                                        width={48}
                                        height={48}
                                        className="w-12 h-12 rounded-lg object-cover"
                                    />
                                ) : (
                                    <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center text-gray-400 text-xs">
                                        بدون تصویر
                                    </div>
                                )}
                            </td>
                            <td className="px-6 py-4">
                                <div>
                                    <p className="font-medium text-gray-900">{item.name}</p>
                                    {item.nameEn && (
                                        <p className="text-sm text-gray-500">{item.nameEn}</p>
                                    )}
                                </div>
                            </td>
                            <td className="px-6 py-4 text-gray-700">{item.category?.name}</td>
                            <td className="px-6 py-4 font-medium text-gray-900">
                                {item.price.toLocaleString()} تومان
                            </td>
                            <td className="px-6 py-4 text-gray-700">
                                {item.calories ? `${item.calories} کالری` : "-"}
                            </td>
                            <td className="px-6 py-4">
                                <span
                                    className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${item.isAvailable
                                            ? "bg-green-100 text-green-700"
                                            : "bg-red-100 text-red-700"
                                        }`}
                                >
                                    {item.isAvailable ? (
                                        <>
                                            <Eye className="w-3 h-3" />
                                            موجود
                                        </>
                                    ) : (
                                        <>
                                            <EyeOff className="w-3 h-3" />
                                            ناموجود
                                        </>
                                    )}
                                </span>
                            </td>
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-2">
                                    <Link
                                        href={`/admin/menu/${item._id}`}
                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                    >
                                        <Edit className="w-4 h-4" />
                                    </Link>
                                    <button
                                        onClick={() => onDelete(item._id)}
                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {items.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                    هیچ آیتمی یافت نشد
                </div>
            )}
        </div>
    );
}
