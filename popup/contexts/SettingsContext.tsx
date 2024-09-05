import {
  createContext,
  useEffect,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";

import { Storage } from "@plasmohq/storage";

import { defaultSettings, SettingsWithDefaults } from "~popup/types/settings";

const storage = new Storage({
  area: "local",
});

export interface SettingsContext {
  settings: SettingsWithDefaults | undefined;
  setSettings: Dispatch<SetStateAction<SettingsWithDefaults>>;
}

export const SettingsDispatchContext = createContext<
  SettingsContext | undefined
>(undefined);

interface Props {
  children: ReactNode;
}

export const SettingsProvider = ({ children }: Props) => {
  const [settings, setSettings] = useState<SettingsWithDefaults | undefined>();

  const setSettingsAndStorage = (s: SetStateAction<SettingsWithDefaults>) =>
    setSettings((prevState) => {
      const newState =
        typeof s === "function"
          ? s(prevState === undefined ? defaultSettings : prevState)
          : s;

      storage.set("settings", JSON.stringify(newState));

      return newState;
    });

  useEffect(() => {
    (async () => {
      const settingsString = await storage.get("settings");

      if (settingsString === undefined) {
        setSettingsAndStorage(defaultSettings);
      } else {
        try {
          setSettingsAndStorage(
            SettingsWithDefaults.parse(JSON.parse(settingsString)),
          );
        } catch (e) {
          setSettingsAndStorage(defaultSettings);
        }
      }
    })();
  }, []);

  return (
    <SettingsDispatchContext.Provider
      value={{ settings, setSettings: setSettingsAndStorage }}
    >
      {children}
    </SettingsDispatchContext.Provider>
  );
};
