import { RichTextEditor } from "@mantine/tiptap";
import { useEditor } from "@tiptap/react";

import { useMessageExtensions } from "~popup/hooks/useMessageExtensions";

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
    <RichTextEditor
      editor={editor}
      sx={(theme) => ({ p: { fontSize: theme.fontSizes.sm }, border: "none" })}
    >
      <RichTextEditor.Content sx={{ ".ProseMirror": { padding: 0 } }} />
    </RichTextEditor>
  );
};
