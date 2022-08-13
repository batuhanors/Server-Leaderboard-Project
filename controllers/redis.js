//Redis nodejs client init
const Redis = require("ioredis");

//Initializing Redis
const redis = new Redis();

//Redis connection
redis.on("connect", () => {
  console.log("Redis has connected!");
});
redis.on("error", (err) => {
  console.log(err);
});

async function main() {
  const players = [
    { name: "Bob", score: 80 },
    { name: "Jeff", score: 59.5 },
    { name: "Tom", score: 100 },
    { name: "batuhanors", score: 80 },
    { name: "bushdeputy", score: 74 },
    { name: "saddleptarmigan", score: 68.5 },
    { name: "snowycocoa", score: 99 },
    { name: "poppyattempt", score: 104 },
    { name: "woodenupstairs", score: 53 },
    { name: "cyanpanty", score: 48 },
    { name: "bamboobus", score: 120 },
    { name: "turnipmuse", score: 87.5 },
    { name: "drizzleability", score: 101 },
    { name: "pregnantshrug", score: 67.5 },
    { name: "fardpizza", score: 84 },
    { name: "strudelmerge", score: 85 },
    { name: "oblongbreezy", score: 60 },
    { name: "gazebotopic", score: 57.5 },
    { name: "vomitorypreacher", score: 46 },
    { name: "dingfrost", score: 97 },
    { name: "crunchall", score: 88 },
    { name: "kazoosix", score: 74.5 },
    { name: "ninjachange", score: 64 },
    { name: "sacksquelch", score: 71 },
    { name: "turdreasonable", score: 91.5 },
    { name: "bootyexpansion", score: 49.5 },
    { name: "doodlelaugh", score: 85.5 },
    { name: "furphyrain", score: 96 },
    { name: "noddleleft", score: 108 },
    { name: "jalopyenvy", score: 90 },
  ];
  await redis.zadd(
    "players",
    ...players.map(({ name, score }) => [score, name])
  );

  //console.log(await redis.zrevrange("players", 0, 30));

  const rank = await redis.zrevrange("players", 0, 30, "WITHSCORES");
  return rank;
}

module.exports.main = main;
