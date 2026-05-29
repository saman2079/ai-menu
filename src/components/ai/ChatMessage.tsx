// src/components/ai/ChatMessage.tsx

import { memo } from "react";

interface Props {
  role: "user" | "assistant";
  content: string;
}

function ChatMessage({
  role,
  content,
}: Props) {

  return (
    <div
      className={`flex ${
        role === "user"
          ? "justify-start"
          : "justify-end"
      }`}
    >

      <div
        className={`
          max-w-[80%]
          p-4
          rounded-[18px]
          shadow-sm

          ${
            role === "user"
              ? "bg-[#E8E8E8] text-[#201F20] rounded-br-[5px] shadow-[2px_3px_8px_0px_#0000001A]"
              : "bg-white text-[#201F20] rounded-bl-[5px] shadow-[2px_3px_8px_0px_#0000001A]"
          }
        `}
      >

        {content}

      </div>

    </div>
  );
}

export default memo(ChatMessage);