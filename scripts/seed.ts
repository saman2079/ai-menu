import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import "dotenv/config";

import Admin from "../src/lib/models/Admin";
import { Restaurant } from "../src/lib/models/Restaurant";

const MONGODB_URI = process.env.MONGODB_URI || "";

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("✅ متصل به MongoDB");

    // پاک کردن داده‌های قبلی
    await Admin.deleteMany({});
    await Restaurant.deleteMany({});
    console.log("🗑️ داده‌های قبلی پاک شد");

    // ساخت Restaurant
    const restaurant = await Restaurant.create({
      name: "رستوران سنتی",
      slug: "restaurant",
      address: "تهران",
      phone: "02112345678",
      email: "info@restaurant.com",
      description: "رستوران سنتی",
      isActive: true,
    });

    console.log("✅ Restaurant created");

    // هش کردن پسورد
    const hashedPassword = await bcrypt.hash("admin123", 12);

    // ساخت Admin کامل
    await Admin.create({
      email: "admin@restaurant.com",
      password: hashedPassword,
      name: "admin",
      role: "admin",
      restaurant: restaurant._id,
      isActive: true,
      lastLogin: new Date(),
      permissions: {
        canManageCategories: true,
        canManageMenu: true,
        canManageOrders: true,
        canManageQRCodes: true,
        canManageSettings: true,
        canManageStaff: true,
        canViewReports: true,
      },
    });

    console.log("✅ Admin created");

    console.log("\n🎉 Seed کامل شد!");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("📧 Email: admin@restaurant.com");
    console.log("🔑 Password: admin123");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━");

    await mongoose.disconnect();
    console.log("✅ اتصال قطع شد");
  } catch (error) {
    console.error("❌ خطا در seed:", error);
    process.exit(1);
  }
}

seed();
