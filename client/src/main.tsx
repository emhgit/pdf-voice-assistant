import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import App from "./App.tsx";
import { AppContextProvider } from "./context/AppContext.tsx";
import { WebSocketContextProvider } from "./context/WebSocketContext.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <AppContextProvider>
        <WebSocketContextProvider>
          <App />
        </WebSocketContextProvider>
      </AppContextProvider>
    </BrowserRouter>
  </StrictMode>
);
