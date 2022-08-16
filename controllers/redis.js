const Player = require("../models/playerSchema");

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
  const players = await Player.find();
  const zPlayers = [];

  players.map((player) => {
    let onePlayer = { name: player.username, score: player.money };
    zPlayers.push(onePlayer);
  });

  await redis.zadd(
    "players",
    ...zPlayers.map(({ name, score }) => [score, name])
  );

  //console.log(await redis.zrevrange("players", 0, 30));

  const rank = await redis.zrevrange("players", 0, players.length);
  return rank;
}

module.exports.main = main;
