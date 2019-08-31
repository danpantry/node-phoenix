import express from "express";
import serveStatic from "serve-static";
import path from "path";

const app = express();

const opts = { index: false };
const publicPath = path.join(process.cwd(), "public");

app.use("/public", serveStatic(publicPath, opts));

app.get("/", (req, res) => {
  res.write("Hello, world!");
  res.end();
});

app.listen(8080);
