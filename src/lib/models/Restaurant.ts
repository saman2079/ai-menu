import mongoose, { Schema, Document } from "mongoose";

export interface IRestaurant extends Document {
  name: string;
    slug: string; 
  address: string;
  phone: string;
  email: string;
  description?: string;
  logo?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const RestaurantSchema = new Schema<IRestaurant>(
  {
    name: { type: String, required: true },
        slug: { type: String, required: true, unique: true }, // ✅ اضافه شد

    address: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true },
    description: { type: String },
    logo: { type: String },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Restaurant =
  mongoose.models.Restaurant ||
  mongoose.model<IRestaurant>("Restaurant", RestaurantSchema);
