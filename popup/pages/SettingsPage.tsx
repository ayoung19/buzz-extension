import { type User } from "@instantdb/core";
import {
  Anchor,
  Card,
  Flex,
  Loader,
  Stack,
  Switch,
  Tabs,
  Text,
  Title,
} from "@mantine/core";

import { ProfileSettings } from "~popup/components/settings/ProfileSettings";
import { useSettings } from "~popup/hooks/useSettings";
import db from "~popup/utils/db";

interface Props {
  user: User;
}

export const SettingsPage = ({ user }: Props) => {
  const { settings, setSettings } = useSettings();

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

  if (!settings) {
    return <Loader />;
  }

  return (
    <Tabs defaultValue="profile">
      <Tabs.List>
        <Tabs.Tab value="profile">Profile</Tabs.Tab>
        <Tabs.Tab value="privacy">Privacy</Tabs.Tab>
      </Tabs.List>

      <Tabs.Panel value="profile">
        <ProfileSettings user={user} />
      </Tabs.Panel>
      <Tabs.Panel value="privacy">
        <Card>
          <Stack spacing="xs">
            <Flex gap="md" justify="space-between">
              <Stack spacing={0}>
                <Title order={6}>Anonymously Publish Active Tab</Title>
                <Text fz="xs">
                  Enabling this setting will anonymously publish your active
                  tab, allowing others to see the number of users on a
                  particular page. Thanks to our meticulously designed
                  architecture, neither Buzz, its users, nor any bad actors can
                  use the published data for any other purpose. Learn more about
                  our privacy measures
                  <Anchor
                    href="https://github.com/ayoung19/buzz-extension"
                    target="_blank"
                  >
                    <> here</>
                  </Anchor>
                  .
                </Text>
              </Stack>
              <Switch
                checked={settings.privacy.anonymouslyPublishActiveTab}
                onChange={(e) => {
                  setSettings((prevState) => ({
                    ...prevState,
                    privacy: {
                      ...prevState.privacy,
                      anonymouslyPublishActiveTab: e.target.checked,
                    },
                  }));

                  if (!e.target.checked && userPublishedStateId) {
                    db.transact(
                      db.tx.publishedStates[userPublishedStateId]!.update({
                        onChannelHash: undefined,
                      }),
                    );
                  }
                }}
              />
            </Flex>
            <Flex gap="md" justify="space-between">
              <Stack spacing={0}>
                <Title order={6}>Anonymously Publish Active Chat</Title>
                <Text fz="xs">
                  Enabling this setting will anonymously publish your active
                  chat, allowing others to see the number of users on a
                  particular chat. Thanks to our meticulously designed
                  architecture, neither Buzz, its users, nor any bad actors can
                  use the published data for any other purpose. Learn more about
                  our privacy measures
                  <Anchor
                    href="https://github.com/ayoung19/buzz-extension"
                    target="_blank"
                  >
                    <> here</>
                  </Anchor>
                  .
                </Text>
              </Stack>
              <Switch
                checked={settings.privacy.anonymouslyPublishActiveChat}
                onChange={(e) => {
                  setSettings((prevState) => ({
                    ...prevState,
                    privacy: {
                      ...prevState.privacy,
                      anonymouslyPublishActiveChat: e.target.checked,
                    },
                  }));

                  if (!e.target.checked && userPublishedStateId) {
                    db.transact(
                      db.tx.publishedStates[userPublishedStateId]!.update({
                        inChannelHash: undefined,
                      }),
                    );
                  }
                }}
              />
            </Flex>
          </Stack>
        </Card>
      </Tabs.Panel>
    </Tabs>
  );
};
