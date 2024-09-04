import { id, tx, type User } from "@instantdb/core";
import { AppShell, Header, Title } from "@mantine/core";
import { useMap } from "@mantine/hooks";
import { type Content } from "@tiptap/react";
import { useEffect } from "react";
import { MemoryRouter, Redirect, Route, Switch } from "react-router-dom";

import { Channel } from "~popup/pages/Channel";
import db from "~popup/utils/db";

import { AppNavbar } from "./components/AppNavbar";

interface Props {
  user: User;
  channels: string[];
}

export const App = ({ user, channels }: Props) => {
  const channelToEditorContent = useMap<string, Content>();

  const selfQuery = db.useQuery({
    privateUsers: {
      $: {
        where: {
          id: user.id,
        },
      },
    },
  });

  // Create private user, public user, and initial published state if query for
  // self has finished loading and no records were found.
  useEffect(() => {
    if (!selfQuery.isLoading && !selfQuery.data?.privateUsers.length) {
      db.transact([
        tx.privateUsers[user.id].update({
          email: user.email,
          createdAt: new Date().getTime(),
        }),
        tx.publicUsers[id()]
          .update({ displayName: user.email })
          .link({ privateUser: user.id }),
        tx.publishedStates[id()]
          .update({ inChannelHash: null, onChannelHash: null })
          .link({ privateUser: user.id }),
      ]);
    }
  }, [
    selfQuery.isLoading,
    selfQuery.data?.privateUsers.length,
    user.id,
    user.email,
  ]);

  return (
    <MemoryRouter>
      <AppShell
        w={800}
        h={600}
        header={
          <Header height={50} p="xs">
            <Title order={4}>Buzz</Title>
          </Header>
        }
        navbar={<AppNavbar user={user} channels={channels} />}
      >
        <Switch>
          <Route exact path="/">
            <Redirect to={`/channels/${channels[channels.length - 1]}`} />
          </Route>
          <Route
            path="/channels/:channel+"
            render={({ match }) => (
              <Channel
                user={user}
                channel={match.params.channel}
                channelToEditorContent={channelToEditorContent}
              />
            )}
          />
        </Switch>
      </AppShell>
    </MemoryRouter>
  );
};
