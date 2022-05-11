import type {
  ApplicationCommandManager,
  ApplicationCommandPermissionData,
  ChatInputApplicationCommandData,
  Client,
  GuildApplicationCommandManager,
  Snowflake,
} from "discord.js";

// import commands
import analyze from "./commandDefs/analyse.js";
import subreddit from "./commandDefs/subreddit.js";
import massKickUnverified from "./commandDefs/mass-kick-unverified.js";

class CommandRegister {
  commands: ChatInputApplicationCommandData[] = [];
  permissions: { [key: string]: ApplicationCommandPermissionData[] } = {};
  constructor() {
    this.commands = [];
  }
  async addCmd(cmdOpts: {
    command: ChatInputApplicationCommandData;
    permissions?: ApplicationCommandPermissionData[];
  }) {
    console.log("adding command: " + cmdOpts.command.name);
    this.commands.push(cmdOpts.command);
    if (cmdOpts.permissions) {
      this.permissions[cmdOpts.command.name] = cmdOpts.permissions;
    }
  }
}

async function registerCommands(bot: Client<true>, serverId?: Snowflake) {
  if (serverId) {
    let guild = await bot.guilds.fetch(serverId);
    var cmdManager: GuildApplicationCommandManager | ApplicationCommandManager = guild.commands;
  } else {
    var cmdManager: GuildApplicationCommandManager | ApplicationCommandManager = bot.application.commands;
  }

  let commandRegister = new CommandRegister();

  commandRegister.addCmd(analyze);
  commandRegister.addCmd(subreddit);
  commandRegister.addCmd(massKickUnverified)

  await cmdManager.set(commandRegister.commands);

  //cmds.forEach((cmd) => {
  //  let perms = commandRegister.permissions[cmd.name];
  //  if (perms) {
  //    cmd.permissions.set({ permissions: perms });
  //  }
  //});
}

export default registerCommands;
