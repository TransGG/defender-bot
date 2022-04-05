import type { ApplicationCommandPermissionData, ChatInputApplicationCommandData } from "discord.js";

const command: ChatInputApplicationCommandData = {
  name: "subreddit",
  description: "modifies a subreddits weight score",
  options: [
    { name: "subreddit", description: "subreddit, not including the r/", type: "STRING", required: true },
    { name: "weight", description: "new weight", type: "NUMBER", required: true },
  ],
  defaultPermission: false,
};

const permissions: ApplicationCommandPermissionData[] = [
  { id: "959391087858970636", type: "ROLE", permission: true },
  { id: "960477357599244308", type: "ROLE", permission: true },
];

const exporter = { command: command, permissions: permissions };

export default exporter;
