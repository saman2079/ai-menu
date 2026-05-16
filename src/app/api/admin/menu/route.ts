// src/app/api/admin/menu/route.ts
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongodb';
import { MenuItem } from '@/lib/models/MenuItem';

export async function GET() {
  try {
    await dbConnect();

    const items = await MenuItem.find({})
      .populate("category")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ items });
  } catch (error: any) {
    console.error('GET /api/admin/menu error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const body = await req.json();

    console.log('POST body:', body);

    const item = await MenuItem.create({
      name: body.name,
      title: body.name, 
      description: body.description,
      ingredients: body.ingredients || [],
      preparationTime: body.preparationTime,
      price: body.price,
      images: body.images || [],
      category: body.category,          // ← مهم: باید ObjectId باشد، نه string خالی
      isAvailable:
        body.isAvailable !== undefined ? body.isAvailable : true,
    });

    console.log('Created item:', item);
    return NextResponse.json({ item }, { status: 201 });
  } catch (error: any) {
    console.error('POST /api/admin/menu error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
