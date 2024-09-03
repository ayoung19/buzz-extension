import { id, tx, type User } from "@instantdb/core";
import { ActionIcon } from "@mantine/core";
import { IconStar, IconStarFilled } from "@tabler/icons-react";

import db from "~popup/utils/db";

interface Props {
  user: User;
  channel: string;
}

export const BookmarkChannelIcon = ({ user, channel }: Props) => {
  const bookmarkedChannelsQuery = db.useQuery({
    bookmarkedChannels: {
      $: {
        where: {
          "privateUser.id": user.id,
          channel,
        },
      },
    },
  });

  if (!bookmarkedChannelsQuery.data) {
    return null;
  }

  const isBookmarked =
    !!bookmarkedChannelsQuery.data?.bookmarkedChannels.length;

  return (
    <ActionIcon
      onClick={() =>
        isBookmarked
          ? db.transact(
              bookmarkedChannelsQuery.data.bookmarkedChannels.map(({ id }) =>
                tx.bookmarkedChannels[id].delete(),
              ),
            )
          : db.transact(
              tx.bookmarkedChannels[id()]
                .update({ channel })
                .link({ privateUser: user.id }),
            )
      }
    >
      {isBookmarked ? (
        <IconStarFilled size="1.125rem" />
      ) : (
        <IconStar size="1.125rem" />
      )}
    </ActionIcon>
  );
};
