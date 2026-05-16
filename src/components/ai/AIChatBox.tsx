"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function AIChatBoxPro({ currentItem }) {
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string>("");
  const [tableId, setTableId] = useState<number | null>(null);
  const [orderSubmitted, setOrderSubmitted] = useState(false);
  const [orderDetails, setOrderDetails] = useState<any>(null);
  const [mode, setMode] = useState<"button" | "chat">("chat");
  const [showSettings, setShowSettings] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const chatEndRef = useRef(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Hello! What would you like?" },
  ]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    // خواندن sessionId از localStorage (فقط یک string)
    let storedSessionId = localStorage.getItem("sessionId");

    if (storedSessionId) {
      setSessionId(storedSessionId);
      console.log("✅ [AI-CHAT] Session ID loaded:", storedSessionId);
    } else {
      const newSessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      setSessionId(newSessionId);
      localStorage.setItem("sessionId", newSessionId);
      console.log("🆕 [AI-CHAT] New Session ID created:", newSessionId);
    }

    // خواندن tableId از localStorage
    const storedTableId = localStorage.getItem("tableId");
    if (storedTableId) {
      setTableId(parseInt(storedTableId));
      console.log("✅ [AI-CHAT] Table ID loaded:", storedTableId);
    } else {
      console.log("⚠️ [AI-CHAT] No table ID found in localStorage");
    }
  }, []);

  useEffect(() => {
    autoResize();
  }, [input]);

  const autoResize = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    textarea.style.height = "24px";
    const newHeight = Math.min(textarea.scrollHeight, 110);
    textarea.style.height = newHeight + "px";
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");

    if (textareaRef.current) {
      textareaRef.current.style.height = "24px";
    }

    const updatedMessages = [
      ...messages,
      { role: "user" as const, content: userMessage },
    ];
    setMessages(updatedMessages);
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updatedMessages,
          sessionId,
          tableId,
          mode,
        }),
      });

      if (!res.ok) throw new Error("Error communicating with the server");

      const data = await res.json();

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.message },
      ]);

      if (data.orderSubmitted) {
        setOrderSubmitted(true);
        setOrderDetails({
          items: data.addedItems || [],
          totalAmount: (data.addedItems || []).reduce(
            (sum: number, item: any) => sum + item.price,
            0,
          ),
          orderId: data.orderId,
        });
      }
    } catch (error) {
      console.error("❌ Error:", error);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, an error occurred." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  console.log("Session ID:", sessionId);
  console.log("Table ID:", tableId);

  return (
    <div className="w-full max-w-lg mx-auto p-4 relative mt-4 sticky top-[100px]">
      <div className="space-y-3 mb-24  flex flex-col">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`
              inline-block
              max-w-[300px]
              p-2
              rounded-[10px]
              text-[17px]
              break-words
              min-h-[40px]
              ${msg.role === "user"
                ? "ml-auto mr-0 bg-[#333333]/39 text-white border border-[#707070]"
                : "mr-auto ml-0 bg-black/34 text-white border border-[#707070]"
              }
            `}
          >
            {msg.content}
          </div>
        ))}

        {isLoading && (
          <div className="inline-block mr-auto max-w-[300px] p-2 rounded-[10px] text-[10px] bg-black/34 text-white border border-[#707070]">
            <div className="loading-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      <div className="fixed bottom-0 pb-4 left-1/2 -translate-x-1/2 w-full max-w-[450px] px-4 bg-gradient-to-t from-black/100 to-black/0">
        <div className="flex items-center bg-[#B1B1B1]/23 backdrop-brightness-115 backdrop-blur-[15px] border border-[#707070] rounded-[15px] p-2 gap-2 relative min-h-[57px]">
          <div className="flex-1 flex items-center">
            <textarea
              ref={textareaRef}
              className="w-[85%] outline-none px-3 text-white resize-none max-h-[110px] overflow-y-auto leading-relaxed custom-scrollbar"
              value={input}
              placeholder="Type here..."
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={1}
              style={{ height: "24px" }}
            />
          </div>

          {isLoading ? (
            <div className="invert-0 brightness-50 text-gray-300 p-3 flex-shrink-0 self-end absolute right-3">
              <Image
                width={25}
                height={25}
                src={"/icons/sendbtn.svg"}
                alt="send"
              />
            </div>
          ) : (
            <button
              onClick={handleSend}
              className="text-white p-3 flex-shrink-0 self-end absolute right-3"
            >
              <Image
                width={25}
                height={25}
                src={"/icons/sendbtn.svg"}
                alt="send"
              />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
