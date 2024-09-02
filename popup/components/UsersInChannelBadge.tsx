import { Badge } from "@mantine/core";
import { useMemo } from "react";

import { channelToChannelHash } from "~popup/utils/channelHash";
import db from "~popup/utils/db";

interface Props {
  channel: string;
}

export const UsersInChannelBadge = ({ channel }: Props) => {
  const channelHash = useMemo(() => channelToChannelHash(channel), [channel]);

  const publishedStatesQuery = db.useQuery({
    publishedStates: {
      $: {
        where: {
          inChannelHash: channelHash,
        },
      },
    },
  });

  return (
    publishedStatesQuery.data && (
      <Badge color="green">
        {publishedStatesQuery.data.publishedStates.length}
      </Badge>
    )
  );
};
