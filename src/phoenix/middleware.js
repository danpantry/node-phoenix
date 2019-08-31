import Frame from "./Frame";

const VERSION = "2.0.0";

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

export default function phoenixMiddleware(viewHandlers) {
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
