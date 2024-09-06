import { id, type User } from "@instantdb/core";
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
  const bookmarkedChannels =
    bookmarkedChannelsQuery.data?.bookmarkedChannels || [];

  return (
    <ActionIcon
      onClick={() =>
        bookmarkedChannels.length > 0
          ? db.transact(
              bookmarkedChannels.map(({ id }) =>
                db.tx.bookmarkedChannels[id]!.delete(),
              ),
            )
          : db.transact(
              db.tx.bookmarkedChannels[id()]!.update({ channel }).link({
                privateUser: user.id,
              }),
            )
      }
      sx={{
        visibility:
          bookmarkedChannelsQuery.isLoading || bookmarkedChannelsQuery.error
            ? "hidden"
            : "visible",
      }}
    >
      {bookmarkedChannels.length > 0 ? (
        <IconStarFilled size="1.125rem" />
      ) : (
        <IconStar size="1.125rem" />
      )}
    </ActionIcon>
  );
};
