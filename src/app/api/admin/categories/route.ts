import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/db'
import Category from '@/lib/models/Category'

function generateSlug(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[\u0600-\u06FF\s]+/g, '-') // Persian/Arabic characters to dash
    .replace(/[^\w\-]+/g, '') // Remove non-word chars except dash
    .replace(/\-\-+/g, '-') // Replace multiple dashes with single dash
    .replace(/^-+/, '') // Trim dashes from start
    .replace(/-+$/, '') // Trim dashes from end
    || 'category-' + Date.now() // Fallback if empty
}

export async function GET() {
  try {
    await dbConnect()
    const categories = await Category.find().sort({ createdAt: -1 })
    return NextResponse.json({ categories }, { status: 200 })
  } catch (error: any) {
    console.error('Category GET error:', error)
    return NextResponse.json(
      { message: 'خطا در دریافت دسته‌بندی‌ها', error: error.message },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    await dbConnect()
    const body = await req.json()
    
    if (!body.slug && body.name) {
      body.slug = generateSlug(body.name)
    } else if (body.slug) {
      body.slug = generateSlug(body.slug)
    } else {
      body.slug = 'category-' + Date.now()
    }

    const category = await Category.create(body)
    return NextResponse.json(category, { status: 201 })
  } catch (error: any) {
    console.error('Category POST error:', error)
    if (error.code === 11000) {
      return NextResponse.json(
        { message: 'این دسته‌بندی قبلاً ثبت شده' },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { message: 'خطا در ایجاد دسته‌بندی', error: error.message },
      { status: 500 }
    )
  }
}
