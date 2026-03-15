import net from "node:net";
import { parseClientConfig } from "../shared/config.js";
import { ServerResponseHandler } from "./serverResponseHandler.js";
import { ClientCommandHandler } from "./clientCommandHandler.js";

export function startClient() {
  console.log("🚀 TCP Chat Client Starting...\n");

  const { serverPort, serverIp, clientName } = parseClientConfig();
  const serverResponseHandler = new ServerResponseHandler();
  let clientCommandHandler;

  const socket = net.createConnection(serverPort, serverIp, () => {
    console.log(
      `✅ Connected to server! ${socket.remoteAddress}:${socket.remotePort}`,
    );

    socket.write(`-ccn ${clientName}`);
    if (clientName) {
      console.log(`👤 Joining as: ${clientName}`);
    } else {
      console.log("👤 Server will assign a random username");
    }
    console.log("💡 Type -h for help or start chatting!\n");

    // Setup input handling after connection
    clientCommandHandler = new ClientCommandHandler(socket);
    clientCommandHandler.setupCommandHandling();
  });

  socket.on("data", (data) => {
    serverResponseHandler.handleServerResponse(data);
  });

  socket.on("error", (err) => {
    if ((err as NodeJS.ErrnoException).code === "ECONNREFUSED") {
      console.error(
        "❌ Connection refused by the server. Is the server running?",
      );
      return;
    }
    if ((err as NodeJS.ErrnoException).code === "ETIMEDOUT") {
      console.error(
        "❌ Connection timed out. The IP address or port number might be wrong.",
      );
      process.exit(0);
    }
    if ((err as NodeJS.ErrnoException).code === "ECONNRESET") {
      console.error("❌ Connection was reset by the server.");
      return;
    }
    console.error(`❌ Server error: ${err.message}`);
  });

  socket.on("close", () => {
    console.log("🔌 Host Disconnected from server. Goodbye!");
    process.exit(0);
  });
}

startClient();
