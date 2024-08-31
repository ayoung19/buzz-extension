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
import { getHotkeyHandler } from "@mantine/hooks";
import { RichTextEditor } from "@mantine/tiptap";
import { IconSlash } from "@tabler/icons-react";
import { useEditor } from "@tiptap/react";
import { useEffect, useMemo, useRef, useState } from "react";

import { useMessageExtensions } from "~popup/hooks/useMessageExtensions";

import type { Db } from "./AppWrapper";
import { MessageContent } from "./MessageContent";

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

  const selfQuery = db.useQuery({
    users: {
      $: {
        where: {
          id: user.id,
        },
      },
    },
  });

  const messagesQuery = db.useQuery({
    messages: {
      user: {},
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
  });

  const viewport = useRef<HTMLDivElement>(null);
  const anchor = useRef<HTMLDivElement>(null);

  useEffect(() => {
    db.transact(tx.users[user.id].update({ email: user.email }));
  }, [user.id, user.email]);

  useEffect(() => {
    if (selfQuery.data?.users.length) {
      db.transact(
        tx.users[user.id].update({
          activeChannelHash,
        }),
      );
    }
  }, [selfQuery.data?.users.length, user.id, activeChannel]);

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
          <ScrollArea viewportRef={viewport} h={1} sx={{ flexGrow: 1 }}>
            {(messagesQuery.data?.messages || []).toReversed().map(
              (message) =>
                message.user[0] && (
                  <Stack spacing={0} key={message.id}>
                    <Text fz="sm">
                      <strong>{message.user[0].email}</strong>
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
                    if (editor && !editor.isEmpty) {
                      await db.transact(
                        tx.messages[id()]
                          .update({
                            channelHash: activeChannelHash,
                            content: editor.getHTML(),
                          })
                          .link({ user: user.id }),
                      );

                      editor.commands.clearContent();
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
