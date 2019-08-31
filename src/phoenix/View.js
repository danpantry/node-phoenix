import qs from "querystring";

export default class View {
  on(event, payload) {
    switch (event) {
      case "phx_join":
        return {
          // DOM elements?
          rendered: {},
          // No idea
          response: {}
        };
      case "phx_leave":
        return {};

      case "event":
        const { event, type, value } = payload;
        const args = type === "form" ? qs.parse(value) : value;
        return this.handleEvent(event, args);
    }
  }

  handleEvent(event, rest) {
    throw new Error("You must implement handleEvent(event, rest)");
  }
}
