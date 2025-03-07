import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App"; // Assure-toi que App est correctement importé
import "./styles/global.css"; // Si tu utilises un fichier CSS global

const rootElement = document.getElementById("root");
const root = createRoot(rootElement);

root.render(
  <StrictMode>
    <App />
  </StrictMode>
);
