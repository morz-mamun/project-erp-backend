import mongoose from "mongoose";
import { IInventory, IStockMovement } from "./inventory.interface";
import { Inventory, StockMovement } from "./inventory.model";
import { Product } from "../product/product.model";
import { StockMovementType } from "../../utils/enum/stockMovement";
import AppError from "../../errors/functions/AppError";
import { httpStatusCode } from "../../utils/enum/statusCode";

/**
 * Get inventory for company
 */
const getInventory = async (
  companyId: string,
  query: {
    lowStock?: boolean;
    productId?: string;
    page?: number;
    limit?: number;
  } = {},
): Promise<{ inventory: IInventory[]; metadata: any }> => {
  const { lowStock, productId, page = 1, limit = 20 } = query;

  const filter: any = { companyId };
  if (productId) filter.productId = productId;
  if (lowStock === true) {
    filter.$expr = { $lt: ["$currentStock", "$minStockLevel"] };
  }

  const skip = (page - 1) * limit;

  const inventory = await Inventory.find(filter)
    .populate("productId", "name sku basePrice")
    .skip(skip)
    .limit(limit)
    .sort({ currentStock: 1 });

  const total = await Inventory.countDocuments(filter);

  return {
    inventory,
    metadata: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    },
  };
};

/**
 * Stock in (purchase/restock)
 */
const stockIn = async (
  companyId: string,
  userId: string,
  payload: {
    productId: string;
    variationSku?: string;
    quantity: number;
    reason?: string;
    notes?: string;
  },
): Promise<IInventory> => {
  const { productId, variationSku, quantity, reason, notes } = payload;

  // Find inventory
  const inventory = await Inventory.findOne({
    companyId,
    productId,
    variationSku,
  });
  if (!inventory) {
    throw new AppError(httpStatusCode.NOT_FOUND, "Inventory not found");
  }

  const previousStock = inventory.currentStock;
  const newStock = previousStock + quantity;

  // Update inventory
  inventory.currentStock = newStock;
  inventory.lastRestockDate = new Date();
  await inventory.save();

  // Create stock movement record
  await StockMovement.create({
    productId,
    companyId,
    variationSku,
    type: StockMovementType.IN,
    quantity,
    previousStock,
    newStock,
    reason: reason || "Purchase",
    performedBy: userId,
    notes,
  });

  return inventory;
};

/**
 * Stock out (sale)
 */
const stockOut = async (
  companyId: string,
  userId: string,
  payload: {
    productId: string;
    variationSku?: string;
    quantity: number;
    referenceId?: string;
    notes?: string;
  },
): Promise<IInventory> => {
  const { productId, variationSku, quantity, referenceId, notes } = payload;

  // Find inventory
  const inventory = await Inventory.findOne({
    companyId,
    productId,
    variationSku,
  });
  if (!inventory) {
    throw new AppError(httpStatusCode.NOT_FOUND, "Inventory not found");
  }

  // Check stock availability
  if (inventory.currentStock < quantity) {
    throw new AppError(httpStatusCode.BAD_REQUEST, "Insufficient stock");
  }

  const previousStock = inventory.currentStock;
  const newStock = previousStock - quantity;

  // Update inventory
  inventory.currentStock = newStock;
  inventory.lastStockOutDate = new Date();
  await inventory.save();

  // Create stock movement record
  await StockMovement.create({
    productId,
    companyId,
    variationSku,
    type: StockMovementType.OUT,
    quantity,
    previousStock,
    newStock,
    reason: "Sale",
    referenceId,
    performedBy: userId,
    notes,
  });

  return inventory;
};

/**
 * Adjust stock (manual adjustment)
 */
const adjustStock = async (
  companyId: string,
  userId: string,
  payload: {
    productId: string;
    variationSku?: string;
    quantity: number;
    reason: string;
    notes?: string;
  },
): Promise<IInventory> => {
  const { productId, variationSku, quantity, reason, notes } = payload;

  // Find inventory
  const inventory = await Inventory.findOne({
    companyId,
    productId,
    variationSku,
  });
  if (!inventory) {
    throw new AppError(httpStatusCode.NOT_FOUND, "Inventory not found");
  }

  const previousStock = inventory.currentStock;
  const newStock = previousStock + quantity; // Can be negative for reduction

  if (newStock < 0) {
    throw new AppError(httpStatusCode.BAD_REQUEST, "Stock cannot be negative");
  }

  // Update inventory
  inventory.currentStock = newStock;
  await inventory.save();

  // Create stock movement record
  await StockMovement.create({
    productId,
    companyId,
    variationSku,
    type: StockMovementType.ADJUSTMENT,
    quantity,
    previousStock,
    newStock,
    reason,
    performedBy: userId,
    notes,
  });

  return inventory;
};

/**
 * Get stock movements
 */
const getStockMovements = async (
  companyId: string,
  query: {
    productId?: string;
    type?: StockMovementType;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  } = {},
): Promise<{ movements: IStockMovement[]; metadata: any }> => {
  const { productId, type, startDate, endDate, page = 1, limit = 20 } = query;

  const filter: any = { companyId };
  if (productId) filter.productId = productId;
  if (type) filter.type = type;
  if (startDate || endDate) {
    filter.createdAt = {};
    if (startDate) filter.createdAt.$gte = new Date(startDate);
    if (endDate) filter.createdAt.$lte = new Date(endDate);
  }

  const skip = (page - 1) * limit;

  const movements = await StockMovement.find(filter)
    .populate("productId", "name sku")
    .populate("performedBy", "name email")
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });

  const total = await StockMovement.countDocuments(filter);

  return {
    movements,
    metadata: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    },
  };
};

export const InventoryService = {
  getInventory,
  stockIn,
  stockOut,
  adjustStock,
  getStockMovements,
};
