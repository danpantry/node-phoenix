const PHX_TOPIC = "phoenix";

export default class Frame {
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

  get roomName() {
    return this.topic.replace("lv:", "");
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
