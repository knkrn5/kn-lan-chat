import { isIP, strgen } from './utils.js';

export function parseServerConfig() {
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

  return { serverName, serverHostIp, serverPort };
}

export function parseClientConfig() {
  const args = process.argv.filter(Boolean);

  let serverPort;
  let serverIp;
  let clientName = null;

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

  return { serverPort, serverIp, clientName };
}
