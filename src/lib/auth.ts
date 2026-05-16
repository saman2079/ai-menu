// src/lib/auth.ts
import jwt from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";
import connectDB from "./db";
import Admin from "./models/Admin";

const JWT_SECRET = process.env.JWT_SECRET!;

interface TokenPayload {
  adminId: string;
  role: string;
}

export function generateToken(adminId: string, role: string): string {
  return jwt.sign({ adminId, role }, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch {
    return null;
  }
}

export async function verifyAdmin(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    console.error("Authorization header missing or malformed");
    return null;
  }

  const token = authHeader.substring(7);
  const decoded = verifyToken(token);

  if (!decoded) {
    console.error("Invalid JWT token");
    return null;
  }

  if (!decoded.adminId) {
    console.error("adminId missing in token payload");
    return null;
  }

  await connectDB();

  let admin = null;
  try {
    admin = await Admin.findById(decoded.adminId).populate("restaurant");
  } catch (err) {
    console.error("Error fetching admin from DB:", err);
    return null;
  }

  if (!admin) {
    console.error("Admin not found with ID:", decoded.adminId);
    return null;
  }

  if (!admin.isActive) {
    console.error("Admin is not active");
    return null;
  }

  return admin;
}


// چک کردن دسترسی خاص
export async function checkPermission(
  req: NextRequest,
  permission: keyof IAdmin["permissions"]
): Promise<{ admin: any; error?: NextResponse }> {
  const admin = await verifyAdmin(req);

  if (!admin) {
    return {
      admin: null,
      error: NextResponse.json(
        { error: "احراز هویت نشده" },
        { status: 401 }
      ),
    };
  }

  // owner همه دسترسی‌ها رو داره
  if (admin.role === "admin") {
    return { admin };
  }

  // چک کردن permission مورد نظر
  if (!admin.permissions[permission]) {
    return {
      admin: null,
      error: NextResponse.json(
        { error: "شما دسترسی به این بخش ندارید" },
        { status: 403 }
      ),
    };
  }

  return { admin };
}
