const User = require("../models/userModel");
const { validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
require("dotenv").config();
const { SECRET } = process.env;

const home = (req, res) => {
  res.send("Welcome home, USER");
};

const register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const saltRounds = 10;
  const { firstName, lastName, email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  try {
    const createdUser = await User.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
    });
    res.status(201).json({
      message: "registeration successful",
      data: createdUser,
    });
  } catch (err) {
    console.log(err.message);
    res.status(500).send("server error");
  }
};

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
    console.log(2, user, password);
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    const payload = {
      user: {
        id: user.id,
      },
    };
    jwt.sign(
      payload,
      SECRET,
      {
        expiresIn: 360000,
      },
      (err, token) => {
        if (err) throw err;
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
      }
    );
  } catch (err) {
    console.log(err.message);
    res.status(500).send("server error");
  }
};

const getLoggedInUser = async (req, res) => {
  try {
    const user = User.findById(req.user.id).select("-password");
    res.status.json({
      message: "user gotten successfully",
      user,
    });
  } catch (err) {
    console.log(err.message);
    res.status(500).send("server error");
  }
};

module.exports = { home, login, register, getLoggedInUser };
