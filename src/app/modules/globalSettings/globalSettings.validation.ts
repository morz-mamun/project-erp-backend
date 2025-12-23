import { z } from "zod";

const updateGlobalSettings = z.object({
  body: z.object({
    applicationName: z.string().optional(),
    maintenanceMode: z.boolean().optional(),
    allowCompanyRegistration: z.boolean().optional(),
    supportEmail: z.string().email().optional(),
  }),
});

export const GlobalSettingsValidation = {
  updateGlobalSettings,
};
