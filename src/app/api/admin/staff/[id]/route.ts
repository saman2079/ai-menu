// src/app/api/admin/staff/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import Admin from "@/lib/models/Admin";
import { checkPermission } from "@/lib/auth";
import connectDB from "@/lib/db";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";

export async function GET(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
  ) {
    try {
      const { id } = await context.params; // مهم
  
      const { admin, error } = await checkPermission(req, "canManageStaff");
      if (error) return error;
  
      await connectDB();
  
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return NextResponse.json(
          { error: "شناسه کارمند نامعتبر است" },
          { status: 400 }
        );
      }
  
      const staff = await Admin.findOne({
        _id: id,
        restaurant: admin.restaurant._id,
        role: { $ne: "owner" },
      }).select("-password");
  
      if (!staff) {
        return NextResponse.json(
          { error: "کارمند یافت نشد" },
          { status: 404 }
        );
      }
  
      return NextResponse.json({ staff }, { status: 200 });
    } catch (error: any) {
      console.error("خطا در دریافت کارمند:", error);
      return NextResponse.json(
        { error: "خطا در دریافت کارمند" },
        { status: 500 }
      );
    }
  }
  

export async function PUT(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
  ) {
    try {
      const { id } = await context.params; // مهم
  
      const { admin, error } = await checkPermission(req, "canManageStaff");
      if (error) return error;
  
      await connectDB();
  
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return NextResponse.json(
          { error: "شناسه کارمند نامعتبر است" },
          { status: 400 }
        );
      }
  
      const body = await req.json();
      const { name, role, permissions, isActive, password } = body;
  
      const staff = await Admin.findOne({
        _id: id,
        restaurant: admin.restaurant._id,
        role: { $ne: "owner" },
      });
  
      if (!staff) {
        return NextResponse.json(
          { error: "کارمند یافت نشد" },
          { status: 404 }
        );
      }
  
      // آپدیت
      if (name) staff.name = name;
      if (role && role !== "owner") staff.role = role;
      if (permissions) staff.permissions = { ...staff.permissions, ...permissions };
      if (typeof isActive === "boolean") staff.isActive = isActive;
  
      if (password && password.length >= 6) {
        const hashedPassword = await bcrypt.hash(password, 10);
        staff.password = hashedPassword;
      }
  
      await staff.save();
  
      const staffResponse = staff.toObject();
      delete staffResponse.password;
  
      return NextResponse.json(
        {
          message: "کارمند با موفقیت به‌روزرسانی شد",
          staff: staffResponse,
        },
        { status: 200 }
      );
    } catch (error: any) {
      console.error("خطا در به‌روزرسانی کارمند:", error);
      return NextResponse.json(
        { error: error.message || "خطای سرور" },
        { status: 500 }
      );
    }
  }
  

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }  // params یک Promise است
) {
  try {
    const params = await context.params; // unwrap کردن Promise
    const id = params.id;
    const { admin, error } = await checkPermission(req, "canManageStaff");
    if (error) return error;

    await connectDB();

    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json(
        { error: "شناسه کارمند نامعتبر است" },
        { status: 400 }
      );
    }

    const result = await Admin.findOneAndDelete({
      _id: params.id,
      restaurant: admin.restaurant._id,
      role: { $ne: "owner" },
    });

    if (!result) {
      return NextResponse.json(
        { error: "کارمند یافت نشد" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "کارمند با موفقیت حذف شد" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("خطا در حذف کارمند:", error);
    return NextResponse.json(
      { error: error.message || "خطای سرور" },
      { status: 500 }
    );
  }
}
