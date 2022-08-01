const { json } = require("express");
const express = require("express");
const mongoose = require("mongoose");
const routes = require("./routes/user");
require("dotenv").config();

const app = express();

app.use(json());

app.use("/", routes);

const port = process.env.PORT || 3030;
const DbURI = process.env.DbURI;

// mongoose
//   .connect(DbURI)
//   .then(() => console.log("connected to DB"))
//   .catch((err) => console.log(err));

app.listen(port, (err) => {
  if (err) console.log(err);
  else console.log(`Server is running on port ${port}`);
});
