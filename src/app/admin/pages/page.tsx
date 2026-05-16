// src/app/admin/pages/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function AdminPagesPage() {
    const [pages, setPages] = useState<any[]>([]);

    useEffect(() => {
        fetch("/api/admin/pages")
            .then((r) => r.json())
            .then((data) => setPages(data.pages));
    }, []);

    console.log(pages)

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-[32px] font-bold">Pages</h1>
                <Link
                    href="/admin/pages/new"
                    className="bg-blue-500 px-4 py-2 rounded"
                >
                    + New Page
                </Link>
            </div>

            <div className="grid gap-4">
                {pages.map((page) => (
                    <div
                        key={page._id}
                        className="bg-gray-800 p-4 rounded flex justify-between"
                    >
                        <div>
                            <h3 className="text-[20px]">{page.title}</h3>
                            <p className="text-gray-400">{page.slug}</p>
                        </div>
                        <div className="flex gap-2">
                            <Link
                                href={`/admin/pages/${page._id}/edit`}
                                className="bg-yellow-500 px-3 py-1 rounded"
                            >
                                Edit
                            </Link>
                            <button className="bg-red-500 px-3 py-1 rounded">Delete</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
