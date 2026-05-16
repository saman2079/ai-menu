// src/app/api/admin/pages/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { Page } from "@/lib/models/page";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  await connectDB();
  const page = await Page.findById(params.id);
  return NextResponse.json({ page });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  await connectDB();
  const body = await req.json();
  const page = await Page.findByIdAndUpdate(params.id, body, { new: true });
  return NextResponse.json({ page });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  await connectDB();
  await Page.findByIdAndDelete(params.id);
  return NextResponse.json({ success: true });
}
