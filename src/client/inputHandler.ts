//** client's process.stdin handler */
import { repeatedPrompt } from "../shared/utils.js";
import type { Socket } from "node:net";



export class InputHandler {
  socket: Socket;
  private recipientName: string | null = null;

  constructor(socket: Socket) {
    this.socket = socket;
    this.recipientName = null;
  }

  handleClientInput(input: string | Buffer) {
    const inputStr = input.toString().trim();
    const inputArr = inputStr.split(" ").filter(Boolean);

    // Remove recipient
    if (inputArr[0] === "-rm") {
      this.recipientName = null;
      console.log(
        "🔄 Recipient removed. Messages will now be treated as commands.",
      );
      return;
    }

    // Set recipient
    if (inputArr[0] === "-cname") {
      const newRecipient = inputArr[1]?.trim();
      const message = inputArr.slice(2).join(" ");

      if (!newRecipient) {
        console.log(
          "❌ Please provide a valid client name. Eg: -cname <clientname> [message]",
        );
        return;
      }

      this.recipientName = newRecipient;

      if (message.trim()) {
        console.log(`📤 To ${this.recipientName}: ${message}`);
        this.socket.write(inputStr);
      } else {
        console.log(
          `💬 Recipient set to ${this.recipientName}. Type your message:`,
        );
      }
      return;
    }

    // If we have a recipient and this isn't a command, send to recipient
    if (this.recipientName && !inputStr.startsWith("-")) {
      console.log(`📤 To ${this.recipientName}: ${inputStr}`);
      this.socket.write(`-cname ${this.recipientName} ${inputStr}`);
      return;
    }

    // Broadcast message
    if (inputArr[0] === "-bc") {
      const message = inputArr.slice(1).join(" ");
      if (!message.trim()) {
        console.log("❌ Please provide a message to broadcast.");
        return;
      }
      repeatedPrompt(
        "📢 Are you sure you want to broadcast this message? (y/n): ",
        () => {
          this.socket.write(inputStr);
          console.log("✅ Broadcast sent!");
        },
      );
      return;
    }

    // Show help
    if (inputStr === "-h" || inputStr === "-help") {
      console.log(`
📋 Available Commands:
-ccn <name>             Set your client name
-cnum <number> <msg>    Send message to client by number
-cname <name> [msg]     Send message to client by name (sets persistent recipient)
-cn                     Show your current client name
-cl                     Show list of all connected clients
-bc <msg>               Broadcast message to all clients
-rm                     Remove current recipient (exit private chat mode)
exit                    Disconnect from server
-h or -help             Show this help message

💡 Tips:
- Use -cname <name> to start private chat mode
- In private chat mode, type messages directly without commands
- Use -rm to exit private chat mode
- Use -bc to broadcast even in private chat mode
    `);
      return;
    }

    // Exit
    if (inputStr === "exit") {
      console.log("👋 Disconnecting from server...");
      this.socket.end();
      return;
    }

    // Send command/message to server
    this.socket.write(inputStr);
  }

  setupInputHandling() {
    process.stdin.on("data", (data) => {
      this.handleClientInput(data);
    });

    // Handle Ctrl+C gracefully
    process.on("SIGINT", () => {
      console.log("\n👋 Disconnecting from server...");
      this.socket.end();
    });
  }
}
