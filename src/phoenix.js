import qs from "querystring";

const PHX_TOPIC = "phoenix";
const VERSION = "2.0.0";

export class View {
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

function heartbeat(frame) {
  return frame;
}

function handleInternalMessages(frame) {
  switch (frame.event) {
    case "heartbeat":
      return heartbeat(frame);
  }
}

function extractRoomName({ topic }) {
  return topic.replace("lv:", "");
}

export default function phoenix(viewHandlers) {
  return (ws, req) => {
    if (req.query.vsn !== VERSION) {
      ws.close();
    }

    ws.on("message", message => {
      const frame = Frame.decode(message);
      if (frame.isInternal()) {
        return ws.send(handleInternalMessages(frame.encode()));
      }

      const roomName = extractRoomName(frame);
      const Handler = viewHandlers[roomName];
      if (Handler === undefined) {
        console.warn(`unknown handler ${roomName}`);
        ws.close();
        return;
      }

      const handler = new Handler();
      const payload = handler.on(frame.event, frame.payload);
      const response = frame.replyOk(payload);
      if (response === undefined) {
        return;
      }

      const encoded = response.encode();
      ws.send(encoded);
    });
  };
}
