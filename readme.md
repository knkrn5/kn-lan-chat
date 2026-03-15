# TCP LAN Chat CLI App

A TypeScript + Node.js TCP chat application with a server CLI and client CLI.
It supports multiple connected clients, private messaging, broadcast messaging, client listing, and IP ban management.

## Client Commands

- `-ccn <name>`: set/change your client name
- `-cnum <number> <msg>`: send message to client by list index
- `-cname <name> <msg>`: send private message by client name
- `-cname <name>`: set persistent private recipient mode
- `-rm`: clear persistent recipient mode
- `-cn`: show your current client name
- `-cl`: list connected clients
- `-bc <msg>`: broadcast to all clients (with y/n confirmation)
- `-h` or `-help`: show command help
- `exit`: disconnect client

Persistent recipient mode flow:

```text
1) Run: -cname alice
2) Type plain messages (without command prefix)
3) Messages are sent to alice automatically
4) Run: -rm to exit this mode
```

## Server Commands

- `-bc <msg>`: broadcast server message to all clients (with y/n confirmation)
- `-cname <clientname> <msg>`: send private message to client by name
- `-cnum <clientIndex> <msg>`: send private message to client by index
- `-cl`: show all connected clients on the server console
- `-ban <clientname>`: ban client by name and disconnect them
- `-bf list`: show ban list from `banlist.txt`
- `-bf clear`: clear `banlist.txt`
- `-h` or `-help`: show command help
- `exit`: intended to stop server (use `Ctrl+C` as the reliable shutdown path)

## Message Routing Behavior

- Private by name:
  - Client sends: `-cname <target> <msg>`
  - Recipient receives formatted private message.
- Private by number:
  - Uses the index from `-cl` list.
- Broadcast:
  - Sent to all other clients.
  - Sender gets success feedback.

## Ban System

- Bans are IP-based.
- `BanManager` stores in-memory bans and appends to `banlist.txt`.
- On new connection, server checks both in-memory list and file list.
- Banned clients are disconnected with a rejection message.

If installed globally from npm, binaries are:

```bash
npm i -g kn-lan-chat
```

- `klcs` -> start server
- `klcc` -> start client

## Quick Local Test

Terminal 1:

```bash
klcs -- -p 5000 -ip localhost -sn TestServer
```

Terminal 2:

```bash
klcc -- -p 5000 -ip localhost -cn karan1
```

Terminal 3:

```bash
klcc -- -p 5000 -ip localhost -cn user22
```

Then test:

- `-cl`
- `-cname user22 hello`
- `-bc hello everyone`
- `-ban user22` from server terminal

## License

MIT
