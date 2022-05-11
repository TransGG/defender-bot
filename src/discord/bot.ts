import { Intents, Client } from "discord.js";
import { MongoClient } from "mongodb";
import type { Subreddit } from "../typings/mongo.js";

import { ipcManager } from "../utils/ipc.js";
import validateConfig from "../utils/validateConfig.js";
import handleCommand from "./commands/commandhandler.js";
import registerCommands from "./commands/registerCommands.js";

(async () => {
  let config = validateConfig();

  let mongoClient = new MongoClient(config.tokens.mongoDB);
  let db = mongoClient.db("trans-defender");
  let subreddits = db.collection<Subreddit>("subreddits");

  await mongoClient.connect();

  let ipc = new ipcManager("discord");

  let bot = new Client({
    intents: [
      Intents.FLAGS.GUILD_MEMBERS,
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

    await registerCommands(bot, config.guildId);
    console.log(`Registered Commands to guild: ${config.guildId}`);
  });

  bot.on("interactionCreate", async (interaction) => {
    if (interaction.isCommand()) {
      handleCommand(interaction, ipc, subreddits);
    }
  });

  bot.login(config.tokens.discord.token);
})();
