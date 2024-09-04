import { id, tx, type User } from "@instantdb/core";
import { Anchor, Box, Group, ScrollArea, Stack, Text } from "@mantine/core";
import { getHotkeyHandler, useMap } from "@mantine/hooks";
import { RichTextEditor } from "@mantine/tiptap";
import { useEditor, type Content } from "@tiptap/react";
import { useEffect, useRef } from "react";

import { BookmarkChannelIcon } from "~popup/components/BookmarkChannelIcon";
import { MessageContent } from "~popup/components/MessageContent";
import { useMessageExtensions } from "~popup/hooks/useMessageExtensions";
import { commonRichTextEditorStyles } from "~popup/utils/common";
import db from "~popup/utils/db";
import { channelToChannelHash } from "~popup/utils/hash";

const defaultContent = "<p></p>";

interface Props {
  user: User;
  channel: string;
  channelToEditorContent: Map<string, Content>;
}

export const Channel = ({ user, channel, channelToEditorContent }: Props) => {
  const publicSelfQuery = db.useQuery({
    publicUsers: {
      $: {
        where: {
          "privateUser.id": user.id,
        },
      },
    },
  });

  const messagesQuery = db.useQuery({
    messages: {
      publicUser: {},
      $: {
        where: {
          channelHash: channelToChannelHash(channel),
        },
        order: {
          serverCreatedAt: "desc",
        },
      },
    },
  });
  const anchor = useRef<HTMLDivElement>(null);

  const messageExtensions = useMessageExtensions({
    placeholder: `Message ${channel}`,
  });
  const editor = useEditor({
    extensions: messageExtensions,
    onUpdate: ({ editor }) =>
      channelToEditorContent.set(channel, editor.getHTML()),
  });

  // Scroll to bottom of chat whenever messages query gets updated.
  useEffect(() => {
    if (anchor.current) {
      anchor.current.scrollIntoView();
    }
  }, [messagesQuery.data]);

  useEffect(() => {
    if (editor) {
      editor.commands.setContent(
        channelToEditorContent.get(channel) || defaultContent,
      );
      editor.commands.focus();
    }
  }, [channel]);

  return (
    <Stack spacing="sm" h="100%">
      <Group position="apart" align="center">
        <Text fz="sm" fw={500}>
          <>Chat for </>
          <Anchor href={`https://${channel}`} target="_blank">
            {channel}
          </Anchor>
        </Text>
        <BookmarkChannelIcon user={user} channel={channel} />
      </Group>
      <Stack spacing={0} sx={{ flexGrow: 1 }}>
        <ScrollArea type="always" h={1} sx={{ flexGrow: 1 }}>
          {(messagesQuery.data?.messages || []).toReversed().map(
            (message) =>
              message.publicUser[0] && (
                <Stack spacing={0} key={message.id}>
                  <Text fz="sm">
                    <strong>{message.publicUser[0].displayName}</strong>
                  </Text>
                  <MessageContent content={message.content} />
                </Stack>
              ),
          )}
          <Box ref={anchor} />
        </ScrollArea>
        <RichTextEditor editor={editor}>
          <RichTextEditor.Content
            onKeyDown={getHotkeyHandler([
              [
                "Enter",
                async () => {
                  if (
                    editor &&
                    !editor?.isEmpty &&
                    publicSelfQuery.data?.publicUsers.length
                  ) {
                    await db.transact(
                      tx.messages[id()]
                        .update({
                          channelHash: channelToChannelHash(channel),
                          content: editor.getHTML(),
                        })
                        .link({
                          publicUser: publicSelfQuery.data.publicUsers[0].id,
                        }),
                    );
                    editor.commands.clearContent(true);
                  }
                },
              ],
            ])}
            sx={(theme) => ({
              ".ProseMirror": { padding: theme.spacing.sm },
              ...commonRichTextEditorStyles(theme),
            })}
          />
        </RichTextEditor>
      </Stack>
    </Stack>
  );
};
