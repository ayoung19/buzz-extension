import { IndexedDBStorage, init, tx } from "@instantdb/core";

import { Storage } from "@plasmohq/storage";

const db = init<{
  users: {
    email: string;
    activeChannelHash?: string;
  };
  messages: {
    channelHash: string;
    value: string;
  };
}>({ appId: "d763dd10-2e46-4e73-943c-0158e8f343bf" });

const storage = new Storage({
  area: "local",
});

// db.subscribeAuth((auth) => console.log(auth));

chrome.runtime.onConnect.addListener(function (port) {
  if (port.name === "popup") {
    port.onDisconnect.addListener(async () => {
      const userId = await storage.get("userId");
      const userRefreshToken = await storage.get("userRefreshToken");

      if (userId && userRefreshToken) {
        // await db.auth.signInWithToken(userRefreshToken);
        // await db.transact(
        //   tx.users[userId].update({ channelHashName: "fdssdf" }),
        // );
      }
    });
  }
});

export {};
