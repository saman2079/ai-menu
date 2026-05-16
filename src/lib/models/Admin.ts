import mongoose, { Schema, Document } from "mongoose";

export interface IAdmin extends Document {
  email: string;
  password: string;
  name: string;
  role: "owner" | "manager" | "staff" | "admin";
  restaurant: mongoose.Types.ObjectId;
  permissions: {
    canManageMenu: boolean;
    canManageCategories: boolean;
    canManageOrders: boolean;
    canManageStaff: boolean;
    canViewReports: boolean;
    canManageSettings: boolean;
    canManageQRCodes: boolean;
  };
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const AdminSchema = new Schema<IAdmin>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    role: {
      type: String,
      enum: ["owner", "manager", "staff", "admin"],
      default: "staff",
    },
    restaurant: {
      type: Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
    },
    permissions: {
      canManageMenu: { type: Boolean, default: false },
      canManageCategories: { type: Boolean, default: false },
      canManageOrders: { type: Boolean, default: false },
      canManageStaff: { type: Boolean, default: false },
      canViewReports: { type: Boolean, default: false },
      canManageSettings: { type: Boolean, default: false },
      canManageQRCodes: { type: Boolean, default: false },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

AdminSchema.index({ email: 1 });
AdminSchema.index({ restaurant: 1 });

const Admin = mongoose.models.Admin || mongoose.model<IAdmin>("Admin", AdminSchema);

export default Admin;
