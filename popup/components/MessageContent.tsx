import { RichTextEditor } from "@mantine/tiptap";
import { generateJSON, useEditor } from "@tiptap/react";
import { useMemo } from "react";

import { useMessageExtensions } from "~popup/hooks/useMessageExtensions";
import { commonRichTextEditorStyles } from "~popup/utils/common";

interface Props {
  content: string;
}

export const MessageContent = ({ content }: Props) => {
  const messageExtensions = useMessageExtensions();

  const editor = useEditor({
    extensions: messageExtensions,
    editable: false,
    content: content,
  });

  return (
    <RichTextEditor editor={editor} sx={{ border: "none" }}>
      <RichTextEditor.Content
        sx={(theme) => ({
          ".ProseMirror": { padding: 0 },
          ...commonRichTextEditorStyles(theme),
        })}
      />
    </RichTextEditor>
  );
};
