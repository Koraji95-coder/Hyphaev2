//src/main.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./app";
import "./index.css";

// Enable dark theme by default
document.documentElement.classList.add("dark");

ReactDOM.createRoot(document.getElementById("root")!).render(
    <App />

);
