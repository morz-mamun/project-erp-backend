import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import sendResponse from "../../utils/sendResponse";
import { GlobalSettingsService } from "./globalSettings.service";
import httpStatus from "http-status";

const getGlobalSettings = asyncHandler(async (req: Request, res: Response) => {
  const result = await GlobalSettingsService.getGlobalSettings();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Global settings retrieved successfully",
    data: result,
  });
});

const updateGlobalSettings = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await GlobalSettingsService.updateGlobalSettings(req.body);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Global settings updated successfully",
      data: result,
    });
  },
);

export const GlobalSettingsController = {
  getGlobalSettings,
  updateGlobalSettings,
};
