import jwt from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { Order } from "@/lib/models/Order";
import { verifyToken } from "@/lib/auth";
import { MenuItem } from "@/lib/models/MenuItem";



export async function GET(req: NextRequest) {
  console.log("🔵 [ORDERS-API] GET started");

  try {
    const token = req.headers.get("authorization")?.split(" ")[1];
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
      jwt.verify(token, process.env.JWT_SECRET!);
    } catch {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    await connectDB();

    const { Restaurant } = await import("@/lib/models/Restaurant");
    const { Order } = await import("@/lib/models/Order");

    const orders = await Order.find()
      .populate("restaurant", "name")
      .populate("items.menuItem", "name price")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ orders });
  } catch (error: any) {
    console.error("❌ GET Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch orders" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const token = req.headers.get("authorization")?.split(" ")[1];
    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ message: "Invalid token" }, { status: 401 });
    }

    const { customerName, customerPhone, items, tableId, sessionId } = await req.json();

    if (!items || items.length === 0) {
      return NextResponse.json({ message: "No items provided" }, { status: 400 });
    }

    // ⭐ اگه tableId و sessionId داریم، چک کن سفارش قبلی وجود داره یا نه
    let existingOrder = null;
    if (tableId && sessionId) {
      existingOrder = await Order.findOne({
        tableId,
        sessionId,
        isFinalized: false,
        restaurant: decoded.restaurant,
      });
    }

    // محاسبه آیتم‌های جدید
    const populatedItems = await Promise.all(
      items.map(async (item: any) => {
        const menuItem = await MenuItem.findById(item.menuItem);
        if (!menuItem) {
          throw new Error(`Menu item ${item.menuItem} not found`);
        }
        return {
          menuItem: menuItem._id,
          name: menuItem.name,
          quantity: item.quantity,
          price: menuItem.price,
          selectedOptions: item.selectedOptions || {},
        };
      })
    );

    const newTotal = populatedItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    if (existingOrder) {
      // ⭐ اضافه کردن آیتم‌های جدید به سفارش قبلی
      existingOrder.items.push(...populatedItems);
      existingOrder.totalAmount += newTotal;
      await existingOrder.save();

      const populated = await Order.findById(existingOrder._id).populate(
        "items.menuItem",
        "name price"
      );

      return NextResponse.json({
        message: "Items added to existing order",
        order: populated,
      });
    } else {
      // ⭐ ایجاد سفارش جدید
      const lastOrder = await Order.findOne({ restaurant: decoded.restaurant })
        .sort({ orderNumber: -1 })
        .select("orderNumber");

      const nextOrderNumber = lastOrder ? lastOrder.orderNumber + 1 : 1;

      const newOrder = await Order.create({
        restaurant: decoded.restaurant,
        orderNumber: nextOrderNumber,
        customerName,
        customerPhone,
        tableId: tableId || null,
        sessionId: sessionId || null,
        items: populatedItems,
        totalAmount: newTotal,
      });

      const populated = await Order.findById(newOrder._id).populate(
        "items.menuItem",
        "name price"
      );

      return NextResponse.json({
        message: "Order created successfully",
        order: populated,
      });
    }
  } catch (error: any) {
    console.error("Error creating/updating order:", error);
    return NextResponse.json(
      { message: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}