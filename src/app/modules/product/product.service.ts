import { IProduct, ICategory, IBrand } from "./product.interface";
import { Product, Category, Brand } from "./product.model";
import { Inventory } from "../inventory/inventory.model";
import AppError from "../../errors/functions/AppError";
import { httpStatusCode } from "../../utils/enum/statusCode";

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
 * Get all categories for company
 */
const getAllCategories = async (companyId: string): Promise<ICategory[]> => {
  const categories = await Category.find({ companyId, isActive: true }).sort({
    name: 1,
  });
  return categories;
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
 * Delete category
 */
const deleteCategory = async (id: string): Promise<void> => {
  const category = await Category.findByIdAndUpdate(
    id,
    { isActive: false },
    { new: true },
  );
  if (!category) {
    throw new AppError(httpStatusCode.NOT_FOUND, "Category not found");
  }
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
 * Get all brands for company
 */
const getAllBrands = async (companyId: string): Promise<IBrand[]> => {
  const brands = await Brand.find({ companyId, isActive: true }).sort({
    name: 1,
  });
  return brands;
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
 * Delete brand
 */
const deleteBrand = async (id: string): Promise<void> => {
  const brand = await Brand.findByIdAndUpdate(
    id,
    { isActive: false },
    { new: true },
  );
  if (!brand) {
    throw new AppError(httpStatusCode.NOT_FOUND, "Brand not found");
  }
};

/**
 * Create new product
 */
const createProduct = async (
  companyId: string,
  userId: string,
  payload: Partial<IProduct>,
): Promise<IProduct> => {
  // Check if SKU already exists in company
  const existing = await Product.findOne({ companyId, sku: payload.sku });
  if (existing) {
    throw new AppError(httpStatusCode.BAD_REQUEST, "SKU already exists");
  }

  const product = await Product.create({
    ...payload,
    companyId,
    createdBy: userId,
  });

  // Create inventory entry for product
  await Inventory.create({
    productId: product._id,
    companyId,
    currentStock: 0,
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

  const filter: any = { companyId, isActive: true };
  if (categoryId) filter.categoryId = categoryId;
  if (brandId) filter.brandId = brandId;
  if (search) filter.name = { $regex: search, $options: "i" };

  const skip = (page - 1) * limit;

  const products = await Product.find(filter)
    .populate("categoryId", "name")
    .populate("brandId", "name")
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });

  const total = await Product.countDocuments(filter);

  return {
    products,
    metadata: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
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
  // Brand
  createBrand,
  getAllBrands,
  updateBrand,
  deleteBrand,
  // Product
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
};
