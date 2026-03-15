//**  server process.stdin.on('data') command handler */
import { repeatedPrompt } from "../shared/utils.js";
import type { BanManager } from "./banManager.js";
import type { ClientManager } from "./clientManager.js";

export class ServerCommandHandler {
  private clientManager: ClientManager;
  private banManager: BanManager;
  private isAwaitingPrompt: boolean;

  constructor(clientManager: ClientManager, banManager: BanManager) {
    this.clientManager = clientManager;
    this.banManager = banManager;
    this.isAwaitingPrompt = false;
  }

  async handleCommand(input: string | Buffer) {
    const inputStr = input.toString().trim();
    const inputArr = inputStr.split(" ").filter(Boolean);

    // Broadcast message to all clients
    if (inputArr[0] === "-bc") {
      const msg = inputArr.slice(1).join(" ");
      if (!msg.trim()) {
        console.log("❌ Please provide a message to broadcast.");
        return;
      }
      this.isAwaitingPrompt = true;
      repeatedPrompt(
        "📢 Are you sure you want to broadcast this message? (y/n): ",
        () => {
          this.clientManager.broadcast(`${msg}\n`);
          console.log(`📢 ${msg}\nMessage broadcasted to all clients.`);
          this.isAwaitingPrompt = false;
        },
      );
      setTimeout(() => {
        this.isAwaitingPrompt = false;
      }, 100);
      return;
    }

    // Show client list
    if (inputArr[0] === "-cl") {
      this.clientManager.showAllClients();
      return;
    }

    // Send message to specific client using username
    if (inputArr[0] === "-cname") {
      const clientname = inputArr[1];
      if (!clientname) {
        console.log(
          "❌ Please provide a valid client name. Eg: -cname <clientname> <message>",
        );
        return;
      }
      const msg = inputArr.slice(2).join(" ");
      if (!msg.trim()) {
        console.log("❌ Please provide a message to send.");
        return;
      }
      this.clientManager.sendToClient(clientname, `${msg}\n`);
      return;
    }

    if (inputArr[0] === "-cnum") {
      const clientIndexNum = inputArr[1];
      if (!clientIndexNum || isNaN(Number(clientIndexNum))) {
        console.log(
          "❌ Please provide a valid client number. Eg: -cnum <clientnumber> <message>",
        );
        return;
      }

      const clientNum = Number(clientIndexNum);

      if (clientNum < 0) {
        console.log("❌ User number cannot be negative.\n");
        return;
      }

      const msg = inputArr.slice(2).join(" ");
      if (!msg.trim()) {
        console.log("❌ Please provide a message to send.");
        return;
      }
      this.clientManager.sendToClient(clientNum, `${msg}\n`);
      return;
    }

    // Ban file management
    if (inputArr[0] === "-bf") {
      const flag = inputArr[1];
      if (!flag) {
        console.log(
          "❌ Please provide a flag for banfile. Eg: -bf list or -bf clear",
        );
        return;
      }
      if (flag === "list") {
        await this.banManager.showBanList();
      } else if (flag === "clear") {
        await this.banManager.clearBanList();
      } else {
        console.log("❌ Invalid flag for banfile. Use 'list' or 'clear'.");
      }
      return;
    }

    // Ban a client
    if (inputArr[0] === "-ban") {
      const cname = inputArr[1];
      if (!cname) {
        console.log(
          "❌ Please provide a client name to ban. Eg: -ban <clientname>",
        );
        return;
      }
      const socket = this.clientManager.findClientByName(cname);
      if (socket) {
        await this.banManager.banClient(
          socket,
          this.clientManager.getClientList(),
        );
      } else {
        console.log(`❌ Client ${cname} not found.`);
      }
      return;
    }

    // Show help
    if (inputArr[0] === "-h" || inputArr[0] === "-help") {
      console.log(`
📋 Server Commands:
-bc <message>           Broadcast message to all clients
-cname <client> <msg>   Send private message to specific client
-cl                     Show list of all connected clients
-ban <clientname>           Ban client by name
-bf list                Show ban list
-bf clear               Clear ban list
exit                    Shutdown server
-h or -help             Show this help message
    `);
      return;
    }

    // Exit
    if (input === "exit") {
      console.log("🔌 Shutting down server...");
      process.exit(0);
    }

    console.log(
      "❌ Invalid Command! Type -h or -help to see list of all commands.",
    );
  }

  isAwaiting() {
    return this.isAwaitingPrompt;
  }
}
