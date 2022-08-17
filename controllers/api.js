const redisClient = require("./redis");
const Player = require("../models/playerSchema");

async function getSortedPlayers() {
  const sortedPlayers = await redisClient.main();
  return sortedPlayers;
}

async function getTopSortedPlayers(sortedPlayers) {
  let topSortedPlayers = [];
  if (sortedPlayers.length > 99) {
    //getting only top 100 players of sortedPlayersList
    topSortedPlayers = sortedPlayers.slice(0, 99);
  } else topSortedPlayers = sortedPlayers;

  return topSortedPlayers;
}

module.exports = class API {
  static async getUsers(req, res) {
    try {
      const sortedPlayers = await getSortedPlayers();
      const topSortedPlayers = await getTopSortedPlayers(sortedPlayers);

      const playerObject = [];

      //I know it is a high cost operation, however it only calculates top 100 players
      for (let i = 0; i < topSortedPlayers.length; i++) {
        let singlePlayer = await Player.findOne({
          username: sortedPlayers[i],
        });

        let rank = 0;

        if (singlePlayer.dailyRank < i + 1) {
          console.log(
            singlePlayer.username +
              " has ranked down by " +
              (-(i + 1) + singlePlayer.dailyRank)
          );
          rank = -(i + 1) + singlePlayer.dailyRank;
        } else if (singlePlayer.dailyRank > i + 1) {
          console.log(
            singlePlayer.username +
              " has ranked up by " +
              (-(i + 1) + singlePlayer.dailyRank)
          );
          rank = -(i + 1) + singlePlayer.dailyRank;
        }

        //once redis sorts the player ranks, here the top 100 players will sent
        let playerObjectItem = {
          username: sortedPlayers[i],
          country: singlePlayer.country,
          money: singlePlayer.money,
          dailyDiff: rank,
        };
        playerObject.push(playerObjectItem);
      }

      res.status(200).json(playerObject);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  static async addUser(req, res) {
    try {
      const newUser = new Player({
        country: "Sri Lanka",
        username: "fardpizza",
        money: "485",
      });

      await newUser.save();

      res.status(200).json({ message: "User created successfully" });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  static async calculateMoney(req, res) {
    try {
      const date = new Date();

      if (date.getDay() === 0) {
        res.status(200).json({ isPrizeAvailable: false });
      } else {
        let totalMoney = 0,
          prizeMoney = 0;

        let firstPrize = 0,
          secondPrize = 0,
          thirdPrize = 0,
          remainingPrize = 0;

        const players = await Player.find();

        players.map((player) => {
          totalMoney += player.money;
        });

        prizeMoney =
          Math.round((totalMoney * 0.02 + Number.EPSILON) * 100) / 100; // Ensuring that only two decimal places displays
        firstPrize =
          Math.round((prizeMoney * 0.2 + Number.EPSILON) * 100) / 100;
        secondPrize =
          Math.round((prizeMoney * 0.15 + Number.EPSILON) * 100) / 100;
        thirdPrize =
          Math.round((prizeMoney * 0.1 + Number.EPSILON) * 100) / 100;

        //remaining prize money
        remainingPrize =
          Math.round(
            (prizeMoney -
              firstPrize -
              secondPrize -
              thirdPrize +
              Number.EPSILON) *
              100
          ) / 100;

        console.log(remainingPrize);

        const sortedPlayers = await getSortedPlayers();
        const topSortedPlayers = await getTopSortedPlayers(sortedPlayers);

        //console.log(topSortedPlayers);

        res.status(200).json({
          isPrizeAvailable: true,
          prizePool: prizeMoney,
          firstPlayerPrize: firstPrize,
          secondPlayerPrize: secondPrize,
          thirdPlayerPrize: thirdPrize,
        });
      }
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
};
