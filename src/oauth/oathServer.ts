import express from "express";
import url from "url";
import fetch from "node-fetch";

import { validateConfig, Config } from "../utils/validateConfig.js";

let config: Config = validateConfig();

const app = express();

console.log("redr uri: " + config.oath.url);

let ipScores: { [key: string]: number } = {};

interface oauthData {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
  scope: string;
}

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

app.get("/oath2", async (req, response) => {
  try {
    let ip = req.ip;
    if (ipScores[ip]) {
      if (ipScores[ip]! > 6) {
        // drop connection
        response.statusCode = 429;
        response.send("Request ratelimited.");
        return;
      }
    } else {
      ipScores[ip] = 0;
    }

    ipScores[ip]++;

    console.log("got oath request from: " + ip + " score " + ipScores[ip]);

    let code = req.query["code"];

    if (typeof code != "string") {
      ipScores[ip] += 4;
      return;
    }

    console.log(`got oath2 code: ${code}`);

    try {
      let oathResult = await fetch("https://discord.com/api/v9/oauth2/token", {
        method: "POST",
        body: new url.URLSearchParams({
          client_id: config.tokens.discordAppId,
          client_secret: config.tokens.discordAppSecret,
          code: code,
          grant_type: "authorization_code",
          redirect_uri: config.oath.url,
          scope: "identify connections",
        }),
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });

      if (oathResult.status != 200) {
        ipScores[ip] += 4;
        response.statusCode = 403;
        response.send("Please try again in a few minutes");
        return;
      }

      var oauthData: oauthData = await oathResult.json();

      console.log(`got user token ${JSON.stringify(oauthData)}`);
    } catch (error) {
      console.error("oath2 error while requesting authtoken: " + error);
      ipScores[ip] += 4;
      response.statusCode = 403;
      response.send("Please try again in a few minutes");
      return;
    }

    try {
      const userResult = await fetch("https://discord.com/api/users/@me", {
        headers: {
          authorization: `${oauthData.token_type} ${oauthData.access_token}`,
        },
      });

      console.log(`got user ${JSON.stringify(await userResult.json(), null, 2)}`);
    } catch (error) {
      console.error("oath2 error while requesting user connections: " + error);
      ipScores[ip] += 3;

      response.statusCode = 403;
      response.send("Please try again in a few minutes");
      return;
    }

    response.statusCode = 200;

    response.send("You may now close this window.");
  } catch (error) {
    console.error(`oath2 cought error: \n${error}`);
  }
});
app.listen(config.oath.port, () => console.log(`Oath2 server listening on port ${config.oath.port}.`));
