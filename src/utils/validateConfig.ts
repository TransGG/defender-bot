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
  let adminIds: string[];

  if (process.env.ADMIN_IDS) {
    adminIds = JSON.parse(process.env.ADMIN_IDS);
  } else {
    adminIds = ["229331045726552066", "861353197952172102"];
  }

  const config: Config = {
    tokens: {
      discord: process.env.DISCORD_BOT_TOKEN!,
      discordAppId: process.env.APP_ID!,
      discordAppSecret: process.env.APP_SECRET!,
      //mongoDB: process.env.MONGODB_URL!,
      //redis: process.env.REDIS_URL!,
    },
    oath: {
      url: process.env.OATH_URL!,
      port: process.env.OATH_PORT!,
    },
    devMode: Boolean(process.env.DEV_MODE),
  };
  return config;
}

export { validateConfig, Config };
export default validateConfig;
