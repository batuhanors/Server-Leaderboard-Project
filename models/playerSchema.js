const mongoose = require("mongoose");

const playerSchema = mongoose.Schema({
  country: String,
  username: String,
  money: Number,
});

module.exports = mongoose.model("Player", playerSchema);
