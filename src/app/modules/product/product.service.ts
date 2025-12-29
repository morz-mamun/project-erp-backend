import mongoose from "mongoose";
import { IProduct, ICategory, IBrand } from "./product.interface";
import { Product, Category, Brand } from "./product.model";
import { Inventory } from "../inventory/inventory.model";
import AppError from "../../errors/functions/AppError";
import { httpStatusCode } from "../../utils/enum/statusCode";

/**
 * Generate SKU based on category
 */
const generateSKU = async (
  categoryId: string,
  companyId: string,
): Promise<string> => {
  // Get category to extract name
  const category = await Category.findById(categoryId);
  if (!category) {
    throw new AppError(httpStatusCode.NOT_FOUND, "Category not found");
  }

  // Create category prefix (first 3-4 letters, uppercase)
  const categoryPrefix = category.name
    .replace(/[^a-zA-Z]/g, "") // Remove non-alphabetic characters
    .substring(0, 4)
    .toUpperCase();

  // Find the last product with this category prefix
  const lastProduct = await Product.findOne({
    companyId,
    sku: { $regex: `^${categoryPrefix}-` },
  }).sort({ createdAt: -1 });

  let counter = 1;
  if (lastProduct && lastProduct.sku) {
    // Extract counter from last SKU (e.g., "CEME-00005" -> 5)
    const match = lastProduct.sku.match(/-([0-9]+)$/);
    if (match) {
      counter = parseInt(match[1], 10) + 1;
    }
  }

  // Format: CATEGORY-00001
  const sku = `${categoryPrefix}-${counter.toString().padStart(5, "0")}`;
  return sku;
};

/**
 * Create new category
 */
const createCategory = async (
  companyId: string,
  payload: Partial<ICategory>,
): Promise<ICategory> => {
  // Check if category name already exists in company
  const existing = await Category.findOne({ companyId, name: payload.name });
  if (existing) {
    throw new AppError(
      httpStatusCode.BAD_REQUEST,
      "Category name already exists",
    );
  }

  const category = await Category.create({ ...payload, companyId });
  return category;
};

/**
 * Get all categories for company with pagination and search
 */
const getAllCategories = async (
  companyId: string,
  query: {
    search?: string;
    isActive?: boolean;
    page?: number;
    limit?: number;
  } = {},
): Promise<{ categories: any[]; metadata: any }> => {
  const { search, isActive, page = 1, limit = 50 } = query;

  const filter: any = { companyId: new mongoose.Types.ObjectId(companyId) };
  if (isActive !== undefined) filter.isActive = String(isActive) === "true";
  if (search) filter.name = { $regex: search, $options: "i" };

  const skip = (Number(page) - 1) * Number(limit);

  // Get categories with product count
  const categories = await Category.aggregate([
    { $match: filter },
    {
      $lookup: {
        from: "products",
        let: { categoryId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$categoryId", "$$categoryId"] },
                  { $eq: ["$isActive", true] },
                ],
              },
            },
          },
          { $count: "count" },
        ],
        as: "productCount",
      },
    },
    {
      $addFields: {
        productCount: {
          $ifNull: [{ $arrayElemAt: ["$productCount.count", 0] }, 0],
        },
      },
    },
    { $sort: { name: 1 } },
    { $skip: skip },
    { $limit: Number(limit) },
  ]);

  const total = await Category.countDocuments(filter);

  return {
    categories,
    metadata: {
      total,
      page: Number(page),
      limit: Number(limit),
      pages: Math.ceil(total / Number(limit)),
    },
  };
};

/**
 * Update category
 */
const updateCategory = async (
  id: string,
  payload: Partial<ICategory>,
): Promise<ICategory> => {
  const category = await Category.findByIdAndUpdate(id, payload, { new: true });
  if (!category) {
    throw new AppError(httpStatusCode.NOT_FOUND, "Category not found");
  }
  return category;
};

/**
 * Toggle category status (soft delete/restore)
 */
