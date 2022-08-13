const redisClient = require("./redis");

async function getPlayers() {
  const sortedPlayers = await redisClient.main();
  return sortedPlayers;
}

module.exports = class API {
  static async getUsers(req, res) {
    try {
      const players = await getPlayers();
      console.log(players);

      res.status(200).json(players);
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

      prizeMoney = totalMoney * 0.02;
      firstPrize = prizeMoney * 0.2;
      secondPrize = prizeMoney * 0.15;
      thirdPrize = prizeMoney * 0.1;

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
