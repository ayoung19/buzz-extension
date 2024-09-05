import { useContext, type Dispatch, type SetStateAction } from "react";

import { SettingsDispatchContext } from "~popup/contexts/SettingsContext";
import type { SettingsWithDefaults } from "~popup/types/settings";

type UseSettingsResult =
  | { settings: undefined; setSettings: undefined }
  | {
      settings: SettingsWithDefaults;
      setSettings: Dispatch<SetStateAction<SettingsWithDefaults>>;
    };

export const useSettings = (): UseSettingsResult => {
  const modalContext = useContext(SettingsDispatchContext);

  if (modalContext === undefined || modalContext.settings === undefined) {
    return { settings: undefined, setSettings: undefined };
  }

  const { settings, setSettings } = modalContext;

  return { settings, setSettings };
};
