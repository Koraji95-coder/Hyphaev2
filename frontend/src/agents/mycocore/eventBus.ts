// src/agents/mycocore/eventBus.ts

export type MycoCoreEventType =
  | "connect"
  | "connected"
  | "disconnect"
  | "log"
  | "warning"
  | "system"
  | "email"
  | "username"
  | "password"
  | "pin"
  | "alerts"
  | "alert"
  | "auth_success"
  | "auth_error"
  | "ui"
  | "password_update"
  | "pin_update"
  | "snapshot"
  | "safe_mode"
  | "email_verified";


export interface MycoCoreEvent {
  type: MycoCoreEventType;
  message: string;
  payload?: unknown;
  timestamp?: string;
  source?: string;
}

type Listener = (evt: MycoCoreEvent) => void;

const TAB_ID = Math.random().toString(36).slice(2) + Date.now();
const isBCSupported = typeof window !== "undefined" && "BroadcastChannel" in window;
const channel: BroadcastChannel | null = isBCSupported
  ? new window.BroadcastChannel("MycoCoreEventBus")
  : null;

class MycoCoreEventBus {
  private static listeners: Listener[] = [];
  private static channel = channel;

  static emit(evt: MycoCoreEvent) {
    const eventWithMeta = {
      ...evt,
      timestamp: evt.timestamp || new Date().toISOString(),
      source: TAB_ID,
    };
    console.log("[MycoCoreEventBus] EMIT", eventWithMeta);
    MycoCoreEventBus.listeners.forEach((cb) => cb(eventWithMeta));
    if (MycoCoreEventBus.channel) {
      MycoCoreEventBus.channel.postMessage(eventWithMeta);
    }
  }

  static subscribe(cb: Listener) {
    console.log("[MycoCoreEventBus] SUBSCRIBE", cb);
    MycoCoreEventBus.listeners.push(cb);
    function bcHandler(e: MessageEvent) {
      if (
        typeof e.data === "object" &&
        e.data !== null &&
        "type" in e.data &&
        "message" in e.data
      ) {
        cb(e.data as MycoCoreEvent);
      }
    }
    if (MycoCoreEventBus.channel) {
      MycoCoreEventBus.channel.addEventListener("message", bcHandler);
    }
    return () => {
      MycoCoreEventBus.listeners = MycoCoreEventBus.listeners.filter((x) => x !== cb);
      if (MycoCoreEventBus.channel) {
        MycoCoreEventBus.channel.removeEventListener("message", bcHandler);
      }
    };
  }
}

export default MycoCoreEventBus;
