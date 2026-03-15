import net from "node:net";
import { parseServerConfig } from "../shared/config.js";
import { ClientManager } from "./clientManager.js";
import { BanManager } from "./banManager.js";
import { ClientMessageHandler } from "./clientMessageHandler.js";
import { ServerCommandHandler } from "./serverCommandHandler.js";

export function startServer() {
  console.log("🚀 TCP Chat Server Starting...\n");

  const { serverName, serverHostIp, serverPort } = parseServerConfig();

  const clientManager = new ClientManager(serverName);
  const banManager = new BanManager();
  const clientMessageHandler = new ClientMessageHandler(clientManager);
  const serverCommandHandler = new ServerCommandHandler(clientManager, banManager);

  // Handle stdin commands
  process.stdin.on("data", (data) => {
    if (serverCommandHandler.isAwaiting()) return;

    serverCommandHandler.handleCommand(data);
  });

  // Create TCP server
  const tcpServer = net.createServer(async (socket) => {
    clientManager.addClient(socket);
    const clientAddress = `${socket.remoteAddress}:${socket.remotePort}`;
    console.log(`🔗 New client connected: ${clientAddress}`);

    const ip = socket.remoteAddress;
    if (!ip) {
      console.log("Client has no remoteAddress, cannot ban.");
      return false;
    }

    // Check if client is banned
    if (await banManager.isBanned(ip)) {
      socket.end("🚫 You are banned from this server");
      console.log(`🚫 Banned IP ${socket.remoteAddress} attempted to connect`);
      return;
    }

    socket.on("data", (data) => {
      clientMessageHandler.handleClientMessage(socket, data);
    });

    socket.on("error", (err) => {
      if ((err as NodeJS.ErrnoException).code === "ECONNRESET") {
        console.error(`🔌 Connection was reset by client: ${clientAddress}`);
        return;
      }
      console.error(`❌ Socket error: ${err.message}`);
    });

    socket.on("close", () => {
      const clientName = socket.clientName || clientAddress;
      console.log(`👋 Client disconnected: ${clientName}`);
      if (socket.clientName) {
        clientManager.broadcast(
          `👋 Client disconnected: ${socket.clientName}\n`,
        );
      }
      clientManager.removeClient(socket);
    });
  });

  tcpServer.listen(serverPort, serverHostIp, () => {
    const addr = tcpServer.address();
    if (typeof addr === "string") {
      console.log(`🎯 ${serverName} TCP server listening on ${addr}`);
    } else if (addr && typeof addr === "object") {
      console.log(
        `🎯 ${serverName} TCP server listening on ${addr.address}:${addr.port}`,
      );
    }
    console.log("💡 Type -h for help or start managing your server!\n");
  });

  tcpServer.on("error", (err) => {
    if ((err as NodeJS.ErrnoException).code === "EADDRINUSE") {
      console.error(
        `❌ Port ${serverPort} is already in use. Please choose a different port.`,
      );
    } else if ((err as NodeJS.ErrnoException).code === "EACCES") {
      console.error(`❌ Permission denied. Cannot bind to port ${serverPort}.`);
    } else {
      console.error(`❌ Server error: ${err.message}`);
    }
    process.exit(1);
  });
}

startServer();
