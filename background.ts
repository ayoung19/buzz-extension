import { init_experimental } from "@instantdb/core";

import { Storage } from "@plasmohq/storage";

import graph from "~instant.schema";

const db = init_experimental({
  appId: "d763dd10-2e46-4e73-943c-0158e8f343bf",
  schema: graph,
});

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
          db.tx.publishedStates[userPublishedStateId]!.update({
            inChannelHash: undefined,
          }),
        );
      }
    });
  }
});

export {};
