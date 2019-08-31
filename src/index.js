import express from "express";

const app = express();

app.get("/", (req, res) => {
  res.write("Hello, world!");
  res.end();
});

app.listen(8080);
