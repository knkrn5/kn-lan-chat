import { strgen } from "../shared/utils.js";
import type { Socket } from "node:net";

type ClientSocket = Socket & {
  clientName: string;
};

export class ClientManager {
  private serverName: string;
  private clientList: ClientSocket[];

  constructor(serverName: string) {
    this.serverName = serverName;
    this.clientList = [];
  }

  addClient(socket) {
    this.clientList.push(socket);
  }

  removeClient(socket) {
    const index = this.clientList.indexOf(socket);
    if (index !== -1) {
      this.clientList.splice(index, 1);
    }
  }

  findClientByName(clientName) {
    return this.clientList.find((socket) => socket.clientName === clientName);
  }

  findClientByIndex(index) {
    return this.clientList[index];
  }

  isNameTaken(clientName, excludeSocket = null) {
    return this.clientList.some(
      (socket) => socket.clientName === clientName && socket !== excludeSocket,
    );
  }

  broadcast(message, excludeSocket = null) {
    this.clientList.forEach((socket) => {
      if (socket !== excludeSocket && !socket.destroyed) {
        socket.write(message);
      }
    });
  }

  sendToClient(clientName, message) {
    const targetSocket = this.findClientByName(clientName);
    if (targetSocket) {
      targetSocket.write(message);
      console.log(`📤 Message sent to ${clientName}: ${message.trim()}`);
      return true;
    } else {
      console.log(
        `❌ ${clientName} This client Name does not exist on this server.`,
      );
      return false;
    }
  }

  showAllClients() {
    console.log(
      `\n👥 List of all Clients connected to ${this.serverName} TCP server:`,
    );
    if (this.clientList.length === 0) {
      console.log("No clients connected.");
    } else {
      this.clientList.forEach((socket, i) => {
        const clientAddress = `${socket.remoteAddress}:${socket.remotePort}`;
        console.log(`${i}. ${socket.clientName} - ${clientAddress}`);
      });
    }
    console.log(`Total Clients: ${this.clientList.length}\n`);
  }

  handleClientNameSet(socket, requestedName) {
    let clientName = requestedName;

    if (clientName === "null" || !clientName || clientName === "undefined") {
      clientName = strgen();
    }

    if (this.isNameTaken(clientName, socket)) {
      socket.write(
        `❌ Username '${clientName}' already exists. Please choose a different name.\n`,
      );
      return false;
    }

    socket.clientName = clientName;
    socket.write(
      `✅ ${clientName} Welcome to the ${this.serverName} TCP server!\nType -h or -help to see list of all commands.\n`,
    );
    this.broadcast(`👋 New client joined: ${clientName}\n`, socket);
    return true;
  }

  sendClientList(socket) {
    socket.write(`-cl 👥 Connected clients:\n`);
    this.clientList.forEach((s, i) => {
      const clientName = s.clientName || "Unknown";
      socket.write(`-cl ${i}. ${clientName}\n`);
    });
    socket.write(`-cl Total Clients: ${this.clientList.length}\n`);
  }

  getClientList() {
    return this.clientList;
  }

  getClientCount() {
    return this.clientList.length;
  }
}
