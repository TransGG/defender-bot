import dotenv from "dotenv";
dotenv.config({ path: ".env" });

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
  };
  oath: {
    url: string;
    port: string;
  };
  guildId: string;
  devMode?: boolean;
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

  // tokens
  assertEnvVarExists("DISCORD_BOT_TOKEN");
  assertEnvVarExists("APP_ID");
  assertEnvVarExists("APP_SECRET");
  assertEnvVarExists("MONGODB_URL");
  assertEnvVarExists("REDDIT_ID");
  assertEnvVarExists("REDDIT_SECRET");
  assertEnvVarExists("REDDIT_USERNAME");
  assertEnvVarExists("REDDIT_PASS");

  // oath
  assertEnvVarExists("OAUTH_URL");
  assertEnvVarExists("OAUTH_PORT");

  // server
  assertEnvVarExists("GUILD_ID");

  let env: any = process.env;

  let config: Config = {
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
    },
    oath: {
      url: env.OAUTH_URL!,
      port: env.OAUTH_PORT!,
    },
    guildId: env.GUILD_ID!,
    devMode: Boolean(env.DEV_MODE),
  };

  return config;
}

export { validateConfig, Config };
export default validateConfig;
