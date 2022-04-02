import express from "express";
import axios from "axios";
import type { Config } from "../utils/validateConfig";

import validateConfig from "../utils/validateConfig.js";

let config = validateConfig();

const app = express();

app.get("/", async ({ query }, response) => {
  const { code } = query;

  if (code) {
    try {
      let res = await axios.post("https://discord.com/api/oauth2/token", {
        client_id: config.appID,
        client_secret: config.tokens.discordApp,
        code: code,
        grant_type: "authorization_code",
        redirect_uri: `http://localhost:${config.oath.port}`,
        scope: "identify",
      });

      let oauthData = res.data;

      console.log(oauthData);
    } catch (error) {
      // NOTE: An unauthorized token will not throw an error;
      // it will return a 401 Unauthorized response in the try block above
      console.error(error);
    }
  }

  return response.sendFile("index.html", {
    root: ".",
  });
});
app.listen(config.oath.port, () => console.log(`App listening at http://localhost:${config.oath.port}`));
