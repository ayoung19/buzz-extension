import type { User } from "@instantdb/core";
import { Indicator, type IndicatorProps } from "@mantine/core";
import { useMemo } from "react";

import db from "~popup/utils/db";
import {
  channelToChannelHash,
  userIdAndChannelToUserIdAndChannelHash,
} from "~popup/utils/hash";

interface Props {
  user: User;
  channel: string;
  children: IndicatorProps["children"];
}

export const UnreadMessagesIndicator = ({ user, channel, children }: Props) => {
  // TODO: Once comparison operators exist, we should use them to retrieve the
  // amount of messages that have been created after the user's last read
  // timestamp for this channel. If a message exists, display the unread
  // indicator. Otherwise, don't.

  // const userIdAndChannelHash = useMemo(
  //   () => userIdAndChannelToUserIdAndChannelHash(user.id, channel),
  //   [user.id, channel],
  // );

  // const lastReadQuery = db.useQuery({
  //   userIdAndChannelHashToLastRead: {
  //     $: {
  //       where: {
  //         userIdAndChannelHash: userIdAndChannelHash,
  //       },
  //     },
  //   },
  // });

  return <Indicator disabled={true}>{children}</Indicator>;
};
