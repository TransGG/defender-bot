import express from "express";
import DiscordOath2 from "discord-oauth2";

import { validateConfig, Config } from "../utils/validateConfig.js";

let config: Config = validateConfig();

const app = express();
const oauth = new DiscordOath2({
  clientId: config.tokens.discordAppId,
  clientSecret: config.tokens.discordAppSecret,
  redirectUri: config.oath.url,
});

let ipScores: { [key: string]: number } = {};

const ipScoreTimer = 10; // in minutes
setInterval(() => {
  let ips = Object.keys(ipScores);
  for (let i = 0; i < ips.length; i++) {
    ipScores[ips[i]!]--;
    if (ipScores[ips[i]!]! <= 0) {
      delete ipScores[ips[i]!];
    }
  }
}, ipScoreTimer * 60 * 1000);

const scopes = "";

app.get("/", async (req, response) => {
  let ip = req.ip;
  if (ipScores[ip]) {
    if (ipScores[ip]! > 10) {
      // drop connection
      response.statusCode = 429;
      response.send("Request ratelimited.");
      return;
    }
  } else {
    ipScores[ip] = 0;
  }

  ipScores[ip]++;

  let code = req.query["code"];

  if (!code || typeof code != "string") {
    ipScores[ip] += 3;
    return;
  }

  if (code) {
    try {
      let dat = await oauth.tokenRequest({
        code: code,
        scope: scopes,
        grantType: "authorization_code",
      });

      console.log(oauthData);
    } catch (error) {
      console.error(error);
    }
  }

  return response.sendFile("index.html", {
    root: ".",
  });
});
app.listen(config.oath.port, () => console.log(`Oath2 server listening on port ${config.oath.port}.`));
