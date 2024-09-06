import { Badge, Skeleton } from "@mantine/core";
import { useMemo } from "react";

import db from "~popup/utils/db";
import { channelToChannelHash } from "~popup/utils/hash";

interface Props {
  channel: string;
}

export const UsersOnChannelBadge = ({ channel }: Props) => {
  const channelHash = useMemo(() => channelToChannelHash(channel), [channel]);

  const publishedStatesQuery = db.useQuery({
    publishedStates: {
      $: {
        where: {
          onChannelHash: channelHash,
        },
      },
    },
  });

  return (
    publishedStatesQuery.data && (
      <Badge color="gray">
        {publishedStatesQuery.data.publishedStates.length}
      </Badge>
    )
  );
};
