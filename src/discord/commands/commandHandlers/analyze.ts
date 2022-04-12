import type { CommandInteraction } from "discord.js";
import type { message } from "../../../utils/ipc.js";
import type ipcManager from "../../../utils/ipc.js";

interface analysis {
  success: boolean;
  username: string;
  score: number;
  analysedOn: string;
}

export default async function analyze(cmd: CommandInteraction, ipc: ipcManager) {
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
      text: `Analyzed on: ${analysis.analysedOn}`,
    },
  };

  cmd.followUp({ embeds: [embed] });
}
