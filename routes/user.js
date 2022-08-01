const express = require("express");
const router = express.Router();
const controllers = require("../controllers/userController");

router.get("/", controllers.home);

module.exports = router;
