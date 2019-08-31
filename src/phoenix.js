const PHX_TOPIC = "phoenix";
const VERSION = "2.0.0";

class Session {
  encode({ joinRef, ref, topic, event, payload }) {
    return JSON.stringify([joinRef, ref, topic, event, payload]);
  }

  decode(frame) {
    const [joinRef, ref, topic, event, payload] = JSON.parse(frame);
    return { joinRef, ref, topic, event, payload };
  }

  heartbeat(frame) {
    return frame;
  }

  handleMessage(frame) {
    console.log(frame);
    const decoded = this.decode(frame);
    const { topic, event } = decoded;
    if (topic !== PHX_TOPIC) {
      return undefined;
    }

    switch (event) {
      case "heartbeat":
        return this.encode(this.heartbeat(decoded));
      default:
        console.warn("unhandled event", event);
    }
  }
}

export default function phoenix() {
  return (ws, req) => {
    if (req.query.vsn !== VERSION) {
      console.warn("version mismatch");
      ws.close();
    }

    const session = new Session();
    ws.on("message", frame => {
      const response = session.handleMessage(frame);
      if (response !== undefined) {
        ws.send(response);
      }
    });
  };
}
