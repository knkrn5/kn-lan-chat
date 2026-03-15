import { readFile, writeFile } from "node:fs/promises";
import type { ClientSocket } from "../types/types.js";

export class BanManager {
  private banList: string[];

  constructor() {
    this.banList = [];
  }

  async loadBanList() {
    try {
      const banListFile = await readFile("banlist.txt", {
        encoding: "utf-8",
        flag: "r",
      });
      return banListFile.split(", ").filter(Boolean);
    } catch (error) {
      return [];
    }
  }

  async isBanned(ipAddress: string) {
    const fileBanList = await this.loadBanList();
    return this.banList.includes(ipAddress) || fileBanList.includes(ipAddress);
  }

  async banClient(socket: ClientSocket, clientList: ClientSocket[]) {
    const ip = socket.remoteAddress;
    if (!ip) {
      console.log("Client has no remoteAddress, cannot ban.");
      return false;
    }

    this.banList.push(ip);
    try {
      await writeFile("banlist.txt", `${socket.remoteAddress}, `, {
        flag: "a",
      });

      const clientIndex = clientList.indexOf(socket);
      if (clientIndex !== -1) {
        clientList.splice(clientIndex, 1);
      }

      socket.end("🚫 You are banned from this server.");
      console.log(
        `🔨 Client ${socket.clientName} has been banned and disconnected.`,
      );
      return true;
    } catch (error: any) {
      console.error(
        "❌ Error writing to banlist file:",
        (error as Error).message,
      );
      return false;
    }
  }

  async showBanList() {
    try {
      const banListFile = await readFile("banlist.txt", {
        encoding: "utf-8",
        flag: "r",
      });
      console.log("📋 Ban List:");
      console.log(banListFile || "No banned IPs found.");
    } catch (error: any) {
      if (error.code === "ENOENT") {
        console.log(
          "📋 Ban List: No banlist.txt file found (no banned users).",
        );
      } else {
        console.error(
          "❌ Error accessing banlist file:",
          (error as Error).message,
        );
      }
    }
  }

  async clearBanList() {
    try {
      await writeFile("banlist.txt", "", {
        flag: "w",
      });
      this.banList = [];
      console.log("✅ Banlist cleared.");
    } catch (error: any) {
      console.error(
        "❌ Error clearing banlist file:",
        (error as Error).message,
      );
    }
  }
}
