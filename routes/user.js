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

router.post(
  "/api/logout",
  [check("email", "Please enter a valid email").isEmail()],
  userControllers.logout
);

router.post(
  "/api/password-reset-request",
  userControllers.passwordResetRequest
);

router.get("/api/passwordReset", userControllers.passwordReset);

router.get("/api/auth/user", verifyJwt, userControllers.getUser);

router.get("/api/auth/staff", verifyJwt, userControllers.getStaff);

router.get("/api/auth/manager", verifyJwt, userControllers.getManager);

router.get("/api/auth/admin", verifyJwt, userControllers.getAdmin);

module.exports = router;
