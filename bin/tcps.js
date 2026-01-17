#!/usr/bin/env node

import net from "node:net";
import { readFile, writeFile } from "node:fs/promises";

// Utility functions
function strgen(length = 5) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

function isIP(s) {
  const ipv4Regex = /^(25[0-5]|2[0-4]\d|1?\d{1,2})(\.(25[0-5]|2[0-4]\d|1?\d{1,2})){3}$/;
  const ipv6Regex = /^(([0-9A-Fa-f]{1,4}:){7}[0-9A-Fa-f]{1,4}|(::)|([0-9A-Fa-f]{1,4}:){1,7}:|:([0-9A-Fa-f]{1,4}:){1,7}|([0-9A-Fa-f]{1,4}:){6}:[0-9A-Fa-f]{1,4}|([0-9A-Fa-f]{1,4}:){5}(:[0-9A-Fa-f]{1,4}){1,2}|([0-9A-Fa-f]{1,4}:){4}(:[0-9A-Fa-f]{1,4}){1,3}|([0-9A-Fa-f]{1,4}:){3}(:[0-9A-Fa-f]{1,4}){1,4}|([0-9A-Fa-f]{1,4}:){2}(:[0-9A-Fa-f]{1,4}){1,5}|[0-9A-Fa-f]{1,4}:((:[0-9A-Fa-f]{1,4}){1,6}))$/;
  return ipv4Regex.test(s) || ipv6Regex.test(s) || s === "localhost" || s === "127.0.0.1";
}

console.log("🚀 TCP Chat Server Starting...\n");

const args = process.argv.filter(Boolean);

let serverName;
let serverHostIp = "";
let serverPort = 5000;

const portFlag = args.indexOf("-p");
if (portFlag !== -1) {
  serverPort = args[portFlag + 1];
  if (isNaN(Number(serverPort))) {
    throw new Error("Please provide a valid port number. Eg: -p 5000");
  }
}

const ipFlag = args.indexOf("-ip");
if (ipFlag !== -1) {
  serverHostIp = args[ipFlag + 1];
  if (!isIP(serverHostIp)) {
    throw new Error("Please provide a valid IP address. Eg: -ip 192.168.1.1 ");
  }
}

const nameFlag = args.indexOf("-sn");
if (nameFlag !== -1) {
  serverName = args[nameFlag + 1];
  if (!serverName) {
    throw new Error("Please provide a valid server name. Eg: -sn <servername>");
  }
} else {
  serverName = strgen();
}

const clientList = [];
let isAwaitingPrompt = false;
const banList = [];

function bc(msg) {
  clientList.forEach((socket) => {
    socket.write(msg);
  });
  console.log(`📢 ${msg}Message broadcasted to all clients.`);
}

function toClient(cname, msg) {
  if (!cname) {
    console.log("Please enter Client name. Eg: -cname <clientname> <message>");
    return;
  }
  const targetSocket = clientList.find((socket) => socket.clientName === cname);
  if (targetSocket) {
    targetSocket.write(msg);
    console.log(`📤 Message sent to ${cname}: ${msg.trim()}`);
  } else {
    console.log(`❌ ${cname} This client Name does not exist on this server.`);
  }
}

function reapedtedPrompt(msg, cb) {
  isAwaitingPrompt = true;
  process.stdout.write(msg);
  process.stdin.once("data", (data) => {
    const answer = data.toString().trim().toLowerCase();
    if (answer === "y") {
      cb && cb();
      isAwaitingPrompt = false;
    } else if (answer === "n") {
      console.log("❌ Cancelled");
      isAwaitingPrompt = false;
    } else {
      console.log("Please enter 'y' or 'n'");
      reapedtedPrompt(msg, cb);
    }
  });
}

function showAllClients() {
  console.log(`\n👥 List of all Clients connected to ${serverName} TCP server:`);
  if (clientList.length === 0) {
    console.log("No clients connected.");
  } else {
    clientList.forEach((socket, i) => {
      const clientAddress = `${socket.remoteAddress}:${socket.remotePort}`;
      console.log(`${i}. ${socket.clientName} - ${clientAddress}`);
    });
  }
  console.log(`Total Clients: ${clientList.length}\n`);
}

