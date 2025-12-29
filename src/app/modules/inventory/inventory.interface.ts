import mongoose, { Document, Types } from "mongoose";
import { StockMovementType } from "../../utils/enum/stockMovement";

/**
 * Inventory interface
 */
export interface IInventory extends Document {
  _id: Types.ObjectId;
  productId: Types.ObjectId;
  companyId: Types.ObjectId;
  variationSku?: string;
  currentStock: number;
  minStockLevel: number;
  maxStockLevel?: number;
  location?: string;
  lastRestockDate?: Date;
  lastStockOutDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Stock Movement interface
 */
export interface IStockMovement extends Document {
  _id: Types.ObjectId;
  productId: Types.ObjectId;
  companyId: Types.ObjectId;
  variationSku?: string;
  type: StockMovementType;
  stock: number;
  previousStock: number;
  newStock: number;
  reason?: string;
  referenceId?: Types.ObjectId;
  performedBy: Types.ObjectId;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}
