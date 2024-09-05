import { type User } from "@instantdb/core";
import { Card, Stack, TextInput } from "@mantine/core";

import db from "~popup/utils/db";

interface Props {
  user: User;
}

export const ProfileSettings = ({ user }: Props) => {
  const privateUserQuery = db.useQuery({
    privateUsers: {
      publicUser: {},
      $: {
        where: {
          id: user.id,
        },
      },
    },
  });

  const email = (privateUserQuery.data?.privateUsers || [])[0]?.email;

  return (
    <Card>
      <Stack spacing="xs">
        <TextInput label="Email" value={email} disabled />
      </Stack>
    </Card>
  );
};
