import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./styles/global.css";

const rootElement = document.getElementById("root");
const root = createRoot(rootElement);

root.render(
  <StrictMode>
    <App />
    <ToastContainer position="top-right" autoClose={2500} />
  </StrictMode>
);