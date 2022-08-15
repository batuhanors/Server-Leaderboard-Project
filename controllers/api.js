const redisClient = require("./redis");
const Player = require("../models/playerSchema");

async function getPlayers() {
  const sortedPlayers = await redisClient.main();
  return sortedPlayers;
}

module.exports = class API {
  static async getUsers(req, res) {
    try {
      const sortedPlayers = await getPlayers();
      let topSortedPlayers = [];
      if (sortedPlayers.length > 99) {
        topSortedPlayers = sortedPlayers.slice(0, 99);
      } else topSortedPlayers = sortedPlayers;
      const playerObject = [];

      //I know it is a high cost operation, however it only calculates 100 players
      for (let i = 0; i < topSortedPlayers.length; i++) {
        let singlePlayer = await Player.findOne({
          username: sortedPlayers[i],
        });

        //once redis sorts the player ranks, here the top 100's country and money are fetched
        let playerObjectItem = {
          username: sortedPlayers[i],
          country: singlePlayer.country,
          money: singlePlayer.money,
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
      let totalMoney = 0,
        prizeMoney = 0;

      let firstPrize = 0,
        secondPrize = 0,
        thirdPrize = 0;

      const players = await getPlayers();

      /* Getting all money by taking only even numbers in the object above(Because somehow all players
      and their money returns in different object item) */
      for (let i = 1; i < players.length; i += 2) {
        totalMoney += parseFloat(players[i]);
      }

      prizeMoney = Math.round((totalMoney * 0.02 + Number.EPSILON) * 100) / 100; // Ensuring that only two decimal places
      firstPrize = Math.round((prizeMoney * 0.2 + Number.EPSILON) * 100) / 100;
      secondPrize =
        Math.round((prizeMoney * 0.15 + Number.EPSILON) * 100) / 100;
      thirdPrize = Math.round((prizeMoney * 0.1 + Number.EPSILON) * 100) / 100;

      res.status(200).json({
        prizePool: prizeMoney,
        firstPlayerPrize: firstPrize,
        secondPlayerPrize: secondPrize,
        thirdPlayerPrize: thirdPrize,
      });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
};
