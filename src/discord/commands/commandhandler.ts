import type { CommandInteraction } from "discord.js";
import type { Collection } from "mongodb";
import type { Subreddit } from "../../typings/mongo.js";
import type { ipcManager } from "../../utils/ipc.js";
import analyze from "./commandHandlers/analyze.js";

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
      let deffered = cmd.deferReply({ ephemeral: true });

      let name = cmd.options.getString("subreddit", true);
      let weight = cmd.options.getNumber("weight", true);

      await subreddits.updateOne({ name: name }, { $set: { name: name, weight: weight } }, { upsert: true });
      await deffered;

      console.log(`set weight of ${name} to ${weight}`);

      cmd.followUp({ content: `Set weight of /r/${name} to ${weight}` });

      break;
    }
    default: {
      cmd.reply({ content: "Unknown Command", ephemeral: true });
    }
  }
}

export default handleCommand.bind(wrapper);
