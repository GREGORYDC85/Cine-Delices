import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./styles/global.css"; // Si tu as un fichier global.css

// Le point d'entrée de l'application
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
