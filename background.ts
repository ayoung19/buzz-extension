import { init, tx } from "@instantdb/core";

import { Storage } from "@plasmohq/storage";

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
  bookmarkedChannels: {
    channel: string;
  };
  messages: {
    channelHash: string;
    content: string;
  };
}>({ appId: "d763dd10-2e46-4e73-943c-0158e8f343bf" });

const storage = new Storage({
  area: "local",
});

chrome.runtime.onConnect.addListener(function (port) {
  if (port.name === "popup") {
    port.onDisconnect.addListener(async () => {
      const userRefreshToken = await storage.get("userRefreshToken");
      const userPublishedStateId = await storage.get("userPublishedStateId");

      if (userRefreshToken && userPublishedStateId) {
        await db.auth.signInWithToken(userRefreshToken);
        await db.transact(
          tx.publishedStates[userPublishedStateId].update({
            inChannelHash: null,
          }),
        );
      }
    });
  }
});

export {};
