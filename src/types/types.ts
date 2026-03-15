import type { Socket } from "node:net";

declare module "node:net" {
  interface Socket {
    clientName?: string;
  }
}

export type ClientSocket = Socket;