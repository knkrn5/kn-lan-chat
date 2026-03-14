import { isValidIP, strgen } from "./utils.js";

export function parseServerConfig() {
  const args = process.argv.filter(Boolean);

  let serverName: string | undefined;
  let serverHostIp: string = "";
  let serverPort: number = 5000;

  const portFlag = args.indexOf("-p");
  if (portFlag !== -1) {
    const portArg = args[portFlag + 1];
    if (!portArg || Number.isNaN(Number(portArg))) {
      throw new Error("Please provide a valid port number. Eg: -p 5000");
    }
    serverPort = Number(portArg);
  }

  const ipFlag = args.indexOf("-ip");
  if (ipFlag !== -1) {
    const ipArg = args[ipFlag + 1];
    if (!ipArg || !isValidIP(ipArg)) {
      throw new Error(
        "Please provide a valid IP address. Eg: -ip 192.168.1.1 ",
      );
    }
    serverHostIp = ipArg;
  }

  const serverNameFlag = args.indexOf("-sn");
  if (serverNameFlag !== -1) {
    serverName = args[serverNameFlag + 1];
    if (!serverName) {
      throw new Error(
        "Please provide a valid server name. Eg: -sn <servername>",
      );
    }
  } else {
    serverName = strgen();
  }

  return { serverName, serverHostIp, serverPort };
}

export function parseClientConfig() {
  const args = process.argv.filter(Boolean);

  let serverPort: number;
  let serverIp: string;
  let clientName: string | undefined = undefined;

  const portFlag = args.indexOf("-p");
  if (portFlag === -1) {
    throw new Error(
      "❌ Please provide server port using -p <server's port number>",
    );
  } else {
    const portArg = args[portFlag + 1];
    if (!portArg || isNaN(Number(portArg))) {
      throw new Error("❌ Please provide a valid port number. Eg: -p 5000");
    }
    serverPort = Number(portArg);
  }

  const ipFlag = args.indexOf("-ip");
  if (ipFlag === -1) {
    throw new Error(
      "❌ Please provide server IP using -ip <server ip address>",
    );
  } else {
    const ipArg = args[ipFlag + 1];
    if (!ipArg || !isValidIP(ipArg)) {
      throw new Error(
        "❌ Please provide a valid IP address. Eg: -ip 192.168.1.1",
      );
    }
    serverIp = ipArg;
  }

  const ClientNameFlag = args.indexOf("-cn");
  if (ClientNameFlag !== -1) {
    clientName = args[ClientNameFlag + 1];
    if (!clientName || clientName.length < 5) {
      throw new Error(
        "❌ Please provide a valid client name. Eg: -cn <clientname>, minimum length 5 characters",
      );
    }
  }

  return { serverPort, serverIp, clientName };
}
