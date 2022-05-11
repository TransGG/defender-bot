import type { CommandInteraction } from "discord.js";

// We don't need to check for a 'verified' role, because we assume that any user who has *any* non-(slowlane or fastlane) role is verified.

const slowlane_roles = [
  "960198595041198110", // TransPlace
  "973862675060764742", // The Nothing Server
];

const fastlane_roles = [
  "960198530218217472", // TransPlace
  "973862645830672414", // The Nothing Server
];

export default async function massKickUnverified(cmd: CommandInteraction) {
  let deffered = cmd.deferReply({ ephemeral: true });

  await deffered;

  const day = cmd.options.getInteger("day", true);
  const month = cmd.options.getInteger("month", true);
  const year = cmd.options.getInteger("year", true);

  const exclude_slowlane = cmd.options.getBoolean("exclude_slowlane", false) ?? false;
  const exclude_fastlane = cmd.options.getBoolean("exclude_fastlane", false) ?? false;
  const exclude_unroled = cmd.options.getBoolean("exclude_unroled", false) ?? false;

  const date = new Date(year, month - 1, day);

  if (cmd.guild === null) {
    return cmd.followUp({ content: "This command can only be used in a server." });
  } else if (date > new Date()) {
    return cmd.followUp({ content: "Date must not be in the future" });
  } else if (date < cmd.guild.createdAt) {
    return cmd.followUp({ content: "Date must be after the server was created" });
  }

  await cmd.guild.members.fetch();

  const membersToKick = cmd.guild.members.cache.filter((member) => {
    let memberRoles = member.roles.cache.map((role) => role.id).filter((role) => role != member.guild.id); // Get the IDs of the roles, and exclude the @everyone role

    if (exclude_unroled && memberRoles.length === 0) return false;

    if (!exclude_slowlane) {
      memberRoles = memberRoles.filter((role) => !slowlane_roles.includes(role));
    }
    if (!exclude_fastlane) {
      memberRoles = memberRoles.filter((role) => !fastlane_roles.includes(role));
    }

    return memberRoles.length === 0 && member.joinedAt !== null && member.joinedAt < date;
  });

  for (const member of membersToKick.values()) {
    await member.kick(`Mass unverified kick by ${cmd.user.tag}`);
  }

  return cmd.followUp({ content: `Kicked ${membersToKick.size} member${membersToKick.size !== 1 ? "s" : ""}` });
}
