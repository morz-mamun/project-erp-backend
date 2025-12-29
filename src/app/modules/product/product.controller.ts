import { Request, Response } from "express";
import { ProductService } from "./product.service";
import sendResponse from "../../utils/sendResponse";
import { httpStatusCode } from "../../utils/enum/statusCode";
import { asyncHandler } from "../../utils/asyncHandler";

// ============ CATEGORY CONTROLLERS ============

const createCategory = async (req: Request, res: Response) => {
  const { companyId } = req.user!;
  const result = await ProductService.createCategory(
    companyId!.toString(),
    req.body,
  );

  sendResponse(res, {
    statusCode: httpStatusCode.CREATED,
    success: true,
    message: "Category created successfully",
    data: result,
  });
};

const getAllCategories = async (req: Request, res: Response) => {
  const { companyId } = req.user!;
  const result = await ProductService.getAllCategories(
    companyId!.toString(),
    req.query,
  );

  sendResponse(res, {
    statusCode: httpStatusCode.OK,
    success: true,
    message: "Categories retrieved successfully",
    data: result,
  });
};

const updateCategory = async (req: Request, res: Response) => {
  const result = await ProductService.updateCategory(req.params.id, req.body);

  sendResponse(res, {
    statusCode: httpStatusCode.OK,
    success: true,
    message: "Category updated successfully",
    data: result,
  });
};

const deleteCategory = async (req: Request, res: Response) => {
  await ProductService.deleteCategory(req.params.id);

  sendResponse(res, {
    statusCode: httpStatusCode.OK,
    success: true,
    message: "Category deleted successfully",
  });
};

const toggleCategoryStatus = async (req: Request, res: Response) => {
  const { isActive } = req.body;
  const result = await ProductService.toggleCategoryStatus(
    req.params.id,
    isActive,
  );

  sendResponse(res, {
    statusCode: httpStatusCode.OK,
    success: true,
    message: `Category ${isActive ? "activated" : "deactivated"} successfully`,
    data: result,
  });
};

// ============ BRAND CONTROLLERS ============

const createBrand = async (req: Request, res: Response) => {
  const { companyId } = req.user!;
  const result = await ProductService.createBrand(
    companyId!.toString(),
    req.body,
  );

  sendResponse(res, {
    statusCode: httpStatusCode.CREATED,
    success: true,
    message: "Brand created successfully",
    data: result,
  });
};

const getAllBrands = async (req: Request, res: Response) => {
  const { companyId } = req.user!;
  const result = await ProductService.getAllBrands(
    companyId!.toString(),
    req.query,
  );

  sendResponse(res, {
    statusCode: httpStatusCode.OK,
    success: true,
    message: "Brands retrieved successfully",
    data: result,
  });
};

const updateBrand = async (req: Request, res: Response) => {
  const result = await ProductService.updateBrand(req.params.id, req.body);

  sendResponse(res, {
    statusCode: httpStatusCode.OK,
    success: true,
    message: "Brand updated successfully",
    data: result,
  });
};

const deleteBrand = async (req: Request, res: Response) => {
  await ProductService.deleteBrand(req.params.id);

  sendResponse(res, {
    statusCode: httpStatusCode.OK,
    success: true,
    message: "Brand deleted successfully",
  });
};

const toggleBrandStatus = async (req: Request, res: Response) => {
  const { isActive } = req.body;
  const result = await ProductService.toggleBrandStatus(
    req.params.id,
    isActive,
  );

  sendResponse(res, {
    statusCode: httpStatusCode.OK,
    success: true,
    message: `Brand ${isActive ? "activated" : "deactivated"} successfully`,
    data: result,
  });
};

// ============ PRODUCT CONTROLLERS ============

const createProduct = async (req: Request, res: Response) => {
  const { companyId, userId } = req.user!;
  let imagePayload = req.body;

  // Handle Image Uploads
  if (req.files && Array.isArray(req.files)) {
    const { uploadToCloudinary } = await import("../../utils/cloudinary");
    const uploadPromises = (req.files as Express.Multer.File[]).map((file) =>
      uploadToCloudinary(file, "products"),
    );
    const images = await Promise.all(uploadPromises);
    imagePayload = { ...req.body, images };
  }

  const result = await ProductService.createProduct(
    companyId!.toString(),
    userId.toString(),
    imagePayload,
  );

  sendResponse(res, {
    statusCode: httpStatusCode.CREATED,
    success: true,
    message: "Product created successfully",
    data: result,
  });
};

const getAllProducts = async (req: Request, res: Response) => {
  const { companyId } = req.user!;
  const result = await ProductService.getAllProducts(
    companyId!.toString(),
    req.query,
  );

  sendResponse(res, {
    statusCode: httpStatusCode.OK,
    success: true,
    message: "Products retrieved successfully",
    data: result,
  });
};

const getProductById = async (req: Request, res: Response) => {
  const result = await ProductService.getProductById(req.params.id);

  sendResponse(res, {
    statusCode: httpStatusCode.OK,
    success: true,
    message: "Product retrieved successfully",
    data: result,
  });
};

const updateProduct = async (req: Request, res: Response) => {
  const result = await ProductService.updateProduct(req.params.id, req.body);

  sendResponse(res, {
    statusCode: httpStatusCode.OK,
    success: true,
    message: "Product updated successfully",
    data: result,
  });
};

const deleteProduct = async (req: Request, res: Response) => {
  await ProductService.deleteProduct(req.params.id);

  sendResponse(res, {
    statusCode: httpStatusCode.OK,
    success: true,
    message: "Product deleted successfully",
  });
};

export const ProductController = {
  // Category
  createCategory: asyncHandler(createCategory),
  getAllCategories: asyncHandler(getAllCategories),
  updateCategory: asyncHandler(updateCategory),
  deleteCategory: asyncHandler(deleteCategory),
  toggleCategoryStatus: asyncHandler(toggleCategoryStatus),
  // Brand
  createBrand: asyncHandler(createBrand),
  getAllBrands: asyncHandler(getAllBrands),
  updateBrand: asyncHandler(updateBrand),
  deleteBrand: asyncHandler(deleteBrand),
  toggleBrandStatus: asyncHandler(toggleBrandStatus),
  // Product
  createProduct: asyncHandler(createProduct),
  getAllProducts: asyncHandler(getAllProducts),
  getProductById: asyncHandler(getProductById),
  updateProduct: asyncHandler(updateProduct),
  deleteProduct: asyncHandler(deleteProduct),
};
