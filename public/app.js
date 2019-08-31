(function() {
  if ("Phoenix" in window === false) {
    return;
  }

  const sock = new Phoenix.Socket("/live");
  sock.connect();
}());
