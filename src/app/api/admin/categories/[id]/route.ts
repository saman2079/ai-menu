import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/db'
import Category from '@/lib/models/Category'
import { isValidObjectId } from 'mongoose'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    if (!isValidObjectId(id)) {
      return NextResponse.json(
        { message: 'شناسه نامعتبر است' },
        { status: 400 }
      )
    }

    await dbConnect()
    const category = await Category.findById(id)
    
    if (!category) {
      return NextResponse.json(
        { message: 'دسته‌بندی یافت نشد' },
        { status: 404 }
      )
    }

    return NextResponse.json(category, { status: 200 })
  } catch (error: any) {
    console.error('Category GET error:', error)
    return NextResponse.json(
      { message: 'خطا در دریافت دسته‌بندی', error: error.message },
      { status: 500 }
    )
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    if (!isValidObjectId(id)) {
      return NextResponse.json(
        { message: 'شناسه نامعتبر است' },
        { status: 400 }
      )
    }

    await dbConnect()
    const body = await req.json()
    
    const category = await Category.findByIdAndUpdate(
      id,
      body,
      { new: true, runValidators: true }
    )
    
    if (!category) {
      return NextResponse.json(
        { message: 'دسته‌بندی یافت نشد' },
        { status: 404 }
      )
    }

    return NextResponse.json(category, { status: 200 })
  } catch (error: any) {
    console.error('Category PATCH error:', error)
    return NextResponse.json(
      { message: 'خطا در بروزرسانی دسته‌بندی', error: error.message },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    if (!isValidObjectId(id)) {
      return NextResponse.json(
        { message: 'شناسه نامعتبر است' },
        { status: 400 }
      )
    }

    await dbConnect()
    const category = await Category.findByIdAndDelete(id)
    
    if (!category) {
      return NextResponse.json(
        { message: 'دسته‌بندی یافت نشد' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { message: 'دسته‌بندی با موفقیت حذف شد' },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Category DELETE error:', error)
    return NextResponse.json(
      { message: 'خطا در حذف دسته‌بندی', error: error.message },
      { status: 500 }
    )
  }
}
