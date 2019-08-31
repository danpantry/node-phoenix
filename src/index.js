import express from "express";
import serveStatic from "serve-static";
import path from "path";
import expressWs from "express-ws";
import * as Phoenix from "./phoenix";
import HomeView from './views/HomeView'

const app = express();
expressWs(app);

app.set("views", path.join(process.cwd(), "views"));
app.set("view engine", "twig");

const opts = { index: false };
const publicPath = path.join(process.cwd(), "public");

app.use("/public", serveStatic(publicPath, opts));

app.get("/", (_req, res) => {
  res.render("home", { name: "World" });
});

app.ws("/live/websocket", Phoenix.middleware({ home: HomeView }));

app.listen(8080);
