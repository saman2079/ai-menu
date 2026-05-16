import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { MenuItem } from "@/lib/models/MenuItem";
import Category from "@/lib/models/Category";

export async function GET(req: Request) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");

    const filter: any = { isAvailable: true };

    if (category) {
      filter.category = category;
    }

    const items = await MenuItem.find(filter)
      .populate("category", "name title slug")
      .sort({ createdAt: -1 })
      .lean();

    const categories = await Category.find({ isActive: true })
      .sort({ name: 1 })
      .lean();

    return NextResponse.json({
      items,
      categories,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "خطا در دریافت منو" },
      { status: 500 }
    );
  }
}
