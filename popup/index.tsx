import { MantineProvider } from "@mantine/core";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AppWrapper } from "./AppWrapper";

const queryClient = new QueryClient();

function IndexPopup() {
  return (
    <MantineProvider withGlobalStyles withNormalizeCSS>
      <QueryClientProvider client={queryClient}>
        <AppWrapper />
      </QueryClientProvider>
    </MantineProvider>
  );
}

export default IndexPopup;
