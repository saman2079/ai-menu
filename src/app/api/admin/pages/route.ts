// src/app/api/admin/pages/route.ts
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { Page } from "@/lib/models/page";

export async function GET() {
  await connectDB();
  const pages = await Page.find().sort({ createdAt: -1 });
  return NextResponse.json({ pages });
}

export async function POST(req: NextRequest) {
  await connectDB();
  const body = await req.json();
  const page = await Page.create(body);
  return NextResponse.json({ page });
}
