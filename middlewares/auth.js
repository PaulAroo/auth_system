// check if there is a token and header
const jwt = require("jsonwebtoken");
require("dotenv").config();
const { SECRET } = process.env;

const verifyJwt = (req, res, next) => {
  const token = req.header("x-auth-token");
  if (!token)
    return res.status(401).json({
      message: "no token, authorization denied!",
    });

  try {
    const decoded = jwt.verify(token, SECRET);
    req.user = decoded.payload;
    next();
  } catch (err) {
    res.status(401).json({ message: "token is not valid" });
    console.log(err);
  }
};

module.exports = verifyJwt;
