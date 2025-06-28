import { createContext, useContext, type ReactNode } from "react";
import { useWebSocket } from "../hooks/useApi";
import { useAppContext } from "./AppContext";

interface WebSocketContextType {
  ws: WebSocket | null;
  status: string;
  data: any;
  error: string | null;
  connected: boolean;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(
  undefined
);

export const WebSocketContextProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const { sessionToken } = useAppContext();
  const { ws, connected, status, data, error } = useWebSocket(!!sessionToken);
  return (
    <WebSocketContext.Provider value={{ ws, status, data, error, connected }}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocketContext = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error(
      "useWebSocketContext must be used within a WebSocketContextProvider"
    );
  }
  return context;
};