const toggleCategoryStatus = async (
  id: string,
  isActive: boolean,
): Promise<ICategory> => {
  // Check if category has active products when trying to deactivate
  if (!isActive) {
    const productCount = await Product.countDocuments({
      categoryId: id,
      isActive: true,
    });
    if (productCount > 0) {
      throw new AppError(
        httpStatusCode.BAD_REQUEST,
        `Cannot deactivate category. It has ${productCount} active product(s).`,
      );
    }
  }

  const category = await Category.findByIdAndUpdate(
    id,
    { isActive },
    { new: true },
  );
  if (!category) {
    throw new AppError(httpStatusCode.NOT_FOUND, "Category not found");
  }
  return category;
};

/**
 * Delete category (legacy - now uses soft delete)
 */
const deleteCategory = async (id: string): Promise<void> => {
  await toggleCategoryStatus(id, false);
};

/**
 * Create new brand
 */
const createBrand = async (
  companyId: string,
  payload: Partial<IBrand>,
): Promise<IBrand> => {
  const existing = await Brand.findOne({ companyId, name: payload.name });
  if (existing) {
    throw new AppError(httpStatusCode.BAD_REQUEST, "Brand name already exists");
  }

  const brand = await Brand.create({ ...payload, companyId });
  return brand;
};

/**
 * Get all brands for company with pagination and search
 */
const getAllBrands = async (
  companyId: string,
  query: {
    search?: string;
    isActive?: boolean;
    page?: number;
    limit?: number;
    categoryId?: string;
  } = {},
): Promise<{ brands: any[]; metadata: any }> => {
  const { search, isActive, page = 1, limit = 50, categoryId } = query;

  const filter: any = { companyId: new mongoose.Types.ObjectId(companyId) };
  if (isActive !== undefined) filter.isActive = String(isActive) === "true";
  if (categoryId) filter.categories = new mongoose.Types.ObjectId(categoryId);
  if (search) filter.name = { $regex: search, $options: "i" };

  const skip = (Number(page) - 1) * Number(limit);

  // Get brands with product count
  const brands = await Brand.aggregate([
    { $match: filter },
    {
      $lookup: {
        from: "products",
        let: { brandId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$brandId", "$$brandId"] },
                  { $eq: ["$isActive", true] },
                ],
              },
            },
          },
          { $count: "count" },
        ],
        as: "productCount",
      },
    },
    {
      $addFields: {
        productCount: {
          $ifNull: [{ $arrayElemAt: ["$productCount.count", 0] }, 0],
        },
      },
    },
    { $sort: { name: 1 } },
    { $skip: skip },
    { $limit: Number(limit) },
  ]);

  const total = await Brand.countDocuments(filter);

  return {
    brands,
    metadata: {
      total,
      page: Number(page),
      limit: Number(limit),
      pages: Math.ceil(total / Number(limit)),
    },
  };
};

/**
 * Update brand
 */
const updateBrand = async (
  id: string,
  payload: Partial<IBrand>,
): Promise<IBrand> => {
  const brand = await Brand.findByIdAndUpdate(id, payload, { new: true });
  if (!brand) {
    throw new AppError(httpStatusCode.NOT_FOUND, "Brand not found");
  }
  return brand;
};

/**
 * Toggle brand status (soft delete/restore)
 */
const toggleBrandStatus = async (
  id: string,
  isActive: boolean,
): Promise<IBrand> => {
  // Check if brand has active products when trying to deactivate
  if (!isActive) {
    const productCount = await Product.countDocuments({
      brandId: id,
      isActive: true,
    });
    if (productCount > 0) {
      throw new AppError(
        httpStatusCode.BAD_REQUEST,
        `Cannot deactivate brand. It has ${productCount} active product(s).`,
      );
    }
  }

  const brand = await Brand.findByIdAndUpdate(id, { isActive }, { new: true });
  if (!brand) {
    throw new AppError(httpStatusCode.NOT_FOUND, "Brand not found");
  }
  return brand;
};

/**
 * Delete brand (legacy - now uses soft delete)
 */
const deleteBrand = async (id: string): Promise<void> => {
  await toggleBrandStatus(id, false);
};

/**
 * Create new product
 */
