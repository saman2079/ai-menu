import { Restaurant } from "@/lib/models/Restaurant";
import { MenuItem } from "@/lib/models/MenuItem";
import { Order } from "@/lib/models/Order";
import "@/lib/models/Category";
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
  const jsonStr = data.choices?.[0]?.message?.content || "[]";

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
  const lowerText = (userText || "").toLowerCase();

  menuItems.forEach((item: any) => {
    const name = (item.name || "").toLowerCase();
    const words = name.split(/\s+/).filter((w: string) => w.length > 1);

    const matchedWord = words.find((word) => {
      if (!lowerText.includes(word)) return false;

      const otherItems = menuItems.filter(
        (other: any) => other._id.toString() !== item._id.toString()
      );

      return !otherItems.some((other: any) =>
        (other.name || "").toLowerCase().includes(word)
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

function normalizeText(text: string) {
  return (text || "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ");
}

function getFilteredMenuItemsByUserText(userText: string, menuItems: any[]) {
  const text = normalizeText(userText);

  const showAllKeywords = [
    "منو",
    "menu",
    "همه",
    "کل منو",
    "لیست",
    "لیست غذا",
    "غذاها",
  ];

  if (showAllKeywords.some((k) => text.includes(normalizeText(k)))) {
    return menuItems;
  }

  const categoriesMap = new Map();

  for (const item of menuItems) {
    if (!item.category) continue;

    const categoryId =
      item.category?._id?.toString?.() || item.category?.toString?.();
    if (!categoryId) continue;

    if (!categoriesMap.has(categoryId)) {
      categoriesMap.set(categoryId, {
        _id: categoryId,
        name: item.category?.name || "",
        title: item.category?.title || "",
        slug: item.category?.slug || "",
      });
    }
  }

  const categories = Array.from(categoriesMap.values());

  const matchedCategory = categories.find((cat: any) => {
    const values = [
      normalizeText(cat.name),
      normalizeText(cat.title),
      normalizeText(cat.slug),
    ].filter(Boolean);

    return values.some((value) => {
      if (text.includes(value) || value.includes(text)) return true;

      const words = value.split(" ").filter(Boolean);
      return words.some((word) => word.length > 1 && text.includes(word));
    });
  });

  if (matchedCategory) {
    return menuItems.filter((item: any) => {
      const itemCategoryId =
        item.category?._id?.toString?.() || item.category?.toString?.();
      return itemCategoryId === matchedCategory._id;
    });
  }

  const directMatches = menuItems.filter((item: any) => {
    const itemName = normalizeText(item.name);

    if (text.includes(itemName) || itemName.includes(text)) return true;

    const words = itemName.split(" ").filter(Boolean);
    return words.some((word) => word.length > 1 && text.includes(word));
  });

  if (directMatches.length > 0) {
    return directMatches;
  }

  return [];
}

// --- تابع اصلی ---
export async function runAgentChatMode(
  messages: any[],
  sessionId: string,
  tableId: number | null
) {
  try {
    const menuItems = await MenuItem.find({ isAvailable: true })
      .select("name price _id images description category")
      .populate("category", "name slug title")
      .lean();

    const restaurant = await Restaurant.findOne({ slug: "restaurant" });
    if (!restaurant) throw new Error("Restaurant not found");

    const menuText = menuItems
      .map(
        (item: any) =>
          `- ${item.name}: ${Number(item.price || 0).toLocaleString()} تومان${item.description ? ` | ${item.description}` : ""
          }`
      )
      .join("\n");

    const lastUserMessage =
      [...messages].reverse().find((m: any) => m.role === "user")?.content || "";

    const confirmationWords = [
      "بله",
      "آره",
      "اره",
      "تایید",
      "تأیید",
      "اوکی",
      "ok",
      "yes",
    ];

    const isConfirmation = confirmationWords.some((word) =>
      normalizeText(lastUserMessage).includes(normalizeText(word))
    );

    const filteredMenuItems = getFilteredMenuItemsByUserText(
      lastUserMessage,
      menuItems
    );

    let menuCards = filteredMenuItems.map((item: any) => ({
      id: item._id.toString(),
      name: item.name,
      price: item.price,
      description: item.description || "",
      images: item.images || [],
    }));

    const systemPrompt = `
شما دستیار سفارش‌گیر رستوران ${restaurant.name} هستید.

وظایف شما:
1) خیلی کوتاه، طبیعی و مودبانه به کاربر جواب بده.
2) اگر کاربر درخواست دیدن منو یا بخشی از منو را داشت، داخل متن پیام اسم غذاها و قیمت‌ها را تکرار نکن.
3) وقتی قرار است کارت‌های منو در فرانت نمایش داده شوند، فقط یک پیام کوتاه بده. مثل:
- "منو برای شما نمایش داده شد."
- "این بخش از منو برای شما نمایش داده شد."
- "لطفاً از بین آیتم‌ها انتخاب کنید."
4) اگر کاربر سفارشی ثبت کرد و آیتم‌ها مشخص بودند، در پاسخ خود حتماً تگ [SUBMIT_ORDER] را قرار بده.
5) اگر آیتم‌ها و تعدادشان را تشخیص دادی، این تگ را هم دقیقاً اضافه کن:
[ORDER_ITEMS:[{"name":"نام دقیق آیتم","quantity":2}]]
6) فقط از آیتم‌های واقعی همین منو استفاده کن و اسم جدید نساز.
7) اگر کاربر سلام یا سؤال عمومی داشت، عادی جواب بده.
8) اگر چیزی نامشخص بود، خیلی کوتاه سؤال تکمیلی بپرس.

منوی رستوران:
${menuText}
`.trim();

    const apiMessages = [
      { role: "system", content: systemPrompt },
      ...messages.map((m: any) => ({
        role: m.role,
        content: m.content,
      })),
    ];

    const response = await fetch("https://api.gapgpt.app/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.GAPGPT_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: apiMessages,
        temperature: 0.4,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("GapGPT error:", response.status, errText);
      return {
        message: "خطا در دریافت پاسخ از دستیار.",
        menuCards,
        addedItems: [],
        orderSubmitted: false,
        orderId: null,
      };
    }

    const data = await response.json();
    const aiMessage = data.choices?.[0]?.message?.content || "پاسخی دریافت نشد";

    const hasSubmitOrder = aiMessage.includes("[SUBMIT_ORDER]");

    const allConversationText = messages
      .map((m: any) => `${m.role}: ${m.content}`)
      .join("\n");

    const orderItemsMatch = aiMessage.match(/\[ORDER_ITEMS:(.*?)\]/s);

    let parsedItemsFromTag: any[] = [];
    if (orderItemsMatch?.[1]) {
      try {
        parsedItemsFromTag = JSON.parse(orderItemsMatch[1]);
      } catch (e) {
        console.error("Failed to parse ORDER_ITEMS:", orderItemsMatch[1]);
      }
    }

    let addedItems: any[] = [];

    // اول از تگ ORDER_ITEMS استفاده کن
    if (parsedItemsFromTag.length > 0) {
      addedItems = parsedItemsFromTag
        .map((ordered: any) => {
          const matched = menuItems.find(
            (menu: any) =>
              normalizeText(menu.name) === normalizeText(ordered.name)
          );

          if (!matched) return null;

          return {
            id: matched._id.toString(),
            name: matched.name,
            price: matched.price,
            quantity: Number(ordered.quantity || 1),
          };
        })
        .filter(Boolean);
    }

    // اگه خالی بود، با AI extract کن
    if (hasSubmitOrder && addedItems.length === 0) {
      addedItems = fallbackUserMessageExtraction(
        lastUserMessage,
        menuItems
      );
      if (addedItems.length > 0) {
        menuCards = [];
      }
      const aiExtracted = await extractItemsWithAI(allConversationText, menuText);

      if (Array.isArray(aiExtracted) && aiExtracted.length > 0) {
        addedItems = aiExtracted
          .map((ordered: any) => {
            const matched = menuItems.find(
              (menu: any) =>
                normalizeText(menu.name) === normalizeText(ordered.name)
            );

            if (!matched) return null;

            return {
              id: matched._id.toString(),
              name: matched.name,
              price: matched.price,
              quantity: Number(ordered.quantity || 1),
            };
          })
          .filter(Boolean);
      }
    }

    // اگه بازم خالی بود، fallback کن
    if (hasSubmitOrder && addedItems.length === 0) {
      addedItems = fallbackUserMessageExtraction(lastUserMessage, menuItems);
    }

    const displayMessage = aiMessage
      .replace(/\[SUBMIT_ORDER\]/g, "")
      .replace(/\[ORDER_ITEMS:.*?\]/gs, "")
      .trim();

    let orderSubmitted = false;
    let orderId: string | null = null;

    // فقط وقتی سفارش ثبت کن که هم تگ وجود داشته باشه هم آیتم
    if (hasSubmitOrder && addedItems.length > 0) {
      try {
        const orderItems = addedItems.map((item) => ({
          menuItem: item.id,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
        }));

        const totalAmount = orderItems.reduce(
          (sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 0),
          0
        );

        // اول چک کن Order قبلی هست یا نه
        const existingOrder = await Order.findOne({
          sessionId,
          restaurant: restaurant._id,
          isFinalized: false,
        });

        if (existingOrder) {
          // آپدیت Order قبلی
          existingOrder.items = orderItems;
          existingOrder.totalAmount = totalAmount;
          if (tableId) {
            existingOrder.tableId = String(tableId);
          }
          const savedOrder = await existingOrder.save();
          orderId = savedOrder._id.toString();
          orderSubmitted = true;

          // populate کن برای socket
          const populated = await Order.findById(savedOrder._id)
            .populate("restaurant", "name")
            .populate("items.menuItem", "name price");

          if ((global as any).io && populated) {
            (global as any).io.emit("order-updated", populated);
          }
        } else {
          // Order جدید بساز
          const orderCount = await Order.countDocuments({
            restaurant: restaurant._id,
          });

          const newOrder = await Order.create({
            restaurant: restaurant._id,
            sessionId,
            tableId: tableId ? String(tableId) : undefined,
            orderNumber: orderCount + 1,
            customerName: `مهمان ${sessionId.slice(0, 6)}`,
            customerPhone: "N/A",
            items: orderItems,
            totalAmount,
            status: "pending",
            isFinalized: false,
          });

          orderId = newOrder._id.toString();
          orderSubmitted = true;

          // populate کن برای socket
          const populated = await Order.findById(newOrder._id)
            .populate("restaurant", "name")
            .populate("items.menuItem", "name price");

          if ((global as any).io && populated) {
            (global as any).io.emit("new-order", populated);
          }
        }
      } catch (orderError) {
        console.error("Order creation/update failed:", orderError);
        // اگه سفارش ثبت نشد، برگرد با پیام خطا
        return {
          message: "متأسفانه در ثبت سفارش خطایی رخ داد. لطفاً دوباره تلاش کنید.",
          menuCards,
          addedItems,
          orderSubmitted: false,
          orderId: null,
        };
      }
    }

    return {
      message: displayMessage || "درخواست شما بررسی شد.",
      menuCards,
      addedItems,
      orderSubmitted,
      orderId,
    };
  } catch (orderError: any) {
    console.log("================================");
    console.log("ORDER ERROR");
    console.log(orderError);
    console.log("MESSAGE:", orderError?.message);
    console.log("ERRORS:", orderError?.errors);
    console.log("STACK:", orderError?.stack);
    console.log("================================");

    return {
      message:
        orderError?.message ||
        "متأسفانه در ثبت سفارش خطایی رخ داد. لطفاً دوباره تلاش کنید.",
      menuCards,
      addedItems,
      orderSubmitted: false,
      orderId: null,
    };
  }
}
