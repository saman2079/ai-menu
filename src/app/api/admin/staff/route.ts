// src/app/api/admin/staff/route.ts
import { NextRequest, NextResponse } from "next/server";
import Admin from "@/lib/models/Admin";
import { checkPermission } from "@/lib/auth";
import connectDB from "@/lib/db";
import bcrypt from "bcryptjs";

export async function GET(req: NextRequest) {
  try {
    const { admin, error } = await checkPermission(req, "canManageStaff");
    if (error) return error;

    await connectDB();

    // دریافت کارمندان همون رستوران (به جز owner)
    const staff = await Admin.find({
      restaurant: admin.restaurant._id,
      role: { $ne: "owner" },
    })
      .select("-password")
      .sort({ createdAt: -1 });

    return NextResponse.json({ staff }, { status: 200 });
  } catch (error: any) {
    console.error("خطا در دریافت کارمندان:", error);
    return NextResponse.json(
      { error: "خطا در دریافت کارمندان" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { admin, error } = await checkPermission(request, "canManageStaff");
    if (error) return error;

    await connectDB();

    const { email, password, name, role, permissions } = await request.json();

    // اعتبارسنجی
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: "ایمیل، رمز عبور و نام الزامی است" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "رمز عبور باید حداقل ۶ کاراکتر باشد" },
        { status: 400 }
      );
    }

    // بررسی تکراری نبودن ایمیل
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return NextResponse.json(
        { error: "این ایمیل قبلاً ثبت شده است" },
        { status: 400 }
      );
    }

    // هش کردن رمز عبور
    const hashedPassword = await bcrypt.hash(password, 10);

    // کارمند جدید
    const newStaff = await Admin.create({
      email,
      password: hashedPassword,
      name,
      role: role || "staff",
      restaurant: admin.restaurant._id,
      permissions: permissions || {
        canManageMenu: false,
        canManageCategories: false,
        canManageOrders: false,
        canManageStaff: false,
        canViewReports: false,
        canManageSettings: false,
        canManageQRCodes: false,
      },
      isActive: true,
    });

    const staffResponse = newStaff.toObject();
    delete staffResponse.password;

    return NextResponse.json(
      {
        message: "کارمند با موفقیت اضافه شد",
        staff: staffResponse,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("خطا در ایجاد کارمند:", error);
    return NextResponse.json(
      { error: error.message || "خطای سرور" },
      { status: 500 }
    );
  }
}
