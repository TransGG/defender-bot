import snoowrap from "snoowrap";

//import type { message } from "../utils/ipc.js";
import { ipcManager, message } from "../utils/ipc.js";
import getConfig from "../utils/validateConfig.js";

// reddit threat rating thread

const config = getConfig();

const reddit = new snoowrap({
  userAgent: "transplace-defender:v0.1.0",
  clientId: config.tokens.reddit.id,
  clientSecret: config.tokens.reddit.secret,
  username: config.tokens.reddit.username,
  password: config.tokens.reddit.pass,
});
let ipc = new ipcManager("threat-rating");

let subs = {
  traaaaaaannnnnnnnnns: 10,
  transgendercirclejerk: 10,
  lgbt: 5,
  actuallesbians: 5,
  lesbianactually: 5,
  gendercynical: 5,
  "4tran": -100,
  actuallylesbian: -500,
  goodanimemes: -500,
  mtf: 10,
  ftm: 10,
  transgenderuk: 10,
  arethecisok: 10,
  transuk: 5,
  conservative: -1000,
  trueoffmychest: -500,
  "196": 1,
} as { [key: string]: number };

const startDate = new Date(2022, 3, 29, 0, 0, 0, 0);

const maximumUpvotesToTakeIntoAccount = 20;
const multiplyBasedOnScore = (value: number, score: number) => {
  if (score > maximumUpvotesToTakeIntoAccount) {
    return value;
  } else if (score < -maximumUpvotesToTakeIntoAccount) {
    return -value * 0.01;
  } else if (score > 0) {
    return (value * 0.01 * score) / maximumUpvotesToTakeIntoAccount;
  } else {
    return (value * score) / maximumUpvotesToTakeIntoAccount;
  }
  // We need to take karma into account somewhat; if someone has a lot of karma on a sub they probably are quite involved and following
  // the thoughts of the sub's community. Similarly, if someone gets a number of downvotes on a sub, they probably shouldn't be given
  // much score at all for it.

  // I've weighted negative karma in a sub much less than positive karma because I do not want someone shitposting on r/conservative to
  // be able to achieve a score of 1000, funny as that would be.
};

const maximumAgeToTakeIntoAccount = 1;
const multiplyBasedOnAge = (value: number, age: number) => {
  console.log(
    `An account age of ${age} years gives a multiplier of ${
      1 / (1 + Math.exp(-Math.min(age, maximumAgeToTakeIntoAccount) / (maximumAgeToTakeIntoAccount / 5)))
    }.`
  );
  return value * (1 / (1 + Math.exp(-Math.min(age, maximumAgeToTakeIntoAccount) / (maximumAgeToTakeIntoAccount / 5))));
};

interface AccountData {
  subs: { [key: string]: number };
  age: number;
  karma: number;
}

const analyzeAccount = async ({ type: _, payload: username }: message) => {
  const redditAccountData: AccountData = await new Promise((resolve, reject) => {
    reddit
      .getUser(username)
      .fetch()
      .then(async (user) => {
        const subs: { [key: string]: number } = {};

        const submissions = await user.getSubmissions({ limit: 100, after: startDate, sort: "new" });
        const comments = await user.getComments({ limit: 100, after: startDate, sort: "new" });

        for (const submission of submissions) {
          subs[submission.subreddit.display_name.toLowerCase()] =
            (subs[submission.subreddit.display_name.toLowerCase()] || 0) + submission.score;
        }

        for (const comment of comments) {
          subs[comment.subreddit.display_name.toLowerCase()] =
            (subs[comment.subreddit.display_name.toLowerCase()] || 0) + comment.score;
        }

        const age = (Date.now() - user.created_utc * 1000) / (1000 * 60 * 60 * 24 * 365);
        const karma = user.link_karma + user.comment_karma;
        resolve({ subs, age, karma });
      })
      .catch(reject);
  });

  let score = 0;

  for (const [sub, karma] of Object.entries(redditAccountData.subs)) {
    if (sub in subs) {
      console.log(`${username} has contributed to ${sub} (worth ${subs[sub]} points) with ${karma} points in total.`);
      score += multiplyBasedOnScore(subs[sub] as number, karma);
    }
  }

  score = multiplyBasedOnAge(score, redditAccountData.age);

  console.log(`${username} has a score of ${score}`);
  ipc.send("discord", {
    type: "threat-rating",
    payload: {
      username,
      score,
    },
  });
};

ipc.addListener("analyze", analyzeAccount);

console.log("reddit threat analizer loaded");
