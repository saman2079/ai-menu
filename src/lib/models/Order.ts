// src/lib/models/Order.ts
import mongoose, { Schema, Document } from "mongoose";

export interface IOrder extends Document {
  restaurant: mongoose.Types.ObjectId;
  orderNumber: number;
  customerName?: string;
  customerPhone?: string;
  tableId?: string;        // ⭐ جدید
  sessionId?: string;      // ⭐ جدید
  isFinalized: boolean;    // ⭐ جدید
  items: Array<{
    menuItem: mongoose.Types.ObjectId;
    name: string;
    quantity: number;
    price: number;
    selectedOptions?: Record<string, any>;
  }>;
  totalAmount: number;
  status: "pending" | "preparing" | "ready" | "delivered" | "cancelled";
  createdAt: Date;
  updatedAt: Date;
}

const OrderSchema = new Schema<IOrder>(
  {
    restaurant: { type: Schema.Types.ObjectId, ref: "Restaurant", required: true },
    orderNumber: { type: Number, required: true },
    customerName: { type: String },
    customerPhone: { type: String },
    tableId: { type: String },           // ⭐ جدید
    sessionId: { type: String },         // ⭐ جدید
    isFinalized: { type: Boolean, default: false }, // ⭐ جدید
    items: [
      {
        menuItem: { type: Schema.Types.ObjectId, ref: "MenuItem", required: true },
        name: { type: String, required: true },
        quantity: { type: Number, required: true, min: 1 },
        price: { type: Number, required: true },
        selectedOptions: { type: Map, of: Schema.Types.Mixed },
      },
    ],
    totalAmount: { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending", "preparing", "ready", "delivered", "cancelled"],
      default: "pending",
    },
  },
  { timestamps: true }
);

export const Order = mongoose.models.Order || mongoose.model<IOrder>("Order", OrderSchema);
