import { lookup, type User } from "@instantdb/core";
import { Navbar, NavLink, Stack, Text, ThemeIcon } from "@mantine/core";
import { IconSettings } from "@tabler/icons-react";
import { useEffect, useMemo } from "react";
import { useHistory, useLocation } from "react-router-dom";

import { Storage } from "@plasmohq/storage";

import { useSettings } from "~popup/hooks/useSettings";
import db from "~popup/utils/db";
import {
  channelToChannelHash,
  userIdAndChannelToUserIdAndChannelHash,
} from "~popup/utils/hash";

import { UnreadMessagesIndicator } from "./UnreadMessagesIndicator";
import { UsersInChannelBadge } from "./UsersInChannelBadge";
import { UsersOnChannelBadge } from "./UsersOnChannelBadge";

const storage = new Storage({
  area: "local",
});

interface Props {
  user: User;
  channels: string[];
}

export const AppNavbar = ({ user, channels }: Props) => {
  const location = useLocation();
  const history = useHistory();
  const { settings } = useSettings();

  const userBookmarkedChannelsQuery = db.useQuery({
    bookmarkedChannels: {
      $: {
        where: {
          "privateUser.id": user.id,
        },
      },
    },
  });

  const userBookmarkedChannels = useMemo(
    () =>
      Array.from(
        new Set(
          (userBookmarkedChannelsQuery.data?.bookmarkedChannels || []).map(
            ({ channel }) => channel,
          ),
        ),
      ),
    [userBookmarkedChannelsQuery.data?.bookmarkedChannels || []],
  );

  const userPublishedStatesQuery = db.useQuery({
    publishedStates: {
      $: {
        where: {
          "privateUser.id": user.id,
        },
      },
    },
  });
  const userPublishedStateId =
    userPublishedStatesQuery.data?.publishedStates[0]?.id;

  // Publish the channel the user is in every time it changes.
  useEffect(() => {
    if (!settings?.privacy.anonymouslyPublishActiveChat) {
      return;
    }

    if (userPublishedStateId) {
      storage.set("userPublishedStateId", userPublishedStateId);

      if (location.pathname.startsWith("/channels/")) {
        const channel = location.pathname.replace("/channels/", "");

        db.transact([
          db.tx.publishedStates[userPublishedStateId]!.update({
            inChannelHash: channelToChannelHash(channel),
          }),
          // TODO: Uncomment this and it no longer properly updates on first
          // channel visit, only subsequent ones.
          // db.tx.userIdAndChannelHashToLastRead[
          //   lookup(
          //     "userIdAndChannelHash",
          //     userIdAndChannelToUserIdAndChannelHash(user.id, channel),
          //   )
          // ]!.update({ lastRead: new Date().getTime() }),
        ]);
      } else {
        db.transact(
          db.tx.publishedStates[userPublishedStateId]!.update({
            inChannelHash: undefined,
          }),
        );
      }
    }
  }, [
    settings?.privacy.anonymouslyPublishActiveChat,
    location.pathname,
    userPublishedStateId,
    user.id,
  ]);

  return (
    <Navbar width={{ base: 250 }} p="xs">
      <Stack justify="space-between" h="100%">
        <Stack spacing={0}>
          {userBookmarkedChannels.length > 0 && (
            <>
              <Text fz="xs" fw={600} c="dimmed" mb={0}>
                BOOKMARKED CHATS
              </Text>
              {userBookmarkedChannels.map((channel) => (
                <NavLink
                  key={channel}
                  label={
                    <Text
                      size="sm"
                      sx={{
                        width: "100%",
                        textOverflow: "ellipsis",
                        overflow: "hidden",
                      }}
                    >
                      {channel}
                    </Text>
                  }
                  variant="light"
                  active={`/channels/${channel}` === location.pathname}
                  onClick={() => history.push(`/channels/${channel}`)}
                  rightSection={
                    <UnreadMessagesIndicator user={user} channel={channel}>
                      <Stack spacing="xs">
                        <UsersInChannelBadge channel={channel} />
                        {/* <UsersOnChannelBadge channel={channel} /> */}
                      </Stack>
                    </UnreadMessagesIndicator>
                  }
                  noWrap
                />
              ))}
            </>
          )}
          <Text fz="xs" fw={600} c="dimmed" mb={0}>
            ACTIVE TAB CHATS
          </Text>
          {channels.map((channel, i) => (
            <NavLink
              key={channel}
              label={
                <Text
                  size="sm"
                  sx={{
                    width: "100%",
                    textOverflow: "ellipsis",
                    overflow: "hidden",
                  }}
                >
                  {channel.substring(channel.lastIndexOf("/") + 1)}
                </Text>
              }
              variant="light"
              active={`/channels/${channel}` === location.pathname}
              onClick={() => history.push(`/channels/${channel}`)}
              rightSection={
                <UnreadMessagesIndicator user={user} channel={channel}>
                  <Stack spacing="xs">
                    <UsersInChannelBadge channel={channel} />
                    {/* <UsersOnChannelBadge channel={channel} /> */}
                  </Stack>
                </UnreadMessagesIndicator>
              }
              noWrap
            />
          ))}
        </Stack>
        <Stack spacing={0}>
          <NavLink
            label="Settings"
            variant="light"
            active={location.pathname === "/settings"}
            onClick={() => history.push(`/settings`)}
            icon={
              <ThemeIcon color="blue" variant="light">
                <IconSettings size="1rem" />
              </ThemeIcon>
            }
          />
        </Stack>
      </Stack>
    </Navbar>
  );
};
