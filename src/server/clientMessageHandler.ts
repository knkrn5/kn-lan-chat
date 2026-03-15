//** server socket.on('data') handler for processing client messages */
import { ClientManager } from "./clientManager.js";
import type { ClientSocket } from "../types/types.js";

export class ClientMessageHandler {
  private clientManager: ClientManager;

  constructor(clientManager: ClientManager) {
    this.clientManager = clientManager;
  }

  handleClientMessage(socket: ClientSocket, data: string | Buffer) {
    const dataStr = data.toString().trim();
    const dataArr = dataStr.split(" ").filter(Boolean);

    console.log(`💬 ${socket.clientName || "Unknown"}-> ${dataStr}`);

    // Change client name
    if (dataArr[0] === "-ccn") {
      const requestedName = dataArr[1];
      if (!requestedName) {
        socket.write(
          "❌ Please provide a valid client name. Eg: -ccn <clientname>\n",
        );
        return;
      }
      this.clientManager.handleClientNameSet(socket, requestedName);
      return;
    }

    // Send message to specific client by number
    if (dataArr[0] === "-cnum") {
      const clientIndexNum = dataArr[1];
      if (!clientIndexNum) {
        socket.write(
          "❌ Please provide a valid client number. Eg: -cnum <clientnumber> <message>\n",
        );
        return;
      }
      const usernumber = parseInt(clientIndexNum, 10);
      console.log("usernumbber", usernumber);
      const message = dataArr.slice(2).join(" ");

      if (isNaN(usernumber)) {
        socket.write("❌ Please enter a valid user number.\n");
        return;
      }
      if (usernumber < 0) {
        socket.write("❌ User number cannot be negative.\n");
        return;
      }
      if (usernumber >= this.clientManager.getClientCount()) {
        socket.write("❌ User number out of range.\n");
        return;
      }

      const targetSocket = this.clientManager.findClientByIndex(usernumber);

      if (!targetSocket) {
        socket.write("❌ Target client not found.\n");
        return;
      }

      targetSocket.write(`-cname ${socket.clientName} ${message.trim()}\n`);
      return;
    }

    // Send message to specific client by name
    if (dataArr[0] === "-cname") {
      const clientName = dataArr[1]?.trim();
      const msg = dataArr.slice(2).join(" ");

      if (!clientName) {
        socket.write("❌ Please specify a client name.\n");
        return;
      }

      const targetSocket = this.clientManager.findClientByName(clientName);

      if (targetSocket) {
        if (!msg.trim()) {
          return;
        }
        targetSocket.write(`-cname ${socket.clientName} ${msg.trim()}\n`);
      } else {
        socket.write(
          `❌ ${clientName} - This client does not exist. Type -cl to see list of all clients.\n`,
        );
      }
      return;
    }

    // Get own client name
    if (dataStr === "-cn") {
      socket.write(`👤 Your client name is: ${socket.clientName}\n`);
      return;
    }

    // Get client list
    if (dataStr === "-cl") {
      this.clientManager.sendClientList(socket);
      return;
    }

    // Broadcast message
    if (dataStr.startsWith("-bc")) {
      const clientsBroadcastMsg = dataStr.substring(4);
      if (!clientsBroadcastMsg.trim()) {
        socket.write("❌ Please provide a message to broadcast.\n");
        return;
      }

      this.clientManager.getClientList().forEach((s) => {
        if (s !== socket) {
          s.write(
            `-bc 📢 ${socket.clientName} broadcasted: ${clientsBroadcastMsg}\n`,
          );
        }
      });
      socket.write("✅ Message broadcasted to all clients.\n");
      return;
    }

    // Show help
    if (dataStr === "-h" || dataStr === "-help") {
      socket.write(`
📋 Client Commands:
-ccn <name>             Set your client name
-cnum <number> <msg>    Send message to client by number
-cname <name> <msg>     Send message to client by name
-cn                     Show your client name
-cl                     Show list of all connected clients
-bc <msg>               Broadcast message to all clients
exit                    Disconnect from the server
-h or -help             Show this help message
      \n`);
      return;
    }

    // Exit
    if (dataStr === "exit") {
      const clientAddress = `${socket.remoteAddress}:${socket.remotePort}`;
      console.log(
        `👋 Client ${socket.clientName || clientAddress} disconnected.`,
      );
      socket.end();
      return;
    }
  }
}