async function banClient(cname) {
  const clientIndex = clientList.findIndex(socket => socket.clientName === cname);
  if (clientIndex !== -1) {
    const socket = clientList[clientIndex];
    banList.push(socket.remoteAddress);
    try {
      await writeFile("banlist.txt", `${socket.remoteAddress}, `, {
        flag: "a",
      });
      clientList.splice(clientIndex, 1);
      socket.end("🚫 You are banned from this server.");
      console.log(`🔨 Client ${cname} has been banned and disconnected.`);
    } catch (error) {
      console.error("❌ Error writing to banlist file:", error.message);
    }
  } else {
    console.log(`❌ Client ${cname} not found.`);
  }
}

async function banFile(flag) {
  try {
    if (flag === "list") {
      const banListFile = await readFile("banlist.txt", {
        encoding: "utf-8",
        flag: "r",
      });
      console.log("📋 Ban List:");
      console.log(banListFile || "No banned IPs found.");
      return;
    }

    if (flag === "clear") {
      await writeFile("banlist.txt", "", {
        flag: "w",
      });
      console.log("✅ Banlist cleared.");
      return;
    }

    console.log("❌ Invalid flag for banfile. Use 'list' or 'clear'.");
  } catch (error) {
    if (flag === "list" && error.code === "ENOENT") {
      console.log("📋 Ban List: No banlist.txt file found (no banned users).");
    } else {
      console.error("❌ Error accessing banlist file:", error.message);
    }
  }
}

async function inputExecuter(input) {
  const inputArr = input.split(" ").filter(Boolean);

  if (inputArr[0] === "-bc") {
    const msg = inputArr.slice(1).join(" ");
    if (!msg.trim()) {
      console.log("❌ Please provide a message to broadcast.");
      return;
    }
    reapedtedPrompt("📢 Are you sure you want to broadcast this message? (y/n): ", () => {
      bc(`${msg}\n`);
    });
    return;
  }

  if (input === "-cl") {
    showAllClients();
    return;
  }

  if (inputArr[0] === "-cname") {
    const clientname = inputArr[1];
    const msg = inputArr.slice(2).join(" ");
    if (!msg.trim()) {
      console.log("❌ Please provide a message to send.");
      return;
    }
    toClient(clientname, `${msg}\n`);
    return;
  }

  if (inputArr[0] === "-bf") {
    const flag = inputArr[1];
    if (!flag) {
      console.log("❌ Please provide a flag for banfile. Eg: -bf list or -bf clear");
      return;
    }
    await banFile(flag);
    return;
  }

  if (inputArr[0] === "-ban") {
    const cname = inputArr[1];
    if (!cname) {
      console.log("❌ Please provide a client name to ban. Eg: -ban <clientname>");
      return;
    }
    await banClient(cname);
    return;
  }

  if (input === "-h" || input === "-help") {
    console.log(`
📋 Server Commands:
-bc <message>           Broadcast message to all clients
-cname <client> <msg>   Send private message to specific client
-cl                     Show list of all connected clients
-ban <client>           Ban client by name
-bf list                Show ban list
-bf clear               Clear ban list
exit                    Shutdown server
-h or -help             Show this help message
    `);
    return;
  }

  console.log("❌ Invalid Command! Type -h or -help to see list of all commands.");
}

process.stdin.on("data", (data) => {
  if (isAwaitingPrompt) return; // ignore while waiting for y/n
  const input = data.toString().trim();

  if (input.startsWith("-")) {
    inputExecuter(input);
    return;
  }

  if (input === "exit") {
    console.log("🔌 Shutting down server...");
    process.exit(0);
  }

  console.log("❌ Invalid Command! Type -h or -help to see list of all commands.");
});

