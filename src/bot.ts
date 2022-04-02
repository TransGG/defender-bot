import validateConfig from "./utils/validateConfig";
let settings = validateConfig();

import child from "child_process";

if (settings.devMode) {
  var env = "src";
  console.log("Starting trans defender in dev mode");
} else {
  var env = "build";
  console.log("Starting trans defender");
}

let shard = child.fork(`./${env}/discord/shard`);

shard.on("exit", (code) => {
  console.log(`discord shard exit with code: ${code}`);
  if (code && code != 0) {
    process.exit(code);
  }
});
