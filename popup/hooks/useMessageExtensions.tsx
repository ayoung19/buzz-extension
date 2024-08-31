import { Link } from "@mantine/tiptap";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";
import StarterKit from "@tiptap/starter-kit";

interface Props {
  placeholder?: string;
}

export const useMessageExtensions = (props?: Props) => {
  const { placeholder } = props || {};

  return [
    StarterKit.configure({
      heading: false,
      horizontalRule: false,
      bulletList: false,
      orderedList: false,
      listItem: false,
    }).extend({
      addKeyboardShortcuts: () => ({
        Enter: () => true,
      }),
    }),
    Underline,
    Link,
    ...(placeholder
      ? [
          Placeholder.configure({
            placeholder,
          }),
        ]
      : []),
  ];
};
