// src/app/api/orders/current/route.ts
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { Order } from "@/lib/models/Order";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const tableId = searchParams.get("tableId");
    const sessionId = searchParams.get("sessionId");

    console.log("📥 Fetching current order:", { tableId, sessionId });

    if (!tableId || !sessionId) {
      return NextResponse.json(
        { message: "tableId and sessionId are required" },
        { status: 400 }
      );
    }

    // پیدا کردن سفارش فعال (finalize نشده) برای این میز و session
    const order = await Order.findOne({
      tableId: parseInt(tableId),
      sessionId,
      isFinalized: false,
    })
      .populate("items.menuItem", "name price images")
      .populate("restaurant", "name");

    if (!order) {
      return NextResponse.json({
        message: "No active order found",
        order: null,
      });
    }

    console.log("✅ Found order:", {
      orderId: order._id,
      itemsCount: order.items.length,
      total: order.totalAmount,
    });

    return NextResponse.json({
      message: "Order found",
      order,
    });
  } catch (error: any) {
    console.error("❌ Error fetching order:", error);
    return NextResponse.json(
      { message: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
