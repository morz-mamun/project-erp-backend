import GlobalSettings from "./globalSettings.model";
import { IGlobalSettings } from "./globalSettings.interface";

const getGlobalSettings = async (): Promise<IGlobalSettings> => {
  let settings = await GlobalSettings.findOne();
  if (!settings) {
    settings = await GlobalSettings.create({});
  }
  return settings;
};

const updateGlobalSettings = async (
  payload: Partial<IGlobalSettings>,
): Promise<IGlobalSettings | null> => {
  let settings = await GlobalSettings.findOne();
  if (!settings) {
    settings = await GlobalSettings.create(payload);
  } else {
    Object.assign(settings, payload);
    await settings.save();
  }
  return settings;
};

export const GlobalSettingsService = {
  getGlobalSettings,
  updateGlobalSettings,
};
