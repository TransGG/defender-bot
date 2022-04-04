import type { ApplicationCommandPermissionData, ChatInputApplicationCommandData, Client, Snowflake } from "discord.js";

// import commands
import analyze from "./commandDefs/analyse.js";

async function registerCommands(bot: Client<true>, serverId: Snowflake) {
  let guild = await bot.guilds.fetch(serverId);

  let cmdManager = guild.commands;

  let commands: ChatInputApplicationCommandData[] = [];

  commands.push(analyze.command);

  let cmds = await cmdManager.set(commands);

  let permissions: { [key: string]: ApplicationCommandPermissionData[] } = {};

  permissions[analyze.command.name] = analyze.permissions;

  cmds.forEach((cmd) => {
    let perms = permissions[cmd.name];
    if (perms) {
      cmd.permissions.set({ permissions: perms });
    }
  });
}

export default registerCommands;
