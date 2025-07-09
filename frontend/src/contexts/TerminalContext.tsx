// src/contexts/TerminalContext.tsx
import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useCallback,
  useMemo,
} from "react";

type TerminalContextType = {
  lines: string[];
  push: (line: string) => void;
  clear: () => void;
};

const TerminalContext = createContext<TerminalContextType | undefined>(
  undefined
);

export function useTerminal(): TerminalContextType {
  const ctx = useContext(TerminalContext);
  if (!ctx) {
    throw new Error("useTerminal must be inside <TerminalProvider>");
  }
  return ctx;
}

interface TerminalProviderProps {
  children: ReactNode;
}

export const TerminalProvider: React.FC<TerminalProviderProps> = ({
  children,
}) => {
  const [lines, setLines] = useState<string[]>([]);

  // stable push()
  const push = useCallback((line: string) => {
    setLines((prev) => [...prev, line]);
  }, []);

  // stable clear()
  const clear = useCallback(() => {
    setLines([]);
  }, []);

  // only recreate value when lines, push or clear actually change
  const value = useMemo(
    () => ({ lines, push, clear }),
    [lines, push, clear]
  );

  return (
    <TerminalContext.Provider value={value}>
      {children}
    </TerminalContext.Provider>
  );
};
