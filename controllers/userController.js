const User = require("../models/userModel");
const ResetToken = require("../models/resetTokenModel");
const { validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const sendEmail = require("../utils/email/sendMail");
const crypto = require("crypto");
require("dotenv").config();
const { SECRET, SALT_ROUNDS, PORT } = process.env;

const home = (req, res) => {
  res.send("Welcome home, USER");
};

// @route		POST api/auth/register
// @desc		Register/Sign Up (users, staff, managers, admin) and get token
// @access	Public
const register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { firstName, lastName, email, password, userRole } = req.body;
  const saltRounds = Number(SALT_ROUNDS);
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  try {
    const createdUser = await User.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      userRole,
    });
    res.status(201).json({
      message: "registeration successful",
      userInfo: {
        firstName: createdUser.firstName,
        lastName: createdUser.lastname,
        email: createdUser.email,
        role: createdUser.userRole,
      },
    });
  } catch (err) {
    console.log(err.message);
    res.status(500).send("server error");
  }
};

// @route		POST api/auth/login
// @desc		Auth (users, staff, managers, admin) and get token
// @access	Public
const login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "invalid credentials" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    let token = user.token;
    if (!user.token) {
      console.log(0000000);
      const payload = {
        user: {
          id: user.id,
          role: user.userRole,
        },
      };
      token = jwt.sign(payload, SECRET, {
        expiresIn: 360000,
      });
      User.findByIdAndUpdate(user.id, { token }, () => console.log("updated"));
    }

    res.json({
      message: "logged in successfully",
      user: {
        firstName: user.firstName,
        lastName: user.firstName,
        email: user.email,
        role: user.role,
      },
      token,
    });
  } catch (err) {
    console.log(err.message);
    res.status(500).send("server error");
  }
};

// @route		GET api/getLoggedInUser
// @desc		get details of logged in user
// @access	Authenticated user ("Authorization" required in Header)
const getLoggedInUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.status(200).json({
      message: "user gotten successfully",
      user,
    });
  } catch (err) {
    console.log(err);
    res.status(500).send("server error");
  }
};

// @route		POST api/logout
// @desc		log out a user (deletes token)
const logout = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { email } = req.body;
  User.findOneAndUpdate({ email }, { token: "" }, (err, data) => {
    if (err) {
      console.log(err);
      return res.json({ message: "error logging out" });
    }
    res.json({ message: "successfully logged out" });
  });
};

const admin = (req, res) => {
  res.send(req.user.role);
};

const passwordResetRequest = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) res.status(400).json({ message: "User does not exist" });

  let token = await ResetToken.findOne({ userId: user._id });
  if (token) await token.deleteOne();

  //request password reset
  let resetToken = crypto.randomBytes(32).toString("hex");
  const hash = await bcrypt.hash(resetToken, Number(SALT_ROUNDS));

  await ResetToken.create({
    userId: user._id,
    token: hash,
    createdAt: Date.now(),
  });

  const link = `http://localhost:${PORT}/api/passwordReset?token=${resetToken}&id=${user._id}`;
  sendEmail(
    res,
    user.email,
    "Password Reset Request",
    { name: user.firstName, link: link },
    "./template/requestResetPassword.handlebars"
  );
};

const passwordReset = async (req, res) => {
  console.log("error");
  const password = req.body.password || "abc";
  const { token, id } = req.query;
  let passwordResetToken = await ResetToken.findOne({ userId: id });
  if (!passwordResetToken) {
    res.status(400).json({ message: "Expired reset token" });
  }
  const isValid = await bcrypt.compare(token, passwordResetToken.token);
  if (!isValid) {
    res.status(400).json({ message: "Invalid reset token" });
  }
  const hash = await bcrypt.hash(password, Number(SALT_ROUNDS));
  await User.updateOne({ _id: id }, { password: hash }, { new: true });
  const user = await User.findById({ _id: id });
  sendEmail(
    res,
    user.email,
    "Password Reset Successfully",
    {
      name: user.firstName,
    },
    "./template/resetPassword.handlebars"
  );
  await passwordResetToken.deleteOne();
};

module.exports = {
  home,
  admin,
  login,
  logout,
  register,
  passwordReset,
  getLoggedInUser,
  passwordResetRequest,
};
