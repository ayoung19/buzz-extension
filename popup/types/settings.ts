import { z } from "zod";

export const defaultSettings = {
  privacy: {
    anonymouslyPublishActiveTab: true,
    anonymouslyPublishActiveChat: true,
  },
};

export const SettingsWithDefaults = z
  .object({
    privacy: z
      .object({
        anonymouslyPublishActiveTab: z
          .boolean()
          .default(defaultSettings.privacy.anonymouslyPublishActiveTab),
        anonymouslyPublishActiveChat: z
          .boolean()
          .default(defaultSettings.privacy.anonymouslyPublishActiveChat),
      })
      .default(defaultSettings.privacy),
  })
  .default(defaultSettings);
export type SettingsWithDefaults = z.infer<typeof SettingsWithDefaults>;
