(function() {
  if ("phoenix_live_view" in window === false) {
    return;
  }

  const sock = new phoenix_live_view.LiveSocket("/live");
  sock.connect();
}());
