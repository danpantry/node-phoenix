import express from "express";
import serveStatic from "serve-static";
import path from "path";
import expressWs from "express-ws";
import phoenix from "./phoenix";

const app = express();
expressWs(app);

app.set("views", path.join(process.cwd(), "views"));
app.set("view engine", "twig");

const opts = { index: false };
const publicPath = path.join(process.cwd(), "public");

app.use("/public", serveStatic(publicPath, opts));

app.get("/", (req, res) => {
  res.render("home", { name: "World" });
});

app.ws("/live/websocket", phoenix());

app.listen(8080);
