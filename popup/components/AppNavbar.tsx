import { tx, type User } from "@instantdb/core";
import { Navbar, NavLink, Stack, Text } from "@mantine/core";
import { useEffect, useMemo } from "react";
import { useHistory, useLocation } from "react-router-dom";

import db from "~popup/utils/db";
import { channelToChannelHash } from "~popup/utils/hash";

import { UnreadMessagesIndicator } from "./UnreadMessagesIndicator";
import { UsersInChannelBadge } from "./UsersInChannelBadge";

interface Props {
  user: User;
  channels: string[];
}

export const AppNavbar = ({ user, channels }: Props) => {
  const location = useLocation();
  const history = useHistory();

  const bookmarkedChannelsQuery = db.useQuery({
    bookmarkedChannels: {
      $: {
        where: {
          "privateUser.id": user.id,
        },
      },
    },
  });

  const bookmarkedChannels = useMemo(
    () =>
      Array.from(
        new Set(
          (bookmarkedChannelsQuery.data?.bookmarkedChannels || []).map(
            ({ channel }) => channel,
          ),
        ),
      ),
    [bookmarkedChannelsQuery.data?.bookmarkedChannels || []],
  );

  const publishedStatesQuery = db.useQuery({
    publishedStates: {
      $: {
        where: {
          "privateUser.id": user.id,
        },
      },
    },
  });

  const privateUserPublishedStateId = (publishedStatesQuery.data
    ?.publishedStates || [])[0]?.id;

  // Publish the channel the user is in every time it changes.
  useEffect(() => {
    if (privateUserPublishedStateId) {
      db.transact([
        tx.publishedStates[privateUserPublishedStateId].update({
          inChannelHash: location.pathname.startsWith("/channels/")
            ? channelToChannelHash(location.pathname.replace("/channels/", ""))
            : null,
        }),
        // TODO: Uncomment this and it no longer properly updates on first
        // channel visit, only subsequent ones.
        // tx.userIdAndChannelHashToLastRead[
        //   lookup(
        //     "userIdAndChannelHash",
        //     userIdAndChannelToUserIdAndChannelHash(user.id, activeChannel),
        //   )
        // ].update({ lastRead: new Date().getTime() }),
      ]);
    }
  }, [location.pathname, privateUserPublishedStateId, user.id]);

  return (
    <Navbar width={{ base: 250 }} p="xs">
      <Stack justify="space-between" h="100%">
        <Stack spacing={0}>
          {bookmarkedChannels.length > 0 && (
            <>
              <Text fz="xs" fw={600} c="dimmed" mb={0}>
                BOOKMARKED CHATS
              </Text>
              {bookmarkedChannels.map((channel) => (
                <NavLink
                  key={channel}
                  label={<Text size="sm">{channel}</Text>}
                  variant="light"
                  active={`/channels/${channel}` === location.pathname}
                  onClick={() => history.push(`/channels/${channel}`)}
                  rightSection={
                    <UnreadMessagesIndicator user={user} channel={channel}>
                      <UsersInChannelBadge channel={channel} />
                    </UnreadMessagesIndicator>
                  }
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
                <Text size="sm">
                  {channel.substring(channel.lastIndexOf("/") + 1)}
                </Text>
              }
              variant="light"
              active={`/channels/${channel}` === location.pathname}
              onClick={() => history.push(`/channels/${channel}`)}
              rightSection={
                <UnreadMessagesIndicator user={user} channel={channel}>
                  <UsersInChannelBadge channel={channel} />
                </UnreadMessagesIndicator>
              }
            />
          ))}
        </Stack>
        <Stack spacing={0}></Stack>
      </Stack>
    </Navbar>
  );
};
