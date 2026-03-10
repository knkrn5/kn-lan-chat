import net from "node:net";

export function createConnection(serverIp, serverPort, onConnect, onData, onError, onClose) {
  console.log(`🔄 Connecting to TCP server at ${serverIp}:${serverPort}...`);

  const socket = net.createConnection(serverPort, serverIp, () => {
    console.log(`✅ Connected to server! ${socket.remoteAddress}:${socket.remotePort}`);
    onConnect(socket);
  });

  socket.on("data", (data) => {
    onData(data);
  });

  socket.on("error", (err) => {
    onError(err);
  });

  socket.on("close", () => {
    onClose();
  });

  return socket;
}
