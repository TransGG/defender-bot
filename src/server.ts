import validateConfig from "./utils/validateConfig";
let settings = validateConfig();

import child from "child_process";
import startFnFactory from "./utils/threadStartFactory.js";

if (settings.devMode) {
  var env = "src";
  console.log("Starting trans defender in dev mode");
} else {
  var env = "build";
  console.log("Starting trans defender");
}

async function startThreads() {
  let startDiscordBot = startFnFactory({ name: "Discord bot", path: `./${env}/discord/bot`, maxCrashesPerHour: 5 });
  let startThreatAnalizer = startFnFactory({
    name: "Reddit Threat Analizer",
    path: `./${env}/reddit/analizer`,
    maxCrashesPerHour: 5,
  });
  let startOathServer = startFnFactory({ name: "Oath server", path: `./${env}/oath/oathServer`, maxCrashesPerHour: 10 });

  startDiscordBot();
  startThreatAnalizer();
  startOathServer();
}
