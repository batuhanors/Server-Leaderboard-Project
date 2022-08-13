const express = require("express");
const API = require("../controllers/api");

const router = express.Router();

router.get("/getUsers", API.getUsers);
router.get("/calculateMoney", API.calculateMoney);

module.exports = router;
