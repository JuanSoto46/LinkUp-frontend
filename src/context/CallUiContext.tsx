import { createContext, useContext, useState, ReactNode } from "react";

interface ActiveCall {
  meetingId: string;
  title: string;
}

interface CallUiContextValue {
  activeCall: ActiveCall | null;
  isMinimized: boolean;
  setActiveCall: (call: ActiveCall | null) => void;
  setMinimized: (value: boolean) => void;
}

const CallUiContext = createContext<CallUiContextValue | undefined>(undefined);

export function CallUiProvider({ children }: { children: ReactNode }) {
  const [activeCall, setActiveCall] = useState<ActiveCall | null>(null);
  const [isMinimized, setMinimized] = useState(false);

  return (
    <CallUiContext.Provider
      value={{ activeCall, isMinimized, setActiveCall, setMinimized }}
    >
      {children}
    </CallUiContext.Provider>
  );
}

export function useCallUi() {
  const ctx = useContext(CallUiContext);
  if (!ctx) {
    throw new Error("useCallUi debe usarse dentro de CallUiProvider");
  }
  return ctx;
}
