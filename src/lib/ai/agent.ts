// src/lib/ai/agent-chat-mode.ts
import { Restaurant } from "@/lib/models/Restaurant";
import { MenuItem } from "../models/MenuItem";
import { Order } from "@/lib/models/Order";

export async function runAgentChatMode(
  messages: any[],
  sessionId: string,
  tableId: number | null
) {
  try {
    const menuItems = await MenuItem.find().select("name price _id").lean();
    const restaurant = await Restaurant.findOne({ slug: "restaurant" });

    if (!restaurant) throw new Error("Restaurant not found");

    const menuText = menuItems
      .map((item: any) => `- ${item.name}: ${item.price.toLocaleString()} تومان`)
      .join("\n");

    const systemPrompt = `شما یک دستیار هوشمند سفارش‌گیری هستید که از طرف مشتری سفارش ثبت می‌کنید.

**منوی رستوران:**
${menuText}

**قوانین مهم:**
1. فقط درباره رستوران، منو و سفارش غذا صحبت کنید. به سوالات خارج از این موضوع پاسخ ندهید و به مشتری بگویید که فقط می‌توانید در مورد سفارش غذا کمک کنید.
2. وقتی مشتری سفارش می‌دهد، حتماً نام دقیق غذا را همانطور که در منو است ذکر کنید.
3. وقتی مشتری می‌گوید "تایید"، "ثبت کن"، "بله"، "آره"، "yes"، "yeah"، "confirm" یا عبارات مشابه، حتماً [SUBMIT_ORDER] را در پاسخ خود قرار دهید.
4. با زبانی که مشتری با شما صحبت می‌کند پاسخ دهید (فارسی، انگلیسی یا هر زبان دیگر).
5. مودب و دوستانه باشید.
6. اگر مشتری سوالی خارج از موضوع رستوران و غذا پرسید، به او یادآوری کنید که شما فقط برای سفارش‌گیری هستید.

**مثال‌ها:**
مشتری: یه کباب کوبیده  
شما: حتماً! یک کباب کوبیده (۱۲۰,۰۰۰ تومان). تایید می‌کنید؟  
مشتری: آره  
شما: عالی! سفارش شما ثبت شد. [SUBMIT_ORDER]

Customer: One pizza  
You: Sure! One pizza (150,000 Toman). Would you like to confirm?  
Customer: Yes  
You: Great! Your order has been placed. [SUBMIT_ORDER]

مشتری: هوا چطوره؟  
شما: متاسفم، من فقط می‌تونم در مورد سفارش غذا کمکتون کنم. چه غذایی دوست دارید سفارش بدید؟
`;

    const allMessages = [
      { role: "system", content: systemPrompt },
      ...messages.map((m: any) => ({ role: m.role, content: m.content })),
    ];

    console.log("🔵 [AGENT-CHAT] Calling GapGPT...");

    const response = await fetch("https://api.gapgpt.app/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.GAPGPT_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: allMessages,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ [AGENT-CHAT] GapGPT Error:", errorText);
      throw new Error(`API Error: ${response.status}`);
    }

    const data = await response.json();
    const aiMessage =
      data.choices[0]?.message?.content || "متاسفم، نتوانستم پاسخ دهم.";

    console.log("🤖 [AGENT-CHAT] AI Response:", aiMessage);

    const conversationText = messages.map((m: any) => m.content).join(" ");
    console.log("📜 [AGENT-CHAT] Full Conversation:", conversationText);

    const addedItems: any[] = [];
    menuItems.forEach((item: any) => {
      if (conversationText.includes(item.name)) {
        addedItems.push({
          id: item._id.toString(),
          name: item.name,
          price: item.price,
        });
      }
    });

    console.log("📋 [AGENT-CHAT] Detected Items:", addedItems);

    let orderId = null;
    let orderSubmitted = false;

    if (aiMessage.includes("[SUBMIT_ORDER]") && addedItems.length > 0) {
      console.log("🔥 [AGENT-CHAT] Submitting order...");
      console.log("📍 [AGENT-CHAT] Table ID:", tableId);

      const orderItems = addedItems.map((item) => ({
        menuItem: item.id,
        name: item.name,
        quantity: 1,
        price: item.price,
        selectedOptions: {},
      }));

      const totalAmount = addedItems.reduce((sum, item) => sum + item.price, 0);

      let order = null;

      if (tableId && sessionId) {
        order = await Order.findOne({
          tableId,
          sessionId,
          isFinalized: false,
        });
      } else if (sessionId) {
        order = await Order.findOne({
          sessionId,
          isFinalized: false,
        });
      }

      if (order) {
        console.log("🔄 [AGENT-CHAT] Updating existing order:", order._id);

        orderItems.forEach((newItem) => {
          const existingItem = order.items.find(
            (item: any) => item.menuItem.toString() === newItem.menuItem
          );

          if (existingItem) {
            existingItem.quantity += newItem.quantity;
          } else {
            order.items.push(newItem);
          }
        });

        order.totalAmount = order.items.reduce(
          (sum: number, item: any) => sum + item.price * item.quantity,
          0
        );

        await order.save();

        const populatedOrder = await Order.findById(order._id)
          .populate("restaurant", "name")
          .populate("items.menuItem", "name price")
          .lean();

        console.log("✅ [AGENT-CHAT] Order Updated:", populatedOrder);

        if (global.io) {
          global.io.emit("order-updated", populatedOrder);
        }

        orderId = populatedOrder._id.toString();
        orderSubmitted = true;
      } else {
        console.log("🆕 [AGENT-CHAT] Creating new order");

        const lastOrder = await Order.findOne().sort({ orderNumber: -1 });
        const orderNumber = (lastOrder?.orderNumber || 0) + 1;

        const newOrder = await Order.create({
          restaurant: restaurant._id,
          orderNumber,
          customerName: `مهمان ${sessionId.slice(0, 6)}`,
          customerPhone: "N/A",
          items: orderItems,
          totalAmount,
          tableId: tableId || null,
          sessionId,
          status: "pending",
          isFinalized: false,
        });

        const populatedOrder = await Order.findById(newOrder._id)
          .populate("restaurant", "name")
          .populate("items.menuItem", "name price")
          .lean();

        console.log("✅ [AGENT-CHAT] New Order Created:", populatedOrder);

        if (global.io) {
          global.io.emit("new-order", populatedOrder);
        }

        orderId = populatedOrder._id.toString();
        orderSubmitted = true;
      }
    } else {
      console.log(
        "⚠️ [AGENT-CHAT] No [SUBMIT_ORDER] detected or no items found"
      );
    }

    return {
      message: aiMessage.replace("[SUBMIT_ORDER]", "").trim(),
      addedItems,
      orderSubmitted,
      orderId,
    };
  } catch (error: any) {
    console.error("❌ [AGENT-CHAT] Error:", error);
    throw error;
  }
}
