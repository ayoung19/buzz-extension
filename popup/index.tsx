import { MantineProvider } from "@mantine/core";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { AppWrapper } from "./AppWrapper";
import { SettingsProvider } from "./contexts/SettingsContext";

const queryClient = new QueryClient();

function IndexPopup() {
  return (
    <MantineProvider withGlobalStyles withNormalizeCSS>
      <QueryClientProvider client={queryClient}>
        <SettingsProvider>
          <AppWrapper />
        </SettingsProvider>
      </QueryClientProvider>
    </MantineProvider>
  );
}

export default IndexPopup;
