import { createHash } from "crypto";
import { id, tx, type User } from "@instantdb/core";
import {
  AppShell,
  Header,
  Navbar,
  NavLink,
  Stack,
  Text,
  Textarea,
  ThemeIcon,
  Title,
} from "@mantine/core";
import { getHotkeyHandler } from "@mantine/hooks";
import { IconSlash } from "@tabler/icons-react";
import { useEffect, useMemo, useState } from "react";

import type { Db } from "./AppWrapper";

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

  const [value, setValue] = useState("");

  useEffect(() => {
    db.transact(tx.users[user.id].update({ email: user.email }));
  }, [user.id, user.email]);

  useEffect(() => {
    db.transact(
      tx.users[user.id].update({
        activeChannelHash,
      }),
    );
  }, [user.id, activeChannel]);

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
      <Stack spacing="xs" justify="space-between" h="100%">
        <Text fz="sm" fw={500}>
          Chat for {activeChannel}
        </Text>
        <Stack spacing={0}>
          <Stack spacing={0}>
            {(messagesQuery.data?.messages || []).toReversed().map(
              (message) =>
                message.user[0] && (
                  <Stack spacing={0} key={message.id}>
                    <Text fz="sm">{message.user[0].email}</Text>
                    <Text fz="sm">{message.value}</Text>
                  </Stack>
                ),
            )}
          </Stack>
          <Textarea
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={`Message ${activeChannel}`}
            onKeyDown={getHotkeyHandler([
              [
                "Enter",
                async () => {
                  await db.transact(
                    tx.messages[id()]
                      .update({
                        channelHash: activeChannelHash,
                        value: value,
                      })
                      .link({ user: user.id }),
                  );

                  setValue("");
                },
              ],
            ])}
            autosize
          />
        </Stack>
      </Stack>
    </AppShell>
  );
};
