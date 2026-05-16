import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import "dotenv/config";

import Admin from "../src/lib/models/Admin";
import { Restaurant } from "../src/lib/models/Restaurant";
import Category from "../src/lib/models/Category";
import { MenuItem } from "../src/lib/models/MenuItem";

const MONGODB_URI = process.env.MONGODB_URI || "";

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("✅ متصل به MongoDB");

    // پاک کردن داده‌های قبلی
    await Admin.deleteMany({});
    await Restaurant.deleteMany({});
    await Category.deleteMany({});
    await MenuItem.deleteMany({});
    console.log("🗑️  داده‌های قبلی پاک شد");

    // ساخت Restaurant
    const restaurant = await Restaurant.create({
      name: "رستوران سنتی",
      slug: "restaurant",
      address: "تهران، خیابان ولیعصر، پلاک ۱۲۳",
      phone: "02112345678",
      email: "info@restaurant.com",
      description: "رستوران سنتی با غذاهای اصیل ایرانی",
      isActive: true,
    });
    console.log("✅ Restaurant created:", restaurant._id.toString());

    // ساخت Admin
    const hashedPassword = await bcrypt.hash("admin123", 12);
    const admin = await Admin.create({
      email: "admin@restaurant.com",
      password: hashedPassword,
      name: "مدیر رستوران",
      role: "admin",
      restaurant: restaurant._id,
    });
    console.log("✅ Admin created");

    // ساخت Categories
    const cat1 = await Category.create({
      name: "کباب‌ها",
      slug: "kebabs",
      title: "کباب‌های سنتی",
      image: "",
      isActive: true,
    });

    const cat2 = await Category.create({
      name: "پیش‌غذا",
      slug: "starters",
      title: "پیش‌غذاها",
      image: "",
      isActive: true,
    });

    const cat3 = await Category.create({
      name: "نوشیدنی",
      slug: "drinks",
      title: "نوشیدنی‌ها",
      image: "",
      isActive: true,
    });

    console.log("✅ Categories created");

    // ساخت Menu Items
    await MenuItem.create({
      name: "کباب کوبیده",
      description: "کباب کوبیده سنتی با گوشت گوسفند تازه، همراه با برنج زعفرانی",
      images: [],
      price: 250000,
      ingredients: ["گوشت گوسفند", "پیاز", "زعفران", "برنج"],
      preparationTime: 20,
      category: cat1._id,
      isAvailable: true,
    });

    await MenuItem.create({
      name: "کباب برگ",
      description: "فیله گوساله مرینیت شده با ادویه‌های مخصوص",
      images: [],
      price: 350000,
      ingredients: ["فیله گوساله", "زعفران", "لیمو", "برنج"],
      preparationTime: 25,
      category: cat1._id,
      isAvailable: true,
    });

    await MenuItem.create({
      name: "جوجه کباب",
      description: "جوجه کباب با مرغ تازه و ادویه‌های خوشمزه",
      images: [],
      price: 200000,
      ingredients: ["مرغ", "زعفران", "لیمو", "برنج"],
      preparationTime: 20,
      category: cat1._id,
      isAvailable: true,
    });

    await MenuItem.create({
      name: "سالاد شیرازی",
      description: "گوجه، خیار، پیاز تازه با آب‌لیمو و نعناع",
      images: [],
      price: 50000,
      ingredients: ["گوجه", "خیار", "پیاز", "لیمو", "نعناع"],
      preparationTime: 5,
      category: cat2._id,
      isAvailable: true,
    });

    await MenuItem.create({
      name: "ماست و خیار",
      description: "ماست سنتی با خیار و نعناع خشک",
      images: [],
      price: 40000,
      ingredients: ["ماست", "خیار", "نعناع"],
      preparationTime: 5,
      category: cat2._id,
      isAvailable: true,
    });

    await MenuItem.create({
      name: "دوغ",
      description: "دوغ سنتی خانگی",
      images: [],
      price: 20000,
      ingredients: ["ماست", "نعناع", "آب"],
      preparationTime: 2,
      category: cat3._id,
      isAvailable: true,
    });

    await MenuItem.create({
      name: "نوشابه",
      description: "نوشابه گازدار سرد",
      images: [],
      price: 25000,
      ingredients: [],
      preparationTime: 1,
      category: cat3._id,
      isAvailable: true,
    });

    console.log("✅ Menu Items created");

    console.log("\n🎉 Seed کامل شد!");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("📧 Email: admin@restaurant.com");
    console.log("🔑 Password: admin123");
    console.log("🏪 Restaurant: رستوران سنتی");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━");

    await mongoose.disconnect();
    console.log("✅ اتصال قطع شد");
  } catch (error) {
    console.error("❌ خطا در seed:", error);
    process.exit(1);
  }
}

seed();
