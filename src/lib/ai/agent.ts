import { Restaurant } from "@/lib/models/Restaurant";
import { MenuItem } from "../models/MenuItem";
import { Order } from "@/lib/models/Order";

// تابع کمکی برای استخراج آیتم‌ها با استفاده از خود مدل زبانی
async function extractItemsWithAI(
  conversationText: string,
  menuText: string
): Promise<any[]> {
  const extractionPrompt = `You are an order extractor. Given the conversation, output a JSON array of ordered items with their EXACT names from the menu and quantities.
Menu:
${menuText}

Conversation:
${conversationText}

Output ONLY a JSON array: [{"name": "exact menu item", "quantity": number}]. If none, return []. No extra text.`;

  const response = await fetch("https://api.gapgpt.app/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.GAPGPT_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: extractionPrompt }],
      temperature: 0.0,
    }),
  });

  if (!response.ok) {
    console.error("Extraction API failed:", response.status);
    return [];
  }

  const data = await response.json();
  const jsonStr = data.choices[0]?.message?.content || "[]";
  try {
    return JSON.parse(jsonStr);
  } catch (e) {
    console.error("Failed to parse extraction JSON:", jsonStr);
    return [];
  }
}

// استخراج اضطراری با تطابق بخشی از نام‌ها
function fallbackUserMessageExtraction(
  userText: string,
  menuItems: any[]
): any[] {
  const found: any[] = [];
  const lowerText = userText.toLowerCase();

  menuItems.forEach((item: any) => {
    const name = item.name.toLowerCase();
    const words = name.split(/\s+/).filter((w: string) => w.length > 1);

    const matchedWord = words.find((word) => {
      if (!lowerText.includes(word)) return false;
      const otherItems = menuItems.filter(
        (other: any) => other._id.toString() !== item._id.toString()
      );
      return !otherItems.some((other: any) =>
        other.name.toLowerCase().includes(word)
      );
    });

    if (matchedWord) {
      found.push({
        id: item._id.toString(),
        name: item.name,
        price: item.price,
        quantity: 1,
      });
    }
  });

  return found;
}

