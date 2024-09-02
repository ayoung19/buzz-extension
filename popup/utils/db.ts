import { init } from "@instantdb/react";

const db = init<{
  privateUsers: {
    email: string;
  };
  publicUsers: {
    displayName: string;
  };
  publishedStates: {
    onChannelHash?: string;
    inChannelHash?: string;
  };
  messages: {
    channelHash: string;
    content: string;
  };
}>({ appId: "d763dd10-2e46-4e73-943c-0158e8f343bf" });

export default db;