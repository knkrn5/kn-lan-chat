# Contribution Guide

Thank you for contributing to this project.

## Overview

- Runtime protocol: TCP (`node:net`)
- Entry points:
  - Server: `src/server/tcps.ts`
  - Client: `src/client/tcpc.ts`
- Build output: `dist/**`
- Publishable CLI binaries:
  - `klcs` -> `dist/server/tcps.js`
  - `klcc` -> `dist/client/tcpc.js`

## Project Structure

```text
tcp-chat-cli/
├── src/
│   ├── client/
│   │   ├── tcpc.ts                  # Client bootstrap and socket lifecycle
│   │   ├── clientCommandHandler.ts  # Client stdin command handling
│   │   └── serverResponseHandler.ts # Client-side parsing of server responses
│   ├── server/
│   │   ├── tcps.ts                  # Server bootstrap and socket lifecycle
│   │   ├── serverCommandHandler.ts  # Server stdin command handling
│   │   ├── clientMessageHandler.ts  # Server-side parser for client messages
│   │   ├── clientManager.ts         # Client registry and routing helpers
│   │   └── banManager.ts            # Ban list persistence and checks
│   ├── shared/
│   │   ├── config.ts                # CLI flag parsing and validation
│   │   └── utils.ts                 # IP validation, random name, prompt helper
│   └── types/
│       └── types.ts                 # Socket type augmentation (`clientName`)
├── dist/                            # Compiled JS output
├── banlist.txt                      # Created/updated at runtime when using bans
├── package.json
└── readme.md
```

## Requirements

- Node.js 18+
- npm

## Install

```bash
npm install
```

## Scripts

```bash
npm run server   # runs src/server/tcps.ts via tsx
npm run client   # runs src/client/tcpc.ts via tsx
npm run build    # compiles TypeScript to dist/
```

## Start The Server

```bash
npm run server -- [-p <port>] [-ip <host_ip>] [-sn <server_name>]
```

Flags:

- `-p <port>`: optional, default `5000`
- `-ip <host_ip>`: optional, default empty string (bind all interfaces)
- `-sn <server_name>`: optional, default random generated name

Examples:

```bash
npm run server
npm run server -- -p 7000
npm run server -- -ip 192.168.1.10 -p 7000 -sn OfficeChat
```

## Start A Client

```bash
npm run client -- -p <server_port> -ip <server_ip> [-cn <client_name>]
```

Flags:

- `-p <server_port>`: required
- `-ip <server_ip>`: required (`IPv4`, `IPv6`, or `localhost`)
- `-cn <client_name>`: optional. If provided, minimum length is `5`.

Examples:

```bash
npm run client -- -p 5000 -ip localhost
npm run client -- -p 5000 -ip 192.168.1.10 -cn karan1
```

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

## Validation And Error Handling

- Server startup errors:
  - `EADDRINUSE`: port already in use
  - `EACCES`: insufficient permissions
- Client connection errors:
  - `ECONNREFUSED`: server not available
  - `ETIMEDOUT`: wrong IP/port or network problem
  - `ECONNRESET`: server reset connection
- CLI argument validation:
  - Port must be numeric
  - IP must be valid or `localhost`
  - Optional `-cn` value must be at least 5 chars

## Build And Publish

Build:

```bash
npm run build
```

Package currently publishes compiled JS from `dist/**/*.js` using the `files` field in `package.json`.

## Scope

This repository contains a TCP LAN chat CLI implemented in TypeScript.
The source code lives in `src/` and builds to `dist/`.

## Prerequisites

- Node.js 18+
- npm

## Local Setup

```bash
npm install
npm run build
```

Run server and client in separate terminals:

```bash
npm run server -- -p 5000 -ip localhost -sn DevServer
npm run client -- -p 5000 -ip localhost -cn user01
```

## Project Layout

- `src/server/`: server bootstrap, command handling, message routing, client management, ban management
- `src/client/`: client bootstrap, stdin command handling, server response handling
- `src/shared/`: config parsing and shared utilities
- `src/types/`: shared types and Socket augmentation

## Development Workflow

1. Create a branch from your default branch.
2. Make focused changes for one concern at a time.
3. Build before committing:

```bash
npm run build
```

4. Manually validate key flows:

- client connects
- private messaging by name and index
- broadcast flow
- `-cl` listing
- ban and ban-file commands

## Coding Guidelines

- Keep TypeScript changes small and readable.
- Prefer descriptive names over short abbreviations.
- Preserve existing CLI command behavior unless intentionally changing it.
- Update docs when behavior or flags change.
- Avoid committing generated tarballs and local runtime artifacts.

## Commit Message Suggestions

Use clear, action-oriented messages, for example:

- `fix(server): validate client index for -cnum`
- `feat(client): add persistent recipient mode docs`
- `docs: update README command examples`

## Pull Request Checklist

- [ ] Code builds successfully (`npm run build`)
- [ ] README/docs updated for user-facing changes
- [ ] No unrelated refactors bundled with the change
- [ ] Error messages remain clear and consistent
- [ ] Manual behavior checks completed

## Reporting Issues

When opening an issue, include:

- OS and Node.js version
- exact command used
- expected behavior
- actual behavior
- logs and stack trace (if available)

## Release Notes

If your change affects CLI flags, commands, output format, or publish artifacts, include a short release note in your PR description.
