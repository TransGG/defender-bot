import dotenv from "dotenv";

type Config = {
  tokens: {
    discord: {
      token: string;
      appId: string;
      appSecret: string;
    };
    mongoDB: string;
    reddit: {
      username: string;
      pass: string;
      id: string;
      secret: string;
    };
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

  assertEnvVarExists("REDDIT_ID");
  assertEnvVarExists("REDDIT_SECRET");
  assertEnvVarExists("REDDIT_USERNAME");
  assertEnvVarExists("REDDIT_PASS");

  let env: any = process.env;

  const config: Config = {
    tokens: {
      discord: {
        token: env.DISCORD_BOT_TOKEN!,
        appId: env.APP_ID!,
        appSecret: env.APP_SECRET!,
      },
      mongoDB: env.MONGODB_URL!,
      reddit: {
        id: env.REDDIT_ID,
        username: env.REDDIT_USERNAME,
        secret: env.REDDIT_SECRET,
        pass: env.REDDIT_PASS,
      },
      //redis: env.REDIS_URL!,
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
