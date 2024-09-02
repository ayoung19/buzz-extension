import { i } from "@instantdb/core";

const graph = i.graph(
  "d763dd10-2e46-4e73-943c-0158e8f343bf",
  {
    privateUsers: i.entity({
      email: i.string().unique(),
    }),
    publicUsers: i.entity({
      displayName: i.string().unique(),
    }),
    publishedStates: i.entity({
      onChannelHash: i.string().optional().indexed(),
      inChannelHash: i.string().optional().indexed(),
    }),
    messages: i.entity({
      channelHash: i.string().indexed(),
      content: i.string(),
    }),
  },
  {
    privateUserPublicUser: {
      forward: {
        on: "privateUsers",
        has: "one",
        label: "publicUser",
      },
      reverse: {
        on: "publicUsers",
        has: "one",
        label: "privateUser",
      },
    },
    privateUserPublishedState: {
      forward: {
        on: "privateUsers",
        has: "one",
        label: "publishedState",
      },
      reverse: {
        on: "publishedStates",
        has: "one",
        label: "privateUser",
      },
    },
    userMessages: {
      forward: {
        on: "publicUsers",
        has: "many",
        label: "messages",
      },
      reverse: {
        on: "messages",
        has: "one",
        label: "publicUser",
      },
    },
  },
);

export default graph;
