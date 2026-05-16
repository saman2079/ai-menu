// src/types/category.ts
export interface Category {
  _id: string;
  name: string;
  title: string;
  slug: string;
  image?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}
