"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Bot } from "lucide-react"; // استفاده از آیکون برای هوش مصنوعی

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function AIChatBoxPro({ currentItem }: { currentItem?: any }) {
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string>("");
  const [tableId, setTableId] = useState<number | null>(null);
  const [orderSubmitted, setOrderSubmitted] = useState(false);
  const [orderDetails, setOrderDetails] = useState<any>(null);
  const [mode, setMode] = useState<"button" | "chat">("chat");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "سلام! خوش اومدی. چه سفارشی برات ثبت کنم؟ 🍔" },
  ]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  useEffect(() => {
    let storedSessionId = localStorage.getItem("sessionId");
    if (storedSessionId) {
      setSessionId(storedSessionId);
    } else {
      const newSessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      setSessionId(newSessionId);
      localStorage.setItem("sessionId", newSessionId);
    }

    const storedTableId = localStorage.getItem("tableId");
    if (storedTableId) {
      setTableId(parseInt(storedTableId));
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
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "متاسفانه خطایی رخ داد. لطفا دوباره تلاش کنید." },
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

  return (
    <div className="w-full max-w-[450px] mx-auto relative h-[100dvh] flex flex-col pt-4">
      
      {/* هدر کوچک برای چت */}
      <div className="px-6 pb-2 text-center z-10 relative">
        <h2 className="text-white/90 font-bold text-lg drop-shadow-md">سفارش هوشمند</h2>
        <p className="text-white/50 text-xs mt-1">دستیار هوش مصنوعی رستوران</p>
      </div>

      {/* بخش پیام‌ها */}
      {/* حاشیه پایین زیاد است تا وقتی اسکرول میکنیم زیر فیلد ورودی و منو گیر نکند (pb-36) */}
      <div className="flex-1 overflow-y-auto px-4 pb-[130px] space-y-4 custom-scrollbar">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex w-full ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            {msg.role === "assistant" && (
              <div className="w-8 h-8 rounded-full bg-orange-500/20 border border-orange-500/50 flex items-center justify-center mr-2 mt-auto mb-1 flex-shrink-0">
                <Bot className="w-5 h-5 text-orange-400" />
              </div>
            )}
            
            <div
              className={`
                max-w-[80%] px-4 py-3 text-[15px] leading-relaxed shadow-lg backdrop-blur-md
                ${msg.role === "user"
                  ? "bg-gradient-to-br from-orange-500 to-red-600 text-white rounded-2xl rounded-br-sm ml-auto"
                  : "bg-white/10 text-white/90 border border-white/10 rounded-2xl rounded-bl-sm"
                }
              `}
              dir="rtl"
            >
              {msg.content}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex w-full justify-start">
            <div className="w-8 h-8 rounded-full bg-orange-500/20 border border-orange-500/50 flex items-center justify-center mr-2 mt-auto mb-1 flex-shrink-0">
              <Bot className="w-5 h-5 text-orange-400" />
            </div>
            <div className="px-4 py-4 bg-white/10 border border-white/10 rounded-2xl rounded-bl-sm flex items-center gap-1">
              <div className="w-1.5 h-1.5 bg-white/60 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
              <div className="w-1.5 h-1.5 bg-white/60 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
              <div className="w-1.5 h-1.5 bg-white/60 rounded-full animate-bounce"></div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* بخش ورودی پیام (ثابت در پایین، اما بالاتر از منوی ناوبری) */}
      <div className="fixed bottom-[120px] w-full max-w-[450px] px-4 left-1/2 -translate-x-1/2 z-40 pointer-events-none">
        <div className="pointer-events-auto bg-black/60 backdrop-blur-xl border border-white/20 rounded-3xl p-2 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] flex items-end gap-2 transition-all duration-300 focus-within:border-orange-500/50 focus-within:shadow-[0_0_20px_rgba(249,115,22,0.15)]">
          
          <textarea
            ref={textareaRef}
            className="flex-1 bg-transparent outline-none px-3 py-2  text-white/90 placeholder-white/40 resize-none max-h-[110px] overflow-y-auto text-[15px] custom-scrollbar"
            value={input}
            placeholder="چی میل دارید؟..."
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            dir="rtl"
            style={{ height: "40px" }}
          />

          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className={`p-3 rounded-2xl flex-shrink-0 transition-all duration-300 ${
              input.trim() && !isLoading
                ? "bg-orange-500 hover:bg-orange-600 shadow-[0_0_15px_rgba(249,115,22,0.4)]"
                : "bg-white/10 text-white/30 cursor-not-allowed"
            }`}
          >
            {/* استفاده از SVG یا آیکون شما. اگر /icons/sendbtn.svg مناسب نبود میتوانید از lucide-react استفاده کنید */}
            <Image
              width={20}
              height={20}
              src={"/icons/sendbtn.svg"}
              alt="send"
              className={!input.trim() || isLoading ? "opacity-50 grayscale" : "invert"}
            />
          </button>
        </div>
      </div>

    </div>
  );
}
