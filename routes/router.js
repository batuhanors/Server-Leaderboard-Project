const express = require("express");
const API = require("../controllers/api");

const router = express.Router();

router.get("/getUsers", API.getUsers);
router.get("/calculateMoney", API.calculateMoney);

router.post("/calculateIndividualPrize", API.individualPlayerPrize);
router.post("/getIndividualPlayer", API.getIndividualPlayer);
router.post("/updatePlayer", API.updatePlayer);

module.exports = router;
