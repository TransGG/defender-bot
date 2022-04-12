import type { ApplicationCommandPermissionData, ChatInputApplicationCommandData } from "discord.js";

const command: ChatInputApplicationCommandData = {
  name: "modal",
  description: "Creates a modal",
  options: [
    { name: "user", description: "reddit account username to analyze", type: "STRING", required: true },
    { name: "user", description: "reddit account username to analyze", type: "STRING", required: true },
  ],
  defaultPermission: false,
};

const permissions: ApplicationCommandPermissionData[] = [
  // dev server dev
  { id: "959391087858970636", type: "ROLE", permission: true },
  // head staff
  { id: "960681891806195753", type: "ROLE", permission: true },
];

const exporter = { command: command, permissions: permissions };

export default exporter;
