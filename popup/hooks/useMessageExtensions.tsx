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
      hardBreak: false,
    }).extend({
      addKeyboardShortcuts: () => ({
        Enter: () => true,
        "Shift-Enter": ({ editor }) =>
          // Default enter behavior.
          // https://github.com/ueberdosis/tiptap/blob/cf2067906f506486c6613f872be8b1fd318526c9/packages/core/src/extensions/keymap.ts#L56-L61
          editor.commands.first(({ commands }) => [
            () => commands.newlineInCode(),
            () => commands.createParagraphNear(),
            () => commands.liftEmptyBlock(),
            () => commands.splitBlock(),
          ]),
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