// --- تابع اصلی ---
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

    // ✅ پرامپت بهبودیافته - تأکید بر درج ORDER_ITEMS در تمام تغییرات
    const systemPrompt = `شما یک دستیار هوشمند سفارش‌گیری هستید.

**منوی رستوران:**
${menuText}

**قوانین حیاتی:**
1. فقط درباره رستوران، منو و سفارش غذا صحبت کنید.
2. هرگاه سفارش جدیدی دریافت کردید یا سفارش موجود را تغییر دادید، حتماً در همان پاسخ عبارت [ORDER_ITEMS:نام دقیق از منو:تعداد, ...] را قرار دهید.
   مثال: [ORDER_ITEMS:کباب کوبیده:2,دوغ:1]
3. وقتی مشتری تایید کرد، حتماً [SUBMIT_ORDER] را در پاسخ قرار دهید.
4. نام غذاها را دقیقاً از منو استفاده کنید (نه اختصاری).
5. **در تگ ORDER_ITEMS، همیشه وضعیت نهایی سفارش را نشان دهید (نه فقط تغییرات).**
6. اگر مشتری غذا را عوض کرد، در تگ ORDER_ITEMS فقط غذاهای جدید را قرار دهید و غذاهای قدیمی حذف شده را حذف کنید.
7. مودب و دوستانه باشید.
8. به سوالات خارج از موضوع پاسخ ندهید.

**الگوها:**
- کاربر: "یه کوبیده"  
  دستیار: "یک کباب کوبیده (۲۵۰,۰۰۰). تایید می‌کنید؟ [ORDER_ITEMS:کباب کوبیده:1]"
- کاربر: "آره"  
  دستیار: "سفارش ثبت شد. [SUBMIT_ORDER]"
- کاربر: "نه، بجای کوبیده برگ بزار"  
  دستیار: "تغییر اعمال شد. کباب برگ (۳۵۰,۰۰۰) جایگزین کباب کوبیده شد. تایید می‌کنید؟ [ORDER_ITEMS:کباب برگ:1]"`;

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
      console.error("❌ GapGPT Error:", errorText);
      throw new Error(`API Error: ${response.status}`);
    }

    const data = await response.json();
    const aiMessage =
      data.choices[0]?.message?.content || "متاسفم، نتوانستم پاسخ دهم.";
    console.log("🤖 AI Response:", aiMessage);

    // 1. ✅ جستجوی **آخرین** تگ [ORDER_ITEMS] در کل مکالمه
    let addedItems: any[] = [];
    
    // جمع‌آوری تمام پیام‌های دستیار (قدیمی + جدید)
    const allAssistantMessages = [
      ...messages.filter((m: any) => m.role === "assistant").map((m: any) => m.content),
      aiMessage,
    ];
    
    // جستجوی تمام تگ‌های ORDER_ITEMS
    const allTags: string[] = [];
    allAssistantMessages.forEach(content => {
      const tags = content.match(/\[ORDER_ITEMS:(.+?)\]/g);
      if (tags) {
        tags.forEach(tag => allTags.push(tag));
      }
    });
    
    // استفاده از آخرین تگ
    if (allTags.length > 0) {
      const lastTag = allTags[allTags.length - 1];
      const match = lastTag.match(/\[ORDER_ITEMS:(.+?)\]/);
      if (match) {
        const itemsStr = match[1];
        const itemParts = itemsStr.split(",");
        itemParts.forEach((part) => {
          const [rawName, qtyStr] = part.trim().split(":");
          const itemName = rawName.trim();
          const qty = parseInt(qtyStr) || 1;

          const menuMatch = menuItems.find(
            (m: any) => m.name.trim() === itemName
          );
          if (menuMatch) {
            addedItems.push({
              id: menuMatch._id.toString(),
              name: menuMatch.name,
              price: menuMatch.price,
              quantity: qty,
            });
          }
        });
        console.log("📋 استخراج از آخرین ORDER_ITEMS:", addedItems);
      }
    }

    // 2. اگر آیتمی پیدا نشد ولی تگ SUBMIT_ORDER وجود دارد، با AI استخراج کن
    if (addedItems.length === 0 && aiMessage.includes("[SUBMIT_ORDER]")) {
      console.log("⚠️ تگ ORDER_ITEMS یافت نشد. درخواست استخراج با AI...");
      const fullConversation = allMessages
        .map((m: any) => `${m.role}: ${m.content}`)
        .join("\n");
      const extracted = await extractItemsWithAI(fullConversation, menuText);
      addedItems = extracted.map((e: any) => {
        const match = menuItems.find(
          (m: any) => m.name.trim() === e.name.trim()
        );
        if (!match) return null;
        return {
          id: match._id.toString(),
          name: match.name,
          price: match.price,
          quantity: e.quantity || 1,
        };
      }).filter(Boolean);
      console.log("📋 استخراج توسط AI:", addedItems);
    }

    // 3. آخرین شانس: جستجوی اضطراری در پیام‌های کاربر
    if (addedItems.length === 0 && aiMessage.includes("[SUBMIT_ORDER]")) {
      const userText = messages
        .filter((m: any) => m.role === "user")
        .map((m: any) => m.content)
        .join(" ");
      addedItems = fallbackUserMessageExtraction(userText, menuItems);
      console.log("📋 استخراج از پیام‌های کاربر (حالت اضطراری):", addedItems);
    }

    // حذف تگ‌ها از پاسخ قابل نمایش
    const displayMessage = aiMessage
      .replace(/\[SUBMIT_ORDER\]/g, "")
      .replace(/\[ORDER_ITEMS:(.+?)\]/g, "")
      .trim();

    console.log("📋 آیتم‌های نهایی:", addedItems);

    let orderId = null;
    let orderSubmitted = false;

    if (aiMessage.includes("[SUBMIT_ORDER]") && addedItems.length > 0) {
      console.log("🔥 ثبت/به‌روزرسانی سفارش...");
      const orderItems = addedItems.map((item) => ({
        menuItem: item.id,
        name: item.name,
        quantity: item.quantity || 1,
        price: item.price,
        selectedOptions: {},
      }));

      const totalAmount = addedItems.reduce(
        (sum, item) => sum + item.price * (item.quantity || 1),
        0
      );

      let order;
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
        // ✅ **اصلاح اصلی: جایگزینی کامل آیتم‌ها به جای ادغام**
        console.log("🔄 به‌روزرسانی سفارش موجود:", order._id);
        console.log("📦 آیتم‌های قبلی:", order.items.length);
        console.log("📦 آیتم‌های جدید:", orderItems.length);
        
        // جایگزینی کامل لیست آیتم‌ها
        order.items = orderItems;
        order.totalAmount = totalAmount;
        await order.save();

        const populated = await Order.findById(order._id)
          .populate("restaurant", "name")
          .populate("items.menuItem", "name price")
          .lean();
        if (global.io) global.io.emit("order-updated", populated);
        orderId = populated._id.toString();
        orderSubmitted = true;
        
        console.log("✅ سفارش با موفقیت به‌روزرسانی شد");
      } else {
        // ایجاد سفارش جدید
        console.log("🆕 ایجاد سفارش جدید");
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

        const populated = await Order.findById(newOrder._id)
          .populate("restaurant", "name")
          .populate("items.menuItem", "name price")
          .lean();
        if (global.io) global.io.emit("new-order", populated);
        orderId = populated._id.toString();
        orderSubmitted = true;
      }
    } else {
      console.log("⚠️ [SUBMIT_ORDER] یا آیتم یافت نشد");
    }

    return {
      message: displayMessage,
      addedItems,
      orderSubmitted,
      orderId,
    };
  } catch (error: any) {
    console.error("❌ Error:", error);
    throw error;
  }
}
