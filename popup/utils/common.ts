import type { MantineTheme } from "@mantine/core";

export const commonRichTextEditorStyles = (theme: MantineTheme) => ({
  p: { fontSize: theme.fontSizes.sm, marginBottom: 0 },
  blockquote: {
    paddingTop: theme.spacing.xs,
    paddingRight: theme.spacing.sm,
    paddingBottom: theme.spacing.xs,
    paddingLeft: theme.spacing.sm,
    marginTop: 0,
    marginBottom: 0,
  },
});
