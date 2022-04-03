import dotenv from "dotenv";

type Config = {
  tokens: {
    discord: string;
    discordAppId: string;
    discordAppSecret: string;
    //mongoDB: string;
    //redis: string;
  };
  oath: {
    url: string;
    port: string;
  };
  devMode: boolean;
};

function assertEnvVarExists(setting: string) {
  try {
    if (!process.env[setting]) throw setting;
  } catch (error) {
    console.error("Missing required enviorment variable: " + error);
    process.exit(1);
  }
}

function validateConfig() {
  dotenv.config({ path: "./config/tokens.env" });
  dotenv.config({ path: "./config/config.env" });

  assertEnvVarExists("DISCORD_BOT_TOKEN");
  assertEnvVarExists("APP_ID");
  assertEnvVarExists("APP_SECRET");
  assertEnvVarExists("MONGODB_URL");
  assertEnvVarExists("REDIS_URL");
  assertEnvVarExists("OATH_URL");
  assertEnvVarExists("OATH_PORT");

  let env: any = process.env;

  const config: Config = {
    tokens: {
      discord: env.DISCORD_BOT_TOKEN!,
      discordAppId: env.APP_ID!,
      discordAppSecret: env.APP_SECRET!,
      //mongoDB: process.env.MONGODB_URL!,
      //redis: process.env.REDIS_URL!,
    },
    oath: {
      url: env.OATH_URL!,
      port: env.OATH_PORT!,
    },
    devMode: Boolean(env.DEV_MODE),
  };
  return config;
}

export { validateConfig, Config };
export default validateConfig;
