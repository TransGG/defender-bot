import type { CommandInteraction } from "discord.js";
import type { Collection } from "mongodb";
import type { Subreddit } from "../../typings/mongo.js";
import type { ipcManager, message } from "../../utils/ipc.js";

interface Wrapper {
  awaitingAnalysis: { [key: string]: CommandInteraction[] };
}

let wrapper: Wrapper = {
  awaitingAnalysis: {},
};

interface analysis {
  success: boolean;
  username: string;
  score: number;
  analysedOn: string;
}
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
      let deffered = cmd.deferReply({ ephemeral: true });

      let username = cmd.options.getString("user", true);

      console.log(`analysing user: ${username}`);

      let msg: message = { type: "analysis-request", payload: username };
      let analysis: analysis | undefined = (await ipc.query("threat-rating", msg, 10000))?.payload;

      console.log("got analysis");

      if (!analysis) {
        await deffered;
        cmd.followUp({ content: `Failed to analyze ${username}` });
        return;
      }

      if (!analysis.success) {
        await deffered;
        cmd.followUp({ content: `Failed to analyze ${username}` });
        return;
      }

      let embed = {
        type: "rich",
        title: `Analysis Results:`,
        description: "",
        color: 0xff4df9,
        fields: [
          {
            name: `Username:`,
            value: `${username}`,
            inline: true,
          },
          {
            name: `Score`,
            value: `${analysis.score}`,
            inline: true,
          },
        ],
        footer: {
          text: `Analysied on: ${analysis.analysedOn}`,
        },
      };

      cmd.followUp({ embeds: [embed] });
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