const createProduct = async (
  companyId: string,
  userId: string,
  payload: Partial<IProduct>,
): Promise<IProduct> => {
  // Auto-generate SKU if not provided
  let sku = payload.sku;
  if (!sku) {
    sku = await generateSKU(payload.categoryId!.toString(), companyId);
  } else {
    // Check if SKU already exists in company
    const existing = await Product.findOne({ companyId, sku });
    if (existing) {
      throw new AppError(httpStatusCode.BAD_REQUEST, "SKU already exists");
    }
  }

  console.log("Product Payload", payload);

  const product = await Product.create({
    ...payload,
    sku,
    companyId,
    createdBy: userId,
  });

  // Create inventory entry for product
  await Inventory.create({
    productId: product._id,
    companyId,
    currentStock: (payload as any).quantity || 0,
    minStockLevel: 10,
  });

  return product;
};

/**
 * Get all products for company
 */
const getAllProducts = async (
  companyId: string,
  query: {
    categoryId?: string;
    brandId?: string;
    search?: string;
    page?: number;
    limit?: number;
  } = {},
): Promise<{ products: IProduct[]; metadata: any }> => {
  const { categoryId, brandId, search, page = 1, limit = 20 } = query;

  const matchStage: any = {
    companyId: new mongoose.Types.ObjectId(companyId),
    isActive: true,
  };
  if (categoryId)
    matchStage.categoryId = new mongoose.Types.ObjectId(categoryId);
  if (brandId) matchStage.brandId = new mongoose.Types.ObjectId(brandId);
  if (search) matchStage.name = { $regex: search, $options: "i" };

  const skip = (Number(page) - 1) * Number(limit);

  const products = await Product.aggregate([
    { $match: matchStage },
    {
      $lookup: {
        from: "categories",
        localField: "categoryId",
        foreignField: "_id",
        as: "category",
      },
    },
    { $unwind: { path: "$category", preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: "brands",
        localField: "brandId",
        foreignField: "_id",
        as: "brand",
      },
    },
    { $unwind: { path: "$brand", preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: "inventories",
        localField: "_id",
        foreignField: "productId",
        as: "inventory",
      },
    },
    { $unwind: { path: "$inventory", preserveNullAndEmptyArrays: true } },
    {
      $project: {
        name: 1,
        sku: 1,
        basePrice: 1,
        unit: 1,
        images: 1,
        category: { name: 1 },
        brand: { name: 1 },
        stock: { $ifNull: ["$inventory.currentStock", 0] },
        createdAt: 1,
      },
    },
    { $sort: { createdAt: -1 } },
    { $skip: skip },
    { $limit: Number(limit) },
  ]);

  const total = await Product.countDocuments(matchStage);

  return {
    products,
    metadata: {
      total,
      page: Number(page),
      limit: Number(limit),
      pages: Math.ceil(total / Number(limit)),
    },
  };
};

/**
 * Get product by ID
 */
const getProductById = async (id: string): Promise<IProduct> => {
  const product = await Product.findById(id)
    .populate("categoryId", "name")
    .populate("brandId", "name")
    .populate("createdBy", "name email");

  if (!product) {
    throw new AppError(httpStatusCode.NOT_FOUND, "Product not found");
  }
  return product;
};

/**
 * Update product
 */
const updateProduct = async (
  id: string,
  payload: Partial<IProduct>,
): Promise<IProduct> => {
  console.log("Product Payload", payload);

  const product = await Product.findByIdAndUpdate(id, payload, { new: true })
    .populate("categoryId", "name")
    .populate("brandId", "name");

  if (!product) {
    throw new AppError(httpStatusCode.NOT_FOUND, "Product not found");
  }
  return product;
};

/**
 * Delete product
 */
const deleteProduct = async (id: string): Promise<void> => {
  const product = await Product.findByIdAndUpdate(
    id,
    { isActive: false },
    { new: true },
  );
  if (!product) {
    throw new AppError(httpStatusCode.NOT_FOUND, "Product not found");
  }
};

export const ProductService = {
  // Category
  createCategory,
  getAllCategories,
  updateCategory,
  deleteCategory,
  toggleCategoryStatus,
  // Brand
  createBrand,
  getAllBrands,
  updateBrand,
  deleteBrand,
  toggleBrandStatus,
  // Product
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
};
