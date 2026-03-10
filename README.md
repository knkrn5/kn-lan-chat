# TCP Chat CLI

A modular command-line interface for TCP chat server and client applications.

## 📁 Project Structure

```
tcp-chat-cli/
├── bin/
│   ├── tcps.js                 # Server CLI entry point
│   └── tcpc.js                 # Client CLI entry point
├── src/
│   ├── server/
│   │   ├── index.js            # Main server logic
│   │   ├── clientManager.js    # Client connection management
│   │   ├── banManager.js       # Ban list management
│   │   ├── commandHandler.js   # Server command handling
│   │   └── protocol.js         # Message protocol handling
│   ├── client/
│   │   ├── index.js            # Main client logic
│   │   ├── connection.js       # Server connection handling
│   │   ├── messageHandler.js   # Incoming message handling
│   │   └── inputHandler.js     # User input handling
│   └── shared/
│       ├── utils.js            # Shared utility functions
│       └── config.js           # Configuration parsing
├── package.json
└── README.md
```

## Installation

### Option 1: Install globally from the project directory
```bash
npm link
```

After installation, you can use the commands from anywhere:
- `tcp-server` - Start the TCP server
- `tcp-client` - Start the TCP client

### Option 2: Run directly with npm scripts
```bash
# Start server
npm run start:server -- [options]

# Start client  
npm run start:client -- [options]
```

## Usage

### Starting the TCP Server

```bash
# Default server (localhost:5000, random name)
tcp-server

# Custom port
tcp-server -p 8080

# Custom IP and port
tcp-server -ip 192.168.1.100 -p 7500

# Custom server name
tcp-server -sn "MyServer"

# All options combined
tcp-server -sn "ChatRoom" -ip 192.168.1.50 -p 9000
```

### Connecting with TCP Client

```bash
# Connect to server (required: -p and -ip)
tcp-client -p 5000 -ip 127.0.0.1

# Connect with custom username
tcp-client -p 5000 -ip 192.168.1.100 -cn alice

# Connect to remote server
tcp-client -p 8080 -ip 192.168.1.50 -cn john
```

## Server Commands

Once the server is running, use these commands:

- `-bc <message>` - Broadcast message to all clients
- `-cname <client> <message>` - Send private message to specific client
- `-cl` - Show list of all connected clients
- `-ban <client>` - Ban client by name
- `-bf list` - Show ban list
- `-bf clear` - Clear ban list
- `exit` - Shutdown server
- `-h` - Show help

## Client Commands

Once connected to a server:

- `-cname <name> [message]` - Send private message (sets persistent recipient)
- `-bc <message>` - Broadcast to all clients
- `-cl` - Show list of all clients
- `-cn` - Show your username
- `-rm` - Remove current recipient (exit private chat)
- `exit` - Disconnect from server
- `-h` - Show help

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any improvements or bug fixes.

## License

This project is licensed under the MIT License. See the LICENSE file for details.