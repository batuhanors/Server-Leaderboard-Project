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
    { name: "batuhanors", score: 500 },
    { name: "Jeff", score: 418.5 },
    { name: "Tom", score: 400 },
    { name: "SpiceGlimmer", score: 417 },
    { name: "bushdeputy", score: 359.5 },
    { name: "saddleptarmigan", score: 447 },
    { name: "snowycocoa", score: 304 },
    { name: "poppyattempt", score: 316 },
    { name: "woodenupstairs", score: 271.5 },
    { name: "cyanpanty", score: 324 },
    { name: "bamboobus", score: 385.5 },
    { name: "turnipmuse", score: 295 },
    { name: "drizzleability", score: 341 },
    { name: "pregnantshrug", score: 346 },
    { name: "fardpizza", score: 485 },
    { name: "strudelmerge", score: 273 },
    { name: "oblongbreezy", score: 260 },
    { name: "gazebotopic", score: 458 },
    { name: "vomitorypreacher", score: 429 },
    { name: "dingfrost", score: 354 },
    { name: "crunchall", score: 422 },
    { name: "kazoosix", score: 333 },
    { name: "ninjachange", score: 450 },
    { name: "sacksquelch", score: 257 },
    { name: "turdreasonable", score: 467 },
    { name: "bootyexpansion", score: 496 },
    { name: "doodlelaugh", score: 377 },
    { name: "furphyrain", score: 339 },
    { name: "noddleleft", score: 444 },
    { name: "jalopyenvy", score: 390 },
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
