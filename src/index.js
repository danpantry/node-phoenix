import express from "express";
import serveStatic from "serve-static";
import path from "path";
import expressWs from "express-ws";

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

function phoenixLiveSockets() {
  return (ws, req) => {
    const version = req.query.param;
    if (version === "2.0.0") {
      console.warn("version mismatch");
      ws.close();
    }
  };
}

app.ws("/live/websocket", phoenixLiveSockets());

app.listen(8080);
