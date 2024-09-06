import { init_experimental } from "@instantdb/core";

import { Storage } from "@plasmohq/storage";

import graph from "~instant.schema";
import { channelToChannelHash } from "~popup/utils/hash";
import { getPathnameSegments } from "~popup/utils/pathname";

const db = init_experimental({
  appId: "d763dd10-2e46-4e73-943c-0158e8f343bf",
  schema: graph,
});

const storage = new Storage({
  area: "local",
});

chrome.runtime.onConnect.addListener((port) => {
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

chrome.tabs.onActivated.addListener(({ tabId }) => {
  chrome.tabs.get(tabId, async (tab) => {
    if (tab.url) {
      const url = new URL(tab.url);

      const userRefreshToken = await storage.get("userRefreshToken");
      const userPublishedStateId = await storage.get("userPublishedStateId");

      if (userRefreshToken && userPublishedStateId) {
        await db.auth.signInWithToken(userRefreshToken);
        console.log(url.hostname + getPathnameSegments(url.pathname).join(""));
        await db.transact(
          db.tx.publishedStates[userPublishedStateId]!.update({
            onChannelHash: channelToChannelHash(
              url.hostname + getPathnameSegments(url.pathname).join(""),
            ),
          }),
        );
      }
    }
  });
});

export {};
