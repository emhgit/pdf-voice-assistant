import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import App from "./App.tsx";
import { PdfContextProvider } from "./context/PdfContext.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <PdfContextProvider>
        <App />
      </PdfContextProvider>
    </BrowserRouter>
  </StrictMode>
);
