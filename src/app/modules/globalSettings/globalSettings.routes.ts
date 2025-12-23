import { Router } from "express";
import { GlobalSettingsController } from "./globalSettings.controller";
import Authentication from "../../middlewares/authentication";
import { authorize } from "../../middlewares/rbac";
import { UserRole } from "../../utils/enum/userRole";
import validateRequest from "../../middlewares/validateRequest";
import { GlobalSettingsValidation } from "./globalSettings.validation";
import activityLogger from "../../middlewares/activityLogger";

const router = Router();

router.get("/", GlobalSettingsController.getGlobalSettings);

router.patch(
  "/",
  Authentication(),
  authorize(UserRole.SUPER_ADMIN),
  validateRequest(GlobalSettingsValidation.updateGlobalSettings),
  activityLogger("UPDATE_GLOBAL_SETTINGS", "GlobalSettings"),
  GlobalSettingsController.updateGlobalSettings,
);

export const GlobalSettingsRoutes = router;
