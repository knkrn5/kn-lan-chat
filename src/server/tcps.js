import net from "node:net";
import { parseServerConfig } from "../shared/config.js";
import { ClientManager } from "./clientManager.js";
import { BanManager } from "./banManager.js";
import { ProtocolHandler } from "./protocol.js";
import { CommandHandler } from "./commandHandler.js";

export function startServer() {
  console.log("🚀 TCP Chat Server Starting...\n");

  const { serverName, serverHostIp, serverPort } = parseServerConfig();

  const clientManager = new ClientManager(serverName);
  const banManager = new BanManager();
  const protocolHandler = new ProtocolHandler(clientManager);
  const commandHandler = new CommandHandler(clientManager, banManager);

  // Handle stdin commands
  process.stdin.on("data", (data) => {
    if (commandHandler.isAwaiting()) return;

    console.log("runngin server cmd")

    const input = data.toString().trim();
    commandHandler.handleCommand(input);
  });

  // Create TCP server
  const tcpServer = net.createServer(async (socket) => {
    clientManager.addClient(socket);
    const clientAddress = `${socket.remoteAddress}:${socket.remotePort}`;
    console.log(`🔗 New client connected: ${clientAddress}`);

    // Check if client is banned
    if (await banManager.isBanned(socket.remoteAddress)) {
      socket.end("🚫 You are banned from this server");
      console.log(`🚫 Banned IP ${socket.remoteAddress} attempted to connect`);
      return;
    }

    socket.on("data", (data) => {
      protocolHandler.handleClientMessage(socket, data);
    });

    socket.on("error", (err) => {
      if (err.code === "ECONNRESET") {
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
    console.log(
      `🎯 ${serverName} TCP server listening on ${addr.address}:${addr.port}`,
    );
    console.log("💡 Type -h for help or start managing your server!\n");
  });

  tcpServer.on("error", (err) => {
    if (err.code === "EADDRINUSE") {
      console.error(
        `❌ Port ${serverPort} is already in use. Please choose a different port.`,
      );
    } else if (err.code === "EACCES") {
      console.error(`❌ Permission denied. Cannot bind to port ${serverPort}.`);
    } else {
      console.error(`❌ Server error: ${err.message}`);
    }
    process.exit(1);
  });
}


startServer();