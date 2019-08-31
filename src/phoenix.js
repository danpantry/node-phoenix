const PHX_TOPIC = "phoenix";
const VERSION = "2.0.0";

class Frame {
  static decode(string) {
    const [joinRef, ref, topic, event, payload] = JSON.parse(string);
    return new Frame(joinRef, ref, topic, event, payload);
  }

  constructor(joinRef, ref, topic, event, payload) {
    this.joinRef = joinRef;
    this.ref = ref;
    this.topic = topic;
    this.event = event;
    this.payload = payload;
  }

  encode() {
    return JSON.stringify([
      this.joinRef,
      this.ref,
      this.topic,
      this.event,
      this.payload
    ]);
  }

  /**
   * Sends a reply to the current messaeg with the given payload. Phoenix sends a message reference (ref) with every message. Sending a frame with the same ref causes Phoenix to interpret it as a 'reply'
   */
  replyOk(payload = {}) {
    return new Frame(this.joinRef, this.ref, this.topic, "phx_reply", {
      status: "ok",
      ...payload
    });
  }

  isInternal() {
    return this.topic === PHX_TOPIC;
  }
}

class Session {
  constructor() {
    this.rooms = new Set();
  }

  heartbeat(frame) {
    return frame;
  }

  handleInternalMessages(frame) {
    switch (frame.event) {
      case "heartbeat":
        return this.heartbeat(frame);
    }
  }

  joinRoom(frame) {
    this.rooms.add(frame.topic);
    return frame.replyOk({
      // DOM elements?
      rendered: {},
      // No idea
      response: {}
    });
  }

  leaveRoom(frame) {
    this.rooms.delete(frame.topic);
    // Not sure if this is correct
    return frame.replyOk();
  }

  handleMessage(frame) {
    if (frame.isInternal()) {
      return this.handleInternalMessages(frame);
    }

    switch (frame.event) {
      case "phx_join":
        return this.joinRoom(frame);
      case "phx_leave":
        return this.leaveRoom(frame);
      default:
        console.warn("unhandled event", frame);
        break;
    }
  }
}

export default function phoenix() {
  return (ws, req) => {
    if (req.query.vsn !== VERSION) {
      ws.close();
    }

    const session = new Session();
    ws.on("message", frame => {
      console.group("received");
      console.table(frame);
      console.groupEnd("received");
      const decoded = Frame.decode(frame);
      const response = session.handleMessage(decoded);
      if (response !== undefined) {
        const encoded = response.encode();
        ws.send(encoded);
        console.group("sent");
        console.table(encoded);
        console.groupEnd("sent");
      }
    });
  };
}
