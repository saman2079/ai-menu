"use client";

import { useEffect, useRef } from "react";
import { useUIStore } from "@/app/hooks/ui";

export default function ScrollContainer({
  children,
}: {
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const setScrollContainer = useUIStore((s) => s.setScrollContainer);

  useEffect(() => {
    setScrollContainer(ref.current);
  }, [setScrollContainer]);

  return (
    <div
      ref={ref}
      className="h-[100dvh] overflow-y-auto overflow-x-hidden"
    >
      {children}
    </div>
  );
}
