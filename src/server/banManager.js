import { readFile, writeFile } from "node:fs/promises";

export class BanManager {
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

  async isBanned(ipAddress) {
    const fileBanList = await this.loadBanList();
    return this.banList.includes(ipAddress) || fileBanList.includes(ipAddress);
  }

  async banClient(socket, clientList) {
    if (!socket) return false;
    
    this.banList.push(socket.remoteAddress);
    try {
      await writeFile("banlist.txt", `${socket.remoteAddress}, `, {
        flag: "a",
      });
      
      const clientIndex = clientList.indexOf(socket);
      if (clientIndex !== -1) {
        clientList.splice(clientIndex, 1);
      }
      
      socket.end("🚫 You are banned from this server.");
      console.log(`🔨 Client ${socket.clientName} has been banned and disconnected.`);
      return true;
    } catch (error) {
      console.error("❌ Error writing to banlist file:", error.message);
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
    } catch (error) {
      if (error.code === "ENOENT") {
        console.log("📋 Ban List: No banlist.txt file found (no banned users).");
      } else {
        console.error("❌ Error accessing banlist file:", error.message);
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
    } catch (error) {
      console.error("❌ Error clearing banlist file:", error.message);
    }
  }
}
