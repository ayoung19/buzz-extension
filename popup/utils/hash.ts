import { createHash } from "crypto";

export const userIdAndChannelToUserIdAndChannelHash = (
  userId: string,
  channel: string,
) =>
  createHash("sha256")
    .update(userId + channel)
    .digest("hex");

export const channelToChannelHash = (channel: string) =>
  createHash("sha256").update(channel).digest("hex");
