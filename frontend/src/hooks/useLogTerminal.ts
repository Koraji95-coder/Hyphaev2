import { useCallback } from "react";
import MycoCoreEventBus, { MycoCoreEventType } from "@/agents/mycocore/eventBus";

interface LogOptions {
  type: MycoCoreEventType;
  message: string;
  payload?: unknown;
}

export function useLogTerminal() {
  const logToTerminal = useCallback((opts: LogOptions) => {
    MycoCoreEventBus.emit({
      type: opts.type,
      message: opts.message,
      payload: opts.payload,
      timestamp: new Date().toISOString(),
    });
  }, []);

  return { logToTerminal };
}
