import type { ApplicationCommandPermissionData, ChatInputApplicationCommandData, ApplicationCommandNumericOptionData } from "discord.js";

const command: ChatInputApplicationCommandData = {
  name: "mass-kick-unverified",
  description: "Kick unverified users who joined before a certain date",
  options: [
    {
      name: "day",
      description: "The day of the date",
      type: "INTEGER",
      required: true,
      min: 1,
      max: 31,
    } as ApplicationCommandNumericOptionData,
    {
      name: "month",
      description: "The month of the date",
      type: "INTEGER",
      required: true,
      min: 1,
      max: 12,
    } as ApplicationCommandNumericOptionData,
    {
      name: "year",
      description: "The year of the date",
      type: "INTEGER",
      required: true,
      min: 1970,
      max: 9999,
    } as ApplicationCommandNumericOptionData,
    {
      name: "exclude_slowlane",
      description: "Exclude slowlane members from being kicked; defaults to false",
      type: "BOOLEAN",
      required: false,
    },
    {
      name: "exclude_fastlane",
      description: "Exclude fastlane members from being kicked; defaults to false",
      type: "BOOLEAN",
      required: false,
    },
    {
      name: "exclude_unroled",
      description: "Exclude members who are neither slowlane nor fastlane from being kicked; defaults to false",
      type: "BOOLEAN",
      required: false,
    },
  ],
  defaultPermission: false,
};

const permissions: ApplicationCommandPermissionData[] = [
  { id: "636521703778025483", type: "ROLE", permission: true }, // Server Staff in Minion3665's 'The Nothing Server'
  { id: "960315132993499257", type: "ROLE", permission: true }, // Teamlead Verifier in TransPlace
];

const exporter = { command: command, permissions: permissions };

export default exporter;
