import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { MenuItem } from "@/lib/models/MenuItem";
import Category from "@/lib/models/Category";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const categoryId = searchParams.get("category");

    let query: any = { isAvailable: true };
    if (categoryId) {
      query.category = new mongoose.Types.ObjectId(categoryId);
    }
    const items = await MenuItem.find(query)
      .populate("category", "name")
      .sort({ name: 1 });

    const categories = await Category.find().sort({ name: 1 });

    return NextResponse.json({
      items,
      categories,
    });
  } catch (error: any) {
    console.error("Menu API Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 },
    );
  }
}
