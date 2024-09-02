import { createHash } from "crypto";
import { id, tx, type User } from "@instantdb/core";
import {
  AppShell,
  Box,
  Header,
  Navbar,
  NavLink,
  ScrollArea,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from "@mantine/core";
import { getHotkeyHandler, useMap } from "@mantine/hooks";
import { RichTextEditor } from "@mantine/tiptap";
import { IconSlash } from "@tabler/icons-react";
import { useEditor, type Content } from "@tiptap/react";
import { useEffect, useMemo, useRef, useState } from "react";

import { useMessageExtensions } from "~popup/hooks/useMessageExtensions";

import type { Db } from "./AppWrapper";
import { MessageContent } from "./MessageContent";

const defaultContent = "<p></p>";

interface Props {
  db: Db;
  user: User;
  channels: string[];
}

export const App = ({ db, user, channels }: Props) => {
  const [activeChannel, setActiveChannel] = useState(
    channels[channels.length - 1],
  );
  const activeChannelHash = useMemo(
    () => createHash("sha256").update(activeChannel).digest("hex"),
    [activeChannel],
  );
  const channelToEditorContent = useMap<string, Content>(
    channels.map((channel) => [channel, defaultContent]),
  );

  const selfQuery = db.useQuery({
    privateUsers: {
      publishedState: {},
      publicUser: {},
      $: {
        where: {
          id: user.id,
        },
      },
    },
  });
  const selfPublicUser =
    selfQuery.data?.privateUsers[0] &&
    selfQuery.data?.privateUsers[0].publicUser[0];
  const messagesQuery = db.useQuery({
    messages: {
      publicUser: {},
      $: {
        limit: 10,
        where: {
          channelHash: activeChannelHash,
        },
        order: {
          serverCreatedAt: "desc",
        },
      },
    },
  });

  const messageExtensions = useMessageExtensions({
    placeholder: `Message ${activeChannel}`,
  });
  const editor = useEditor({
    extensions: messageExtensions,
    content: channelToEditorContent.get(activeChannel) || defaultContent,
    onUpdate: ({ editor }) =>
      channelToEditorContent.set(activeChannel, editor.getHTML()),
  });
  const anchor = useRef<HTMLDivElement>(null);

  // Create private user, public user, and initial published state if query for
  // self has finished loading and no records were found.
  useEffect(() => {
    if (!selfQuery.isLoading && !selfQuery.data?.privateUsers.length) {
      db.transact([
        tx.privateUsers[user.id].update({ email: user.email }),
        tx.publicUsers[id()]
          .update({ displayName: user.email })
          .link({ privateUser: user.id }),
        tx.publishedStates[id()]
          .update({ inChannelHash: null, onChannelHash: null })
          .link({ privateUser: user.id }),
      ]);
    }
  }, [
    selfQuery.isLoading,
    selfQuery.data?.privateUsers.length,
    user.id,
    user.email,
  ]);

  // Publish the channel the user is in every time it changes.
  useEffect(() => {
    if (!selfQuery.isLoading && selfQuery.data?.privateUsers.length) {
      db.transact(
        tx.publishedStates[
          selfQuery.data.privateUsers[0].publishedState[0].id
        ].update({
          inChannelHash: activeChannelHash,
        }),
      );
    }

    if (editor) {
      editor.commands.setContent(
        channelToEditorContent.get(activeChannel) || defaultContent,
      );
      editor.commands.focus();
    }
  }, [
    selfQuery.isLoading,
    selfQuery.data?.privateUsers.length,
    activeChannel,
    user.id,
  ]);

  useEffect(() => {
    if (anchor.current) {
      anchor.current.scrollIntoView();
    }
  }, [messagesQuery.data]);

  return (
    <AppShell
      w={800}
      h={600}
      header={
        <Header height={50} p="xs">
          <Title order={4}>Buzz</Title>
        </Header>
      }
      navbar={
        <Navbar width={{ base: 200 }} p="xs">
          <Stack spacing="xs">
            <Text fz="xs" fw={600} c="dimmed">
              CHATS
            </Text>
            {channels.map((channel, i) => (
              <NavLink
                key={channel}
                label={
                  <Text size="sm">
                    {channel.substring(channel.lastIndexOf("/") + 1)}
                  </Text>
                }
                icon={
                  i > 0 && (
                    <ThemeIcon color="blue" variant="light">
                      <IconSlash size="1rem" />
                    </ThemeIcon>
                  )
                }
                variant="light"
                active={channel === activeChannel}
                onClick={() => setActiveChannel(channel)}
              />
            ))}
          </Stack>
        </Navbar>
      }
    >
      <Stack spacing="sm" h="100%">
        <Text fz="sm" fw={500}>
          Chat for {activeChannel}
        </Text>
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
          <RichTextEditor
            editor={editor}
            sx={(theme) => ({ p: { fontSize: theme.fontSizes.sm } })}
          >
            <RichTextEditor.Content
              onKeyDown={getHotkeyHandler([
                [
                  "Enter",
                  async () => {
                    if (editor && !editor.isEmpty && selfPublicUser) {
                      await db.transact(
                        tx.messages[id()]
                          .update({
                            channelHash: activeChannelHash,
                            content: editor.getHTML(),
                          })
                          .link({
                            publicUser: selfPublicUser.id,
                          }),
                      );

                      editor.commands.clearContent(true);
                    }
                  },
                ],
              ])}
              sx={(theme) => ({
                ".ProseMirror": { padding: theme.spacing.sm },
              })}
            />
          </RichTextEditor>
        </Stack>
      </Stack>
    </AppShell>
  );
};
