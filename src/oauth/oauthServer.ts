import express from "express";
import url from "url";
import fetch from "node-fetch";
import { CloudflareIP } from "@cylution/is-cloudflare-ip";

let cloudflareip = new CloudflareIP();
await cloudflareip.update(3600000);

import { validateConfig, Config } from "../utils/validateConfig.js";
import { MongoClient } from "mongodb";
import type { connection } from "../typings/connection.js";
//import forbidden from "./forbidden/forbidden.js";

let config: Config = validateConfig();

console.log("redr uri: " + config.oath.url);

let ipScores: { [key: string]: number } = {};

interface oauthData {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
  scope: string;
}

var mongoClient = new MongoClient(config.tokens.mongoDB);

let mongodb = mongoClient.db("trans-defender");
let users = mongodb.collection("users");

users;

const endpoint = "https://discord.com/api/v9/";

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

const app = express();

// 403 request not proxied via cloudflare
// uncomment this and line forbidden import
/*
app.get("/", async (req, response, next) => {
  let rawip = req.ip;
  if (!cloudflareip.validate(rawip)) {
    response.status(403).send(forbidden);
    return;
  }

  next();
});
*/

app.get("/oath2", async (req, response) => {
  try {
    var ip = req.headers["cf-connecting-ip"] as string;

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
      let oathResult = await fetch(`${endpoint}oauth2/token`, {
        method: "POST",
        body: new url.URLSearchParams({
          client_id: config.tokens.discord.appId,
          client_secret: config.tokens.discord.appSecret,
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
      const userResult = await fetch(`${endpoint}users/@me`, {
        method: "GET",
        headers: {
          authorization: `${oauthData.token_type} ${oauthData.access_token}`,
        },
      });

      if (!userResult.ok) {
        ipScores[ip] += 4;
        response.statusCode = 403;
        response.send("Please try again in a few minutes");
        return;
      }

      let user = await userResult.json();

      console.log(`got user ${JSON.stringify(user, null, 2)}`);

      const connectionsResult = await fetch(`${endpoint}users/@me/connections`, {
        method: "GET",
        headers: {
          authorization: `${oauthData.token_type} ${oauthData.access_token}`,
        },
      });

      let connections: connection[] = await connectionsResult.json();

      if (!Array.isArray(connections)) {
        ipScores[ip] += 4;
        response.statusCode = 403;
        response.send("Please try again in a few minutes.");
      }

      let reddit: connection | false = (() => {
        for (let i = 0; i < connections.length; i++) {
          if (connections[i]!.type == "reddit") {
            return connections[i]!;
          }
        }
        return false;
      })();

      if (!reddit) {
        ipScores[ip] += 4;
        response.statusCode = 401;
        response.send("You must connect your discord to your reddit.");
      }

      console.log(`reddit: ${JSON.stringify(reddit)}`);

      //users.insertOne(user);
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