const tcpServer = net.createServer(async (ccsocket) => {
  clientList.push(ccsocket);
  const clientAddress = `${ccsocket.remoteAddress}:${ccsocket.remotePort}`;
  console.log(`🔗 New client connected: ${clientAddress}`);

  // Check ban list
  try {
    const banListFile = await readFile("banlist.txt", {
      encoding: "utf-8",
      flag: "r",
    });

    const filteredBanListFile = banListFile.split(", ").filter(Boolean);

    if (
      banList.includes(ccsocket.remoteAddress) ||
      filteredBanListFile.includes(ccsocket.remoteAddress)
    ) {
      ccsocket.end("🚫 You are banned from this server");
      console.log(`🚫 Banned IP ${ccsocket.remoteAddress} attempted to connect`);
      return;
    }
  } catch (error) {
    // Ban file doesn't exist, continue
  }

  ccsocket.on("data", (data) => {
    data = data.toString().trim();
    const dataArr = data.split(" ").filter(Boolean);

    console.log(`💬 ${ccsocket.clientName || 'Unknown'}-> ${data}`);

    if (dataArr[0] === "-ccn") {
      let clientName = dataArr[1];
      if (clientName === "null" || !clientName) {
        clientName = strgen();
      }
      
      // Check if name already exists
      const nameExists = clientList.some(socket => socket.clientName === clientName && socket !== ccsocket);
      if (nameExists) {
        ccsocket.write(`❌ Username '${clientName}' already exists. Please choose a different name.\n`);
        return;
      }
      
      ccsocket.clientName = clientName;
      ccsocket.write(
        `✅ ${clientName} Welcome to the ${serverName} TCP server!\nType -h or -help to see list of all commands.\n`
      );
      bc(`👋 New client joined: ${clientName}\n`);
    }

    if (dataArr[0] === "-cnum") {
      const usernumber = parseInt(dataArr[1], 10);
      const message = dataArr.slice(2).join(" ");

      if (isNaN(usernumber)) {
        ccsocket.write("❌ Please enter a valid user number.\n");
        return;
      } else if (usernumber < 0) {
        ccsocket.write("❌ User number cannot be negative.\n");
        return;
      } else if (usernumber >= clientList.length) {
        ccsocket.write("❌ User number out of range.\n");
        return;
      }

      const targetSocket = clientList[usernumber];
      targetSocket.write(`-cname ${ccsocket.clientName} ${message.trim()}\n`);
      return;
    }

    if (dataArr[0] === "-cname") {
      const clientName = dataArr[1]?.trim();
      const msg = dataArr.slice(2).join(" ");

      if (!clientName) {
        ccsocket.write("❌ Please specify a client name.\n");
        return;
      }

      const targetSocket = clientList.find((socket) => socket.clientName === clientName);

      if (targetSocket) {
        if (!msg.trim()) {
          return;
        }
        targetSocket.write(`-cname ${ccsocket.clientName} ${msg.trim()}\n`);
      } else {
        ccsocket.write(
          `❌ ${clientName} - This client does not exist. Type -cl to see list of all clients.\n`
        );
      }
    }

    if (data === "-cn") {
      ccsocket.write(`👤 Your client name is: ${ccsocket.clientName}\n`);
    }

    if (data === "-cl") {
      ccsocket.write(`-cl 👥 Connected clients:\n`);
      clientList.forEach((socket, i) => {
        const clientName = socket.clientName || 'Unknown';
        ccsocket.write(`-cl ${i}. ${clientName}\n`);
      });
      ccsocket.write(`-cl Total Clients: ${clientList.length}\n`);
      return;
    }

    if (data.startsWith("-bc")) {
      let clientsBoardcastmsg = data.substring(4);
      if (!clientsBoardcastmsg.trim()) {
        ccsocket.write("❌ Please provide a message to broadcast.\n");
        return;
      }

      clientList.forEach((socket) => {
        if (socket !== ccsocket) {
          socket.write(
            `-bc 📢 ${ccsocket.clientName} broadcasted: ${clientsBoardcastmsg}\n`
          );
        }
      });
      ccsocket.write("✅ Message broadcasted to all clients.\n");
    }

    if (data === "-h" || data === "-help") {
      ccsocket.write(`
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

    if (data === "exit") {
      console.log(`👋 Client ${ccsocket.clientName || clientAddress} disconnected.`);
      ccsocket.end();
      return;
    }
  });

  ccsocket.on("error", (err) => {
    if (err.code === "ECONNRESET") {
      console.error(`🔌 Connection was reset by client: ${clientAddress}`);
      return;
    }
    console.error(`❌ Socket error: ${err.message}`);
  });

  ccsocket.on("close", () => {
    const clientName = ccsocket.clientName || clientAddress;
    console.log(`👋 Client disconnected: ${clientName}`);
    if (ccsocket.clientName) {
      bc(`👋 Client disconnected: ${ccsocket.clientName}\n`);
    }
    clientList.splice(clientList.indexOf(ccsocket), 1);
  });
});

tcpServer.listen(serverPort, serverHostIp, () => {
  const addr = tcpServer.address();
  console.log(`🎯 ${serverName} TCP server listening on ${addr.address}:${addr.port}`);
  console.log("💡 Type -h for help or start managing your server!\n");
});

tcpServer.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.error(`❌ Port ${serverPort} is already in use. Please choose a different port.`);
  } else if (err.code === "EACCES") {
    console.error(`❌ Permission denied. Cannot bind to port ${serverPort}.`);
  } else {
    console.error(`❌ Server error: ${err.message}`);
  }
  process.exit(1);
});