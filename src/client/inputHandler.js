import { repeatedPrompt } from '../shared/utils.js';

export class InputHandler {
  constructor(socket) {
    this.socket = socket;
    this.recipientName = null;
  }

  handleUserInput(data) {
    const dataStr = data.toString().trim();
    const dataArr = dataStr.split(" ").filter(Boolean);

    // Remove recipient
    if (dataArr[0] === "-rm") {
      this.recipientName = null;
      console.log("🔄 Recipient removed. Messages will now be treated as commands.");
      return;
    }

    // Set recipient
    if (dataArr[0] === "-cname") {
      const newRecipient = dataArr[1]?.trim();
      const message = dataArr.slice(2).join(" ");

      if (!newRecipient) {
        console.log("❌ Please provide a valid client name. Eg: -cname <clientname> [message]");
        return;
      }

      this.recipientName = newRecipient;

      if (message.trim()) {
        console.log(`📤 To ${this.recipientName}: ${message}`);
        this.socket.write(dataStr);
      } else {
        console.log(`💬 Recipient set to ${this.recipientName}. Type your message:`);
      }
      return;
    }

    // If we have a recipient and this isn't a command, send to recipient
    if (this.recipientName && !dataStr.startsWith("-")) {
      console.log(`📤 To ${this.recipientName}: ${dataStr}`);
      this.socket.write(`-cname ${this.recipientName} ${dataStr}`);
      return;
    }

    // Broadcast message
    if (dataArr[0] === "-bc") {
      const message = dataArr.slice(1).join(" ");
      if (!message.trim()) {
        console.log("❌ Please provide a message to broadcast.");
        return;
      }
      repeatedPrompt("📢 Are you sure you want to broadcast this message? (y/n): ", () => {
        this.socket.write(dataStr);
        console.log("✅ Broadcast sent!");
      });
      return;
    }

    // Show help
    if (dataStr === "-h" || dataStr === "-help") {
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
    if (dataStr === "exit") {
      console.log("👋 Disconnecting from server...");
      this.socket.end();
      return;
    }

    // Send command/message to server
    this.socket.write(dataStr);
  }

  setupInputHandling() {
    process.stdin.on("data", (data) => this.handleUserInput(data));

    // Handle Ctrl+C gracefully
    process.on("SIGINT", () => {
      console.log("\n👋 Disconnecting from server...");
      this.socket.end();
    });
  }
}
