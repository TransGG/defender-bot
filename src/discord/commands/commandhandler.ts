import type { CommandInteraction } from "discord.js";
import type { Collection } from "mongodb";
import type { Subreddit } from "../../typings/mongo.js";
import type { ipcManager } from "../../utils/ipc.js";
import analyze from "./commandHandlers/analyze.js";
import subreddit from "./commandHandlers/subreddit.js";
import massKickUnverified from "./commandHandlers/mass-kick-unverified.js";

interface Wrapper {
  awaitingAnalysis: { [key: string]: CommandInteraction[] };
}

let wrapper: Wrapper = {
  awaitingAnalysis: {},
};

async function handleCommand(
  this: Wrapper,
  cmd: CommandInteraction,
  ipc: ipcManager,
  subreddits: Collection<Subreddit>
) {
  switch (cmd.commandName) {
    case "ping":
      {
        cmd.reply({ content: "pong", ephemeral: true });
      }
      break;
    case "analyze": {
      analyze(cmd, ipc);
      break;
    }
    case "subreddit": {
      subreddit(cmd, subreddits);
      break;
    }
    case "mass-kick-unverified": {
      massKickUnverified(cmd);
      break;
    }
    default: {
      cmd.reply({ content: "Unknown Command", ephemeral: true });
    }
  }
}

export default handleCommand.bind(wrapper);
