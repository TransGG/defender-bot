import type { Snowflake } from "discord.js";

export interface User {
  id: Snowflake;
  username: string;
  avatar: string;
  discriminator: string;
  public_flags: number;
  flags: number;
  banner: string | null;
  banner_color: string;
  accent_color: number;
  locale: string;
  mfa_enabled: true;
}

export interface Subreddit {
  name: string;
  weight: number;
}
