import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import App from "./App.tsx";
import { PdfContextProvider } from "./context/PdfContext.tsx";
import { AudioContextProvider } from "./context/AudioContext.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <PdfContextProvider>
        <AudioContextProvider>
          <App />
        </AudioContextProvider>
      </PdfContextProvider>
    </BrowserRouter>
  </StrictMode>
);
