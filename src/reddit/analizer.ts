import { ipcManager } from "../utils/ipc.js";
import * as snoowrap from 'snoowrap';

// reddit threat rating thread

const reddit = new snoowrap({
  userAgent: "transplace-defender",
  clientId: "2g647so_GNHUDmrIJAZ50Q",
  clientSecret: "H25of_XJwsLlmi5VAPtaQRLmbRVuHw",
  refreshToken: "",
});

const subs = {
  traaaaaaannnnnnnnnns: 10,
  conservative: -1000,
};

let ipc = new ipcManager("threat-rating");

ipc.addListener(
  "analyze",
  async ({ type, payload: username }) => {
    reddit.getUser(username)
    return undefined;
  }
)
