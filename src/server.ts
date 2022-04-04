import validateConfig from "./utils/validateConfig";
let settings = validateConfig();

import startFnFactory from "./utils/threadStartFactory.js";

if (settings.devMode) {
  var env = "src";
  var ext = "ts";
  console.log("Starting trans defender in dev mode");
} else {
  var env = "build";
  var ext = "js";
  console.log("Starting trans defender");
}

async function startThreads() {
  let startDiscordBot = startFnFactory({
    name: "Discord bot",
    path: `./${env}/discord/bot.${ext}`,
    maxCrashesPerHour: 5,
  });
  let startThreatAnalyzer = startFnFactory({
    name: "Reddit Threat Analizer",
    path: `./${env}/reddit/analyzer.${ext}`,
    maxCrashesPerHour: 5,
  });
  let startOathServer = startFnFactory({
    name: "Oath server",
    path: `./${env}/oauth/oauthServer.${ext}`,
    maxCrashesPerHour: 10,
  });

  startDiscordBot();
  startThreatAnalyzer();
  startOathServer();
}

startThreads();
