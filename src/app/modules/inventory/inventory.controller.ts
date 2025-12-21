import { NextFunction, Request, Response } from "express";
import { InventoryService } from "./inventory.service";
import sendResponse from "../../utils/sendResponse";
import { httpStatusCode } from "../../utils/enum/statusCode";
import { asyncHandler } from "../../utils/asyncHandler";

/**
 * Get inventory
 */
const getInventory = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { companyId } = req.user!;
  const result = await InventoryService.getInventory(
    companyId!.toString(),
    req.query as any,
  );

  sendResponse(res, {
    statusCode: httpStatusCode.OK,
    success: true,
    message: "Inventory retrieved successfully",
    data: result,
  });
  next();
};

/**
 * Stock in (purchase/restock)
 */
const stockIn = async (req: Request, res: Response, next: NextFunction) => {
  const { companyId, userId } = req.user!;
  const result = await InventoryService.stockIn(
    companyId!.toString(),
    userId.toString(),
    req.body,
  );

  sendResponse(res, {
    statusCode: httpStatusCode.OK,
    success: true,
    message: "Stock added successfully",
    data: result,
  });
  next();
};

/**
 * Adjust stock
 */
const adjustStock = async (req: Request, res: Response, next: NextFunction) => {
  const { companyId, userId } = req.user!;
  const result = await InventoryService.adjustStock(
    companyId!.toString(),
    userId.toString(),
    req.body,
  );

  sendResponse(res, {
    statusCode: httpStatusCode.OK,
    success: true,
    message: "Stock adjusted successfully",
    data: result,
  });
  next();
};

/**
 * Get stock movements
 */
const getStockMovements = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { companyId } = req.user!;
  const result = await InventoryService.getStockMovements(
    companyId!.toString(),
    req.query as any,
  );

  sendResponse(res, {
    statusCode: httpStatusCode.OK,
    success: true,
    message: "Stock movements retrieved successfully",
    data: result,
  });
  next();
};

export const InventoryController = {
  getInventory: asyncHandler(getInventory),
  stockIn: asyncHandler(stockIn),
  adjustStock: asyncHandler(adjustStock),
  getStockMovements: asyncHandler(getStockMovements),
};
