// src/components/ai/ChatClient.tsx

"use client";

import React, {
  useEffect,
  useState,
  useCallback,
} from "react";
import ChatHeader from "./ChatHeader";
import ChatMessages from "./ChatMessages";
import ChatInput from "./ChatInput";

interface MenuCard {
  id: string;
  name: string;
  price: number;
  description: string;
  images: string[];
}

export interface Message {
  role: "user" | "assistant";
  content: string;
  menuCards?: MenuCard[];
  addedItems?: any[];
  orderSubmitted?: boolean;
  orderId?: string | null;
}

function ChatClient() {

  const [message, setMessage] =
    useState("");

  const [messages, setMessages] =
    useState<Message[]>([]);

  const [loading, setLoading] =
    useState(false);

  const [sessionId, setSessionId] =
    useState("");

  // session
  useEffect(() => {

    const storedSessionId =
      localStorage.getItem("sessionId");

    if (storedSessionId) {

      setSessionId(storedSessionId);

    } else {

      const newSessionId =
        `session_${Date.now()}_${Math.random()
          .toString(36)
          .substring(2, 9)}`;

      localStorage.setItem(
        "sessionId",
        newSessionId
      );

      setSessionId(newSessionId);
    }

  }, []);

  // send
  const sendMessage = useCallback(
    async () => {

      if (!message.trim() || loading)
        return;

      const userMessage: Message = {
        role: "user",
        content: message,
      };

      const updatedMessages = [
        ...messages,
        userMessage,
      ];

      // optimistic update
      setMessages(updatedMessages);

      setMessage("");

      setLoading(true);

      try {

        const res = await fetch(
          "/api/chat",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              sessionId,
              tableId: "1",
              messages:
                updatedMessages,
            }),
          }
        );

        const data = await res.json();

        const aiMessage: Message = {
          role: "assistant",
          content:
            data.message ||
            data.response ||
            "پاسخی دریافت نشد",
          menuCards: data.menuCards || [],
          addedItems: data.addedItems || [],
          orderSubmitted: data.orderSubmitted || false,
          orderId: data.orderId || null,

        };

        setMessages((prev) => [
          ...prev,
          aiMessage,
        ]);

      } catch (error) {

        console.log(error);

        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content:
              "خطا در ارتباط با سرور",
          },
        ]);

      } finally {

        setLoading(false);

      }
    },
    [
      message,
      messages,
      loading,
      sessionId,
    ]
  );


  return (
    <div className="bg-[#E4E4E4] flex flex-col gap-2 text-[16px] text-[#201F20] h-screen overflow-hidden">

      <ChatHeader />

      <ChatMessages
        messages={messages}
        loading={loading}
      />

      <ChatInput
        message={message}
        setMessage={setMessage}
        sendMessage={sendMessage}
        loading={loading}
      />

    </div>
  );
}

export default ChatClient;