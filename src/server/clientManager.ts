import { strgen } from "../shared/utils.js";
import type { ClientSocket } from "../types/types.js";

export class ClientManager {
  private serverName: string;
  private clientList: ClientSocket[];

  constructor(serverName: string) {
    this.serverName = serverName;
    this.clientList = [];
  }

  addClient(socket: ClientSocket) {
    this.clientList.push(socket);
  }

  removeClient(socket: ClientSocket) {
    const index = this.clientList.indexOf(socket);
    if (index !== -1) {
      this.clientList.splice(index, 1);
    }
  }

  findClientByName(clientName: string) {
    return this.clientList.find((socket) => socket.clientName === clientName);
  }

  findClientByIndex(index: number) {
    return this.clientList[index];
  }

  isNameTaken(clientName: string) {
    return this.clientList.some((socket) => socket.clientName === clientName);
  }

  broadcast(message: string, excludeSocket?: ClientSocket) {
    this.clientList.forEach((socket) => {
      if (socket !== excludeSocket && !socket.destroyed) {
        socket.write(message);
      }
    });
  }

  sendToClient(clientIdentity: string | number, message: string) {
    let targetSocket: ClientSocket | undefined;
    let clientName: string | undefined;

    if (typeof clientIdentity === "string") {
      clientName = clientIdentity;
      targetSocket = this.findClientByName(clientIdentity);
    } else {
      targetSocket = this.findClientByIndex(clientIdentity);
      clientName = targetSocket?.clientName;
    }

    if (targetSocket) {
      targetSocket.write(message);
      console.log(`Message sent to ${clientName}: ${message.trim()}`);
      return true;
    }

    console.log(
      `${clientName ?? clientIdentity} does not exist on this server.`,
    );
    return false;
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

  handleClientNameSet(socket: ClientSocket, requestedName: string) {
    let clientName = requestedName;

    if (clientName === "null" || !clientName || clientName === "undefined") {
      clientName = strgen();
    }

    if (this.isNameTaken(clientName)) {
      socket.write(
        `-err ❌ Username '${clientName}' already exists. Please choose a different name.\n`,
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

  sendClientList(socket: ClientSocket) {
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
