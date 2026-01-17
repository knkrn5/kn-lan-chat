#!/usr/bin/env node

import net from "node:net";

// Utility functions
function reapedtedPrompt(msg, cb) {
  process.stdout.write(msg);
  process.stdin.once("data", (data) => {
    const answer = data.toString().trim().toLowerCase();
    if (answer === "y") {
      cb && cb();
    } else if (answer === "n") {
      console.log("❌ Cancelled");
    } else {
      console.log("Please enter 'y' or 'n'");
      reapedtedPrompt(msg, cb);
    }
  });
}

function isIP(s) {
  const ipv4Regex = /^(25[0-5]|2[0-4]\d|1?\d{1,2})(\.(25[0-5]|2[0-4]\d|1?\d{1,2})){3}$/;
  const ipv6Regex = /^(([0-9A-Fa-f]{1,4}:){7}[0-9A-Fa-f]{1,4}|(::)|([0-9A-Fa-f]{1,4}:){1,7}:|:([0-9A-Fa-f]{1,4}:){1,7}|([0-9A-Fa-f]{1,4}:){6}:[0-9A-Fa-f]{1,4}|([0-9A-Fa-f]{1,4}:){5}(:[0-9A-Fa-f]{1,4}){1,2}|([0-9A-Fa-f]{1,4}:){4}(:[0-9A-Fa-f]{1,4}){1,3}|([0-9A-Fa-f]{1,4}:){3}(:[0-9A-Fa-f]{1,4}){1,4}|([0-9A-Fa-f]{1,4}:){2}(:[0-9A-Fa-f]{1,4}){1,5}|[0-9A-Fa-f]{1,4}:((:[0-9A-Fa-f]{1,4}){1,6}))$/;
  return ipv4Regex.test(s) || ipv6Regex.test(s) || s === "localhost" || s === "127.0.0.1";
}

console.log("🚀 TCP Chat Client Starting...\n");

const args = process.argv.filter(Boolean);

let serverPort;
let serverIp;
let clientName = null;
let recepentName;

const portFlag = args.indexOf("-p");
if (portFlag === -1) {
  throw new Error("❌ Please provide server port using -p <server's port number>");
} else {
  serverPort = args[portFlag + 1];
  if (isNaN(Number(serverPort))) {
    throw new Error("❌ Please provide a valid port number. Eg: -p 5000");
  }
}

const ipFlag = args.indexOf("-ip");
if (ipFlag === -1) {
  throw new Error("❌ Please provide server IP using -ip <server ip address>");
} else {
  serverIp = args[ipFlag + 1];
  if (!isIP(serverIp)) {
    throw new Error("❌ Please provide a valid IP address. Eg: -ip 192.168.1.1");
  }
}

const nameFlag = args.indexOf("-cn");
if (nameFlag !== -1) {
  clientName = args[nameFlag + 1];
  if (!clientName) {
    throw new Error("❌ Please provide a valid client name. Eg: -cn <clientname>");
  }
}

console.log(`🔄 Connecting to TCP server at ${serverIp}:${serverPort}...`);

const socket = net.createConnection(serverPort, serverIp, () => {
  console.log(
    `✅ Connected to server! ${socket.remoteAddress}:${socket.remotePort}`
  );
  socket.write(`-ccn ${clientName}`);
  if (clientName) {
    console.log(`👤 Joining as: ${clientName}`);
  } else {
    console.log("👤 Server will assign a random username");
  }
  console.log("💡 Type -h for help or start chatting!\n");
});

socket.on("data", (data) => {
  data = data.toString().trim();
  const dataArr = data.split(" ").filter(Boolean);

  if (dataArr[0] === "-cname") {
    const senderName = dataArr[1].trim();
    const msg = dataArr.slice(2).join(" ");
    console.log(`📩 ${senderName}: ${msg.trim()}`);
    return;
  }

  if (dataArr[0] === "-bc") {
    const msg = dataArr.slice(1).join(" ");
    console.log(`📢 ${msg.trim()}`);
    return;
  }

  if (dataArr[0] === "-cl") {
    const filteredArr = dataArr.map((str) => str.replace(/-cl$/, ""));
    const msg = filteredArr.join(" ");
    console.log(msg);
    return;
  }

  console.log(`🖥️  ${data}`);
});

socket.on("error", (err) => {
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
});

socket.on("close", () => {
  console.log("🔌 Disconnected from server. Goodbye!");
  process.exit(0);
});

function handleUserInput(data) {
  data = data.toString().trim();
  const dataArr = data.split(" ").filter(Boolean);

  if (dataArr[0] === "-rm") {
    recepentName = null;
    console.log("🔄 Recipient removed. Messages will now be treated as commands.");
    return;
  }

  if (dataArr[0] === "-cname") {
    const newRecepent = dataArr[1]?.trim();
    const message = dataArr.slice(2).join(" ");
    
    if (!newRecepent) {
      console.log("❌ Please provide a valid client name. Eg: -cname <clientname> [message]");
      return;
    }
    
    recepentName = newRecepent;
    
    if (message.trim()) {
      console.log(`📤 To ${recepentName}: ${message}`);
      socket.write(data);
    } else {
      console.log(`💬 Recipient set to ${recepentName}. Type your message:`);
    }
    return;
  }

  // If we have a recipient and this isn't a command, send to recipient
  if (recepentName && !data.startsWith("-")) {
    console.log(`📤 To ${recepentName}: ${data}`);
    socket.write(`-cname ${recepentName} ${data}`);
    return;
  }

  if (dataArr[0] === "-bc") {
    const message = dataArr.slice(1).join(" ");
    if (!message.trim()) {
      console.log("❌ Please provide a message to broadcast.");
      return;
    }
    reapedtedPrompt("📢 Are you sure you want to broadcast this message? (y/n): ", () => {
      socket.write(data);
      console.log("✅ Broadcast sent!");
    });
    return;
  }

  if (data === "-h" || data === "-help") {
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

  if (data === "exit") {
    console.log("👋 Disconnecting from server...");
    socket.end();
    return;
  }

  // Send command to server
  socket.write(data);
}

process.stdin.on("data", handleUserInput);

// Handle Ctrl+C gracefully
process.on("SIGINT", () => {
  console.log("\n👋 Disconnecting from server...");
  socket.end();
});