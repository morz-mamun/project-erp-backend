import { Document, Types } from "mongoose";

/**
 * Category interface
 */
export interface ICategory extends Document {
  _id: Types.ObjectId;
  name: string;
  description?: string;
  companyId: Types.ObjectId;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Brand interface
 */
export interface IBrand extends Document {
  _id: Types.ObjectId;
  name: string;
  description?: string;
  logo?: string;
  categories: Types.ObjectId[];
  companyId: Types.ObjectId;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Product variation interface
 */
export interface IProductVariation {
  name: string; // e.g., "Size", "Color", "RAM"
  value: string; // e.g., "Large", "Red", "16GB"
  sku?: string;
  price?: number;
  stock?: number;
}

/**
 * Product image interface
 */
export interface IProductImage {
  url: string;
  publicId?: string;
}

/**
 * Product interface
 */
export interface IProduct extends Document {
  _id: Types.ObjectId;
  name: string;
  sku: string;
  description?: string;
  categoryId: Types.ObjectId;
  brandId?: Types.ObjectId;
  quality?: string; // Product quality/grade (e.g., "OPC 53 Grade", "Grade A")
  companyId: Types.ObjectId;
  images: IProductImage[];
  variations: IProductVariation[];
  basePrice: number;
  costPrice?: number;
  taxRate: number;
  unit: string;
  stock: number;
  isActive: boolean;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}
