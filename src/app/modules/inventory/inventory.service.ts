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
  // Sync Inventory: Ensure all active products have an inventory record
  const products = await Product.find({ companyId, isActive: true }).select(
    "_id",
  );
  const existingInventory = await Inventory.find({ companyId }).select(
    "productId",
  );
  const existingProductIds = new Set(
    existingInventory.map((i) => i.productId.toString()),
  );

  const missingInventoryPayloads = products
    .filter((p) => !existingProductIds.has(p._id.toString()))
    .map((p) => ({
      productId: p._id,
      companyId,
      currentStock: 0,
      minStockLevel: 10,
    }));

  if (missingInventoryPayloads.length > 0) {
    await Inventory.insertMany(missingInventoryPayloads);
  }

  const { lowStock, productId, page = 1, limit = 20 } = query;

  const filter: any = { companyId };
  if (productId) filter.productId = productId;
  if (lowStock === true) {
    filter.$expr = { $lt: ["$currentStock", "$minStockLevel"] };
  }

  const skip = (Number(page) - 1) * Number(limit);

  const inventory = await Inventory.find(filter)
    .populate("productId", "name sku basePrice unit")
    .skip(skip)
    .limit(Number(limit))
    .sort({ currentStock: 1 });

  const total = await Inventory.countDocuments(filter);

  return {
    inventory,
    metadata: {
      total,
      page: Number(page),
      limit: Number(limit),
      pages: Math.ceil(total / Number(limit)),
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

  // Find or Create inventory
  let inventory = await Inventory.findOne({
    companyId,
    productId,
    variationSku,
  });

  if (!inventory) {
    const productExists = await Product.findById(productId);
    if (!productExists) {
      throw new AppError(httpStatusCode.NOT_FOUND, "Product not found");
    }

    inventory = await Inventory.create({
      companyId,
      productId,
      variationSku,
      currentStock: 0,
      minStockLevel: 10,
    });
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
    stock: quantity,
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
    stock: quantity,
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
    type?: "add" | "remove" | "set";
    reason: string;
    notes?: string;
  },
): Promise<IInventory> => {
  const {
    productId,
    variationSku,
    quantity,
    type = "add",
    reason,
    notes,
  } = payload;

  // Find or Create inventory
  let inventory = await Inventory.findOne({
    companyId,
    productId,
    variationSku,
  });

  if (!inventory) {
    const productExists = await Product.findById(productId);
    if (!productExists) {
      throw new AppError(httpStatusCode.NOT_FOUND, "Product not found");
    }

    inventory = await Inventory.create({
      companyId,
      productId,
      variationSku,
      currentStock: 0,
      minStockLevel: 10,
    });
  }

  const previousStock = inventory.currentStock;
  let newStock = previousStock;

  if (type === "add") {
    newStock = previousStock + quantity;
  } else if (type === "remove") {
    newStock = previousStock - quantity;
  } else if (type === "set") {
    newStock = quantity;
  }

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
    stock: Math.abs(newStock - previousStock),
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
