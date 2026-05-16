// src/lib/models/Category.ts
import mongoose, { Schema, Document } from 'mongoose'

export interface ICategory extends Document {
  name: string
  slug: string
  title: string
  image?: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

const CategorySchema = new Schema<ICategory>(
  {
    name: {
      type: String,
      required: [true, 'نام دسته‌بندی الزامی است'],
      trim: true,
    },
    slug: {
      type: String,
      required: [true, 'اسلاگ الزامی است'],
      unique: true,
      trim: true,
    },
    title: {
      type: String,
      required: [true, 'عنوان الزامی است'],
      trim: true,
    },
    image: {
      type: String,
      default: '',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
)

export default mongoose.models.Category || mongoose.model<ICategory>('Category', CategorySchema)
