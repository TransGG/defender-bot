import type { ApplicationCommandPermissionData, ChatInputApplicationCommandData, Client, Snowflake } from "discord.js";

// import commands
import analyze from "./commandDefs/analyse.js";
import subreddit from "./commandDefs/subreddit.js";

class CommandRegister {
  commands: ChatInputApplicationCommandData[] = [];
  permissions: { [key: string]: ApplicationCommandPermissionData[] } = {};
  constructor() {
    this.commands = [];
  }
  async addCmd(cmdOpts: { command: ChatInputApplicationCommandData; permissions?: ApplicationCommandPermissionData[] }) {
    console.log("adding command: " + cmdOpts.command.name);
    this.commands.push(cmdOpts.command);
    if (cmdOpts.permissions) {
      this.permissions[cmdOpts.command.name] = cmdOpts.permissions;
    }
  }
}

async function registerCommands(bot: Client<true>, serverId: Snowflake) {
  let guild = await bot.guilds.fetch(serverId);

  let cmdManager = guild.commands;

  let commandRegister = new CommandRegister();

  commandRegister.addCmd(analyze);
  commandRegister.addCmd(subreddit);

  let cmds = await cmdManager.set(commandRegister.commands);

  cmds.forEach((cmd) => {
    let perms = commandRegister.permissions[cmd.name];
    if (perms) {
      cmd.permissions.set({ permissions: perms });
    }
  });
}

export default registerCommands;
