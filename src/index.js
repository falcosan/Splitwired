import App from "./App";
import React from "react";
import { createRoot } from "react-dom/client";
import "@/assets/style/index.css";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
