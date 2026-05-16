// src/app/api/admin/profile/route.ts
import { NextRequest, NextResponse } from 'next/server';

import { verifyAdmin } from '@/lib/auth';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'توکن یافت نشد' }, { status: 401 });
    }

    const admin = await verifyAdmin(token);
    
    return NextResponse.json({
      _id: admin._id,
      email: admin.email,
      name: admin.name,
      restaurant: admin.restaurant,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'توکن یافت نشد' }, { status: 401 });
    }

    const admin = await verifyAdmin(token);
    await connectDB();

    const body = await request.json();
    const { name, email, password, currentPassword } = body;

    // اگر می‌خواد رمز عوض کنه، باید رمز فعلی رو بده
    if (password) {
      if (!currentPassword) {
        return NextResponse.json({ error: 'رمز عبور فعلی الزامی است' }, { status: 400 });
      }
      
      const isPasswordValid = await bcrypt.compare(currentPassword, admin.password);
      if (!isPasswordValid) {
        return NextResponse.json({ error: 'رمز عبور فعلی اشتباه است' }, { status: 400 });
      }
      
      admin.password = await bcrypt.hash(password, 10);
    }

    if (name) admin.name = name;
    if (email) admin.email = email;

    await admin.save();

    return NextResponse.json({
      _id: admin._id,
      email: admin.email,
      name: admin.name,
      restaurant: admin.restaurant,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
