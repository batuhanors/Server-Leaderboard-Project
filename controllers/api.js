const cluster = require("cluster");

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
    topSortedPlayers = sortedPlayers.slice(0, 100);
  } else topSortedPlayers = sortedPlayers;

  return topSortedPlayers;
}

async function getPrizes() {
  let remainingPrize = 0;
  let firstPrize = 0,
    secondPrize = 0,
    thirdPrize = 0;
  const date = new Date();

  let totalMoney = 0,
    prizeMoney = 0;

  const players = await Player.find();

  players.map((player) => {
    totalMoney += player.money;
  });

  prizeMoney = Math.round((totalMoney * 0.02 + Number.EPSILON) * 100) / 100; // Ensuring that only two decimal places displays
  firstPrize = Math.round((prizeMoney * 0.2 + Number.EPSILON) * 100) / 100;
  secondPrize = Math.round((prizeMoney * 0.15 + Number.EPSILON) * 100) / 100;
  thirdPrize = Math.round((prizeMoney * 0.1 + Number.EPSILON) * 100) / 100;

  //remaining prize money
  remainingPrize =
    Math.round(
      (prizeMoney - firstPrize - secondPrize - thirdPrize + Number.EPSILON) *
        100
    ) / 100;

  const data = {
    remainingPrize: remainingPrize,
    firstPrize: firstPrize,
    secondPrize: secondPrize,
    thirdPrize: thirdPrize,
    date: date,
    prizeMoney: prizeMoney,
  };

  return data;
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
          username: topSortedPlayers[i],
        });
        let rank = 0;

        if (singlePlayer.dailyRank < i + 1) {
          rank = -(i + 1) + singlePlayer.dailyRank;
        } else if (singlePlayer.dailyRank > i + 1) {
          rank = -(i + 1) + singlePlayer.dailyRank;
        }

        //once redis sorts the player ranks, here the top 100 players will sent
        let playerObjectItem = {
          username: singlePlayer.username,
          country: singlePlayer.country,
          money: singlePlayer.money,
          dailyDiff: rank,
        };
        await playerObject.push(playerObjectItem);
      }

      res.status(200).json(playerObject);
      cluster.worker.kill();
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  static async updatePlayer(req, res) {
    try {
      const userName = req.body.username;
      const newMoney = req.body.newMoneyAmount;

      const player = await Player.findOne({ username: userName });

      if (!player) {
        res.status(404).json({ message: "player doesn't exist" });
      } else {
        player.money = newMoney;
        await player.save();

        res.status(200).json({ message: "Ok." });
      }
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  static async calculateMoney(req, res) {
    try {
      const topPrizes = await getPrizes();

      // I then decided to add a trigger to the MongoDB Atlas which triggers in Mondays at 00:00
      // And resets all players money, however since it is a demo, I didn't activated it.
      /*
      if(topPrizes.date.getDay() === 0) {
        //Added Mongo DB Atlas Trigger instead of this
        res.status(200).json({ isPrizeAvailable: false });
      } */

      res.status(200).json({
        isPrizeAvailable: true,
        prizePool: topPrizes.prizeMoney,
        firstPlayerPrize: topPrizes.firstPrize,
        secondPlayerPrize: topPrizes.secondPrize,
        thirdPlayerPrize: topPrizes.thirdPrize,
      });

      cluster.worker.kill();
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  static async individualPlayerPrize(req, res) {
    try {
      const requestedPlayer = req.body.username;
      const sortedPlayers = await getSortedPlayers();
      const topSortedPlayers = await getTopSortedPlayers(sortedPlayers);

      const topPrizes = await getPrizes();

      let rank = 0;

      topSortedPlayers.map((player, index) => {
        if (requestedPlayer === player) {
          rank = index + 1;
        }
      });

      if (rank > 100 || rank === 0) {
        res.status(404).json({ message: "no prize" });
      } else {
        let playerPrize;
        if (rank === 1) playerPrize = topPrizes.firstPrize;
        else if (rank === 2) playerPrize = topPrizes.secondPrize;
        else if (rank === 3) playerPrize = topPrizes.thirdPrize;
        else {
          /* So the math behind this is that basically dividing remaining prize into small chunks by dividing it
          with 5044 (which is sum of numbers between 4 and 100) and applying inverse proportion. */
          let prizeRatio = topPrizes.remainingPrize / 5044;
          playerPrize = Math.round((100 - rank) * prizeRatio * 100) / 100;
        }
        res.status(200).json({ rank: rank, prize: playerPrize });
      }
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  static async getIndividualPlayer(req, res) {
    try {
      const requestedUsername = req.body.username;

      const sortedPlayers = await getSortedPlayers();

      await sortedPlayers.map(async (player, index) => {
        if (requestedUsername === player) {
          let requestedAbovePlayerOneIndex = 0,
            requestedAbovePlayerTwoIndex = 0,
            requestedAbovePlayerThreeIndex = 0;

          let requestedBelowPlayerOneIndex = 0,
            requestedBelowPlayerTwoIndex = 0;

          const requestedPlayer = await Player.findOne({
            username: requestedUsername,
          });

          requestedAbovePlayerOneIndex = index - 1;
          requestedAbovePlayerTwoIndex = index - 2;
          requestedAbovePlayerThreeIndex = index - 3;

          requestedBelowPlayerOneIndex = index + 1;
          requestedBelowPlayerTwoIndex = index + 2;

          const requestedAbovePlayerOne = await Player.findOne({
            username: sortedPlayers[requestedAbovePlayerOneIndex],
          });

          const requestedAbovePlayerTwo = await Player.findOne({
            username: sortedPlayers[requestedAbovePlayerTwoIndex],
          });

          const requestedAbovePlayerThree = await Player.findOne({
            username: sortedPlayers[requestedAbovePlayerThreeIndex],
          });

          const requestdBelowPlayerOne = await Player.findOne({
            username: sortedPlayers[requestedBelowPlayerOneIndex],
          });

          const requestdBelowPlayerTwo = await Player.findOne({
            username: sortedPlayers[requestedBelowPlayerTwoIndex],
          });

          res.status(200).json({
            abovePlayerOne: requestedAbovePlayerOne,
            abovePlayerTwo: requestedAbovePlayerTwo,
            abovePlayerThree: requestedAbovePlayerThree,
            requestedPlayer: requestedPlayer,
            belowPlayerOne: requestdBelowPlayerOne,
            belowPlayerTwo: requestdBelowPlayerTwo,
            abovePlayerOneIndex: JSON.stringify(
              requestedAbovePlayerOneIndex + 1
            ),
            abovePlayerTwoIndex: JSON.stringify(
              requestedAbovePlayerTwoIndex + 1
            ),
            abovePlayerThreeIndex: JSON.stringify(
              requestedAbovePlayerThreeIndex + 1
            ),
            requstedPlayerIndex: JSON.stringify(index + 1),
            belowPlayerOneIndex: JSON.stringify(
              requestedBelowPlayerOneIndex + 1
            ),
            belowPlayerTwoIndex: JSON.stringify(
              requestedBelowPlayerTwoIndex + 1
            ),
          });
        }
      });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
};
