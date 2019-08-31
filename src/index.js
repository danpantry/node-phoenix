import express from "express";
import serveStatic from "serve-static";
import path from "path";
import expressWs from "express-ws";
import phoenix, { View } from "./phoenix";

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

class MainView extends View {
  handleEvent(event, payload) {
    switch (event) {
      case "login":
        return this.login(payload);
    }
  }

  login({ username, password }) {
    console.log(username, password);
    return {};
  }
}

const viewHandlers = {
  main: MainView
};

app.ws("/live/websocket", phoenix(viewHandlers));

app.listen(8080);
