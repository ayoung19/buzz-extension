import { createHash } from "crypto";

export const channelToChannelHash = (channel: string) =>
  createHash("sha256").update(channel).digest("hex");
