import { Intents, Client } from "discord.js";
//import Redis from "redis";

import { ipcManager } from "../utils/ipc.js";
import validateConfig from "../utils/validateConfig";
let settings = validateConfig();

let ipc = new ipcManager("discord");

let bot = new Client({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_WEBHOOKS,
    Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
    Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
    Intents.FLAGS.GUILD_VOICE_STATES,
    Intents.FLAGS.DIRECT_MESSAGES,
    Intents.FLAGS.DIRECT_MESSAGE_REACTIONS,
  ],
});

//let cache = Redis.createClient({ url: settings.tokens.redis });

bot.on("ready", async () => {
  console.log("Connected to discord");

  let debugServer;
  if (settings.devMode) {
    debugServer = "743250557187129418";
  }
});

bot.on("interactionCreate", async (interaction) => {});

bot.login(settings.tokens.discord.token);
