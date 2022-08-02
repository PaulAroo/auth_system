const home = (req, res) => {
  res.send("Welcome home, USER");
};

const register = (req, res) => {
  res.send("registered");
};

const login = (req, res) => {
  res.send("Logged in");
};

module.exports = { home, login, register };

// firstname, lastname, email password
