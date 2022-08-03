const express = require("express");
const router = express.Router();
const { check } = require("express-validator");
const { verifyJwt } = require("../middlewares/auth");
const userControllers = require("../controllers/userController");

router.get("/", userControllers.home);

router.post(
  "/api/register",
  [
    check("email", "Please enter a valid email").isEmail(),
    check("password", "A valid password is required").exists(),
    check("firstName", "First name is required").exists(),
    check("lastName", "Last name is required").exists(),
  ],
  userControllers.register
);

router.post(
  "/api/login",
  [
    check("email", "Please enter a valid email").isEmail(),
    check("password", "A valid password is required").exists(),
  ],
  userControllers.login
);

router.get("/api/getLoggedInUser", verifyJwt, userControllers.getLoggedInUser);

router.post(
  "/api/logout",
  [check("email", "Please enter a valid email").isEmail()],
  userControllers.logout
);

router.get("/api/auth/admin", verifyJwt, userControllers.admin);

router.post(
  "/api/password-reset-request",
  userControllers.passwordResetRequest
);

router.get("/api/passwordReset", userControllers.passwordReset);

module.exports = router;
