// src/app/api/chat/route.ts
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import { runAgentChatMode } from "@/lib/ai/agent";

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const body = await req.json();
    console.log("📥 [CHAT-API] Request body:", body);

    const { messages, sessionId, tableId } = body; // ✅ دریافت tableId

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: "Messages array is required" },
        { status: 400 }
      );
    }

    if (!sessionId) {
      return NextResponse.json(
        { error: "Session ID is required" },
        { status: 400 }
      );
    }

    if (!process.env.GAPGPT_API_KEY) {
      console.error("❌ GAPGPT_API_KEY is not configured");
      return NextResponse.json(
        { error: "GapGPT API key is not configured" },
        { status: 500 }
      );
    }

    console.log("🤖 [CHAT-API] Calling runAgentChatMode...");
    console.log("📍 [CHAT-API] Table ID:", tableId || "null");
    
    const response = await runAgentChatMode(
      messages,
      sessionId,
      tableId || null // ✅ ارسال tableId
    );
    
    console.log("✅ [CHAT-API] Response:", response);

    return NextResponse.json(response);
  } catch (error: any) {
    console.error("❌ [CHAT-API] Error:", error);
    console.error("Stack:", error.stack);
    return NextResponse.json(
      {
        error: error.message || "Internal server error",
        details:
          process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
