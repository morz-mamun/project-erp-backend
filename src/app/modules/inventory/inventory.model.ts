import mongoose, { Model, Schema } from "mongoose";
import { IInventory, IStockMovement } from "./inventory.interface";
import { StockMovementType } from "../../utils/enum/stockMovement";

/**
 * Inventory Schema
 * Tracks current stock levels for products
 */
const InventorySchema: Schema<IInventory> = new mongoose.Schema(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: [true, "Product ID is required"],
    },
    companyId: {
      type: Schema.Types.ObjectId,
      ref: "Company",
      required: [true, "Company ID is required"],
    },
    variationSku: {
      type: String,
      trim: true,
    },
    currentStock: {
      type: Number,
      required: [true, "Current stock is required"],
      default: 0,
      min: [0, "Stock cannot be negative"],
    },
    minStockLevel: {
      type: Number,
      default: 10,
      min: [0, "Min stock level cannot be negative"],
    },
    maxStockLevel: {
      type: Number,
      min: [0, "Max stock level cannot be negative"],
    },
    location: {
      type: String,
      trim: true,
    },
    lastRestockDate: {
      type: Date,
    },
    lastStockOutDate: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
);

// Indexes
InventorySchema.index(
  { companyId: 1, productId: 1, variationSku: 1 },
  { unique: true },
);
InventorySchema.index({ companyId: 1, currentStock: 1 }); // For low stock queries

/**
 * Stock Movement Schema
 * Audit trail for all stock changes
 */
const StockMovementSchema: Schema<IStockMovement> = new mongoose.Schema(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: [true, "Product ID is required"],
    },
    companyId: {
      type: Schema.Types.ObjectId,
      ref: "Company",
      required: [true, "Company ID is required"],
    },
    variationSku: {
      type: String,
      trim: true,
    },
    type: {
      type: String,
      enum: Object.values(StockMovementType),
      required: [true, "Movement type is required"],
    },
    quantity: {
      type: Number,
      required: [true, "Quantity is required"],
    },
    previousStock: {
      type: Number,
      required: [true, "Previous stock is required"],
    },
    newStock: {
      type: Number,
      required: [true, "New stock is required"],
    },
    reason: {
      type: String,
      trim: true,
    },
    referenceId: {
      type: Schema.Types.ObjectId,
    },
    performedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Performed by is required"],
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

// Indexes
StockMovementSchema.index({ companyId: 1, productId: 1, createdAt: -1 });
StockMovementSchema.index({ companyId: 1, type: 1, createdAt: -1 });

// Model Exports
export const Inventory: Model<IInventory> = mongoose.model<IInventory>(
  "Inventory",
  InventorySchema,
);
export const StockMovement: Model<IStockMovement> =
  mongoose.model<IStockMovement>("StockMovement", StockMovementSchema);
