import { i } from "@instantdb/core";

const graph = i.graph(
  "d763dd10-2e46-4e73-943c-0158e8f343bf",
  {
    users: i.entity({
      email: i.string().unique(),
    }),
    views: i.entity({
      channelHash: i.string().indexed(),
    }),
    messages: i.entity({
      channelHash: i.string().indexed(),
      value: i.string(),
    }),
  },
  {
    userViews: {
      forward: {
        on: "users",
        has: "many",
        label: "views",
      },
      reverse: {
        on: "views",
        has: "one",
        label: "user",
      },
    },
    userMessages: {
      forward: {
        on: "users",
        has: "many",
        label: "messages",
      },
      reverse: {
        on: "messages",
        has: "one",
        label: "user",
      },
    },
  },
);

export default graph;
