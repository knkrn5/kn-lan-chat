import { parseClientConfig } from '../shared/config.js';
import { createConnection } from './connection.js';
import { MessageHandler } from './messageHandler.js';
import { InputHandler } from './inputHandler.js';

export function startClient() {
  console.log("🚀 TCP Chat Client Starting...\n");

  const { serverPort, serverIp, clientName } = parseClientConfig();
  const messageHandler = new MessageHandler();
  let inputHandler;

  const socket = createConnection(
    serverIp,
    serverPort,
    // onConnect
    (socket) => {
      socket.write(`-ccn ${clientName}`);
      if (clientName) {
        console.log(`👤 Joining as: ${clientName}`);
      } else {
        console.log("👤 Server will assign a random username");
      }
      console.log("💡 Type -h for help or start chatting!\n");

      // Setup input handling after connection
      inputHandler = new InputHandler(socket);
      inputHandler.setupInputHandling();
    },
    // onData
    (data) => {
      messageHandler.handleServerMessage(data);
    },
    // onError
    (err) => {
      if (err.code === "ECONNREFUSED") {
        console.error("❌ Connection refused by the server. Is the server running?");
        return;
      }
      if (err.code === "ETIMEDOUT") {
        console.error("❌ Connection timed out. The IP address or port number might be wrong.");
        process.exit(0);
      }
      if (err.code === "ECONNRESET") {
        console.error("❌ Connection was reset by the server.");
        return;
      }
      console.error(`❌ Server error: ${err.message}`);
    },
    // onClose
    () => {
      console.log("🔌 Disconnected from server. Goodbye!");
      process.exit(0);
    }
  );
}
