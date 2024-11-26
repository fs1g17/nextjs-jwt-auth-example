const express = require("express");
const jwt = require("jsonwebtoken");
const { FSDB } = require("file-system-db");
const cookieParser = require("cookie-parser");

const port = 8080;
const jwtSigningSecret = "mySecret";
const db = new FSDB("./db.json", false);

const app = express();
app.use(express.json());
app.use(cookieParser());

app.get("/hello", (req, res) => {
  res.send("Hello World!");
});

app.post("/sign-up", (req, res) => {
  console.log(req.body);
  if (!req.body || !req.body.username || !req.body.password) {
    res.status(400).send({ message: "username and password required" });
    return;
  }

  const { username, password } = req.body;
  if (db.has(username)) {
    res.status(400).send({ message: "username already exists" });
    return;
  }

  db.set(username, password);
  res.send({ message: "success" });
});

app.post("/sign-in", (req, res) => {
  if (!req.body || !req.body.username || !req.body.password) {
    res.status(400).send({ message: "username and password required" });
    return;
  }

  const { username, password } = req.body;
  if (!db.has(username) || db.get(username) !== password) {
    res.status(403).send({ message: "incorrect credentials" });
    return;
  }

  const token = jwt.sign({ username }, jwtSigningSecret, {
    algorithm: "HS256",
  });
  res.cookie("jwt", token);
  res.send({ message: "success" });
});

app.get("/ready", (req, res) => {
  const token = req.cookies["jwt"];
  console.log(token);
  if (!token) {
    res.status(403).send({ message: "unauthenticated" });
    return;
  }

  let decoded;
  try {
    decoded = jwt.verify(token, jwtSigningSecret);
  } catch (error) {
    res.status(403).send({ message: "unauthenticated" });
    return;
  }

  if (!db.has(decoded.username)) {
    res.status(403).send({ message: "unauthenticated" });
    return;
  }

  res.send({ message: "success" });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
