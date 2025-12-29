import mongoose, { Model, Schema } from "mongoose";
import { ICategory, IBrand, IProduct } from "./product.interface";

/**
 * Category Schema
 */
const CategorySchema: Schema<ICategory> = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Category name is required"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    companyId: {
      type: Schema.Types.ObjectId,
      ref: "Company",
      required: [true, "Company ID is required"],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

// Indexes
CategorySchema.index({ companyId: 1, name: 1 }, { unique: true });

/**
 * Brand Schema
 */
const BrandSchema: Schema<IBrand> = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Brand name is required"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    logo: {
      type: String,
    },
    categories: [
      {
        type: Schema.Types.ObjectId,
        ref: "Category",
      },
    ],
    companyId: {
      type: Schema.Types.ObjectId,
      ref: "Company",
      required: [true, "Company ID is required"],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

// Indexes
BrandSchema.index({ companyId: 1, name: 1 }, { unique: true });

/**
 * Product Schema
 */
const ProductSchema: Schema<IProduct> = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
    },
    sku: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Category is required"],
    },
    brandId: {
      type: Schema.Types.ObjectId,
      ref: "Brand",
    },
    quality: {
      type: String,
      trim: true,
    },
    companyId: {
      type: Schema.Types.ObjectId,
      ref: "Company",
      required: [true, "Company ID is required"],
    },
    images: [
      {
        url: { type: String, required: true },
        publicId: String,
      },
    ],
    variations: [
      {
        name: { type: String, required: true },
        value: { type: String, required: true },
        sku: String,
        price: Number,
        stock: Number,
      },
    ],
    basePrice: {
      type: Number,
      required: [true, "Base price is required"],
      min: [0, "Price cannot be negative"],
    },
    costPrice: {
      type: Number,
      min: [0, "Cost price cannot be negative"],
    },
    taxRate: {
      type: Number,
      default: 0,
      min: [0, "Tax rate cannot be negative"],
      max: [100, "Tax rate cannot exceed 100%"],
    },
    unit: {
      type: String,
      default: "pcs",
    },
    stock: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Creator is required"],
    },
  },
  {
    timestamps: true,
  },
);

// Indexes
ProductSchema.index({ companyId: 1, sku: 1 }, { unique: true });
ProductSchema.index({ companyId: 1, categoryId: 1 });
ProductSchema.index({ companyId: 1, name: "text" });

// Model Exports
export const Category: Model<ICategory> = mongoose.model<ICategory>(
  "Category",
  CategorySchema,
);
export const Brand: Model<IBrand> = mongoose.model<IBrand>(
  "Brand",
  BrandSchema,
);
export const Product: Model<IProduct> = mongoose.model<IProduct>(
  "Product",
  ProductSchema,
);
