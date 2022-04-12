import type { CommandInteraction } from "discord.js";
import type { Collection } from "mongodb";
import type { Subreddit } from "../../../typings/mongo.js";

export default async function subreddit(cmd: CommandInteraction, subreddits: Collection<Subreddit>) {
  let deffered = cmd.deferReply({ ephemeral: true });

  let name = cmd.options.getString("subreddit", true);
  let weight = cmd.options.getNumber("weight", true);

  await subreddits.updateOne({ name: name }, { $set: { name: name, weight: weight } }, { upsert: true });
  await deffered;

  console.log(`set weight of ${name} to ${weight}`);

  cmd.followUp({ content: `Set weight of /r/${name} to ${weight}` });
}
