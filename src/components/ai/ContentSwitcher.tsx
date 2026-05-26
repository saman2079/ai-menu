"use client";

import Stream from "./Stream";
import AIChatBoxPro from "./AIChatBox";
import { useUIStore } from "@/app/hooks/uiStore";

export default function ContentSwitcher() {
  const activeSection = useUIStore((s) => s.activeSection);

  // if (activeSection === "stream") return <Stream />;
  return <AIChatBoxPro  />;
}
