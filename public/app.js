(function() {
  if ("phoenix_live_view" in window === false) {
    return;
  }

  const sock = new phoenix_live_view.LiveSocket("/live", {
    logger(kind, msg, data) {
      console.log(kind, msg, data)
    }
  });
  sock.connect();
}());
