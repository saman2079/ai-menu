"use client";

import { useEffect } from "react";

export default function SessionInitializer() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    const tableParam = params.get("table");

    if (tableParam) {
      localStorage.setItem("tableId", tableParam);
    }

    let sessionId = localStorage.getItem("sessionId");

    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random()
        .toString(36)
        .slice(2, 9)}`;

      localStorage.setItem("sessionId", sessionId);
    }
  }, []);

  return null;
}