// src/app/api/orders/route.ts
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { Order } from "@/lib/models/Order";
import { MenuItem } from "@/lib/models/MenuItem";
import { Restaurant } from "@/lib/models/Restaurant";

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const { customerName, customerPhone, items, tableId, sessionId } = await req.json();

    // 🔍 لاگ ورودی
    console.log("📥 Received order request:", {
      customerName,
      tableId,
      sessionId,
      itemsCount: items?.length,
    });

    if (!items || items.length === 0) {
      return NextResponse.json({ message: "No items provided" }, { status: 400 });
    }

    const restaurant = await Restaurant.findOne();
    if (!restaurant) {
      return NextResponse.json({ message: "Restaurant not found" }, { status: 404 });
    }

    // ⭐ اگه tableId و sessionId داریم، سفارش قبلی رو پیدا کن
    let existingOrder = null;
    if (tableId && sessionId) {
      existingOrder = await Order.findOne({
        tableId,
        sessionId,
        isFinalized: false,
        restaurant: restaurant._id,
      });
      
      // 🔍 لاگ نتیجه جستجو
      if (existingOrder) {
        console.log("🔍 Found existing order:", {
          orderId: existingOrder._id,
          orderNumber: existingOrder.orderNumber,
          currentItemsCount: existingOrder.items.length,
        });
      } else {
        console.log("🆕 No existing order found, will create new one");
      }
    } else {
      console.log("⚠️ Missing tableId or sessionId:", { tableId, sessionId });
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

      console.log("✅ Updated existing order:", {
        orderId: existingOrder._id,
        newItemsCount: existingOrder.items.length,
        newTotal: existingOrder.totalAmount,
      });

      const populated = await Order.findById(existingOrder._id)
        .populate("restaurant", "name")
        .populate("items.menuItem", "name price");

      // ⭐ Socket برای آپدیت
      if (global.io) {
        global.io.emit("order-updated", populated);
      }

      return NextResponse.json({
        message: "Items added to existing order",
        order: populated,
      });
    } else {
      // ⭐ ایجاد سفارش جدید
      const lastOrder = await Order.findOne({ restaurant: restaurant._id })
        .sort({ orderNumber: -1 })
        .select("orderNumber");

      const nextOrderNumber = lastOrder ? lastOrder.orderNumber + 1 : 1;

      const newOrder = await Order.create({
        restaurant: restaurant._id,
        orderNumber: nextOrderNumber,
        customerName: customerName || "Guest",
        customerPhone: customerPhone || "0000000000",
        tableId: tableId || null,
        sessionId: sessionId || null,
        items: populatedItems,
        totalAmount: newTotal,
        status: "pending",
        isFinalized: false,
      });

      console.log("✅ Created new order:", {
        orderId: newOrder._id,
        orderNumber: newOrder.orderNumber,
        tableId: newOrder.tableId,
        sessionId: newOrder.sessionId,
        itemsCount: newOrder.items.length,
      });

      const populated = await Order.findById(newOrder._id)
        .populate("restaurant", "name")
        .populate("items.menuItem", "name price");

      // ⭐ Socket برای سفارش جدید
      if (global.io) {
        global.io.emit("new-order", populated);
      }

      return NextResponse.json({
        message: "Order created successfully",
        order: populated,
      });
    }
  } catch (error: any) {
    console.error("❌ Error creating/updating order:", error);
    return NextResponse.json(
      { message: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
