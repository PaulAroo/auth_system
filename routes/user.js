const express = require("express");
const router = express.Router();
const userControllers = require("../controllers/userController");
const { check } = require("express-validator");

router.get("/", userControllers.home);

router.post(
  "/auth/register",
  [
    check("email", "Please enter a valid email").isEmail(),
    check("password", "A valid password is required").exists(),
    check("firstName", "First name is required").exists(),
    check("lastName", "Last name is required").exists(),
  ],
  userControllers.register
);

router.post(
  "/auth/login",
  [
    check("email", "Please enter a valid email").isEmail(),
    check("password", "A valid password is required").exists(),
  ],
  userControllers.login
);

module.exports = router;
