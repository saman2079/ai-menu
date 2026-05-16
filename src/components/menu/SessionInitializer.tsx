// src/components/menu/SessionInitializer.tsx
"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

export default function SessionInitializer() {
    const searchParams = useSearchParams();

    useEffect(() => {
        const tableParam = searchParams.get("table");


        if (tableParam) {
            localStorage.setItem("tableId", tableParam);
        }

        let sessionId = localStorage.getItem("sessionId");
        if (!sessionId) {
            sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            localStorage.setItem("sessionId", sessionId);
        } else {
        }

        // چک کن که واقعاً ذخیره شدن

    }, [searchParams]);

    return null;
}
