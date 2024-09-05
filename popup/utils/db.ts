import { init_experimental } from "@instantdb/react";

import graph from "~instant.schema";

const db = init_experimental({
  appId: "d763dd10-2e46-4e73-943c-0158e8f343bf",
  schema: graph,
});

export default db;
