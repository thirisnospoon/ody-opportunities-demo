import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { CssBaseline } from "@mui/material";

const container = document.getElementById("root");
if (!container) {
    throw new Error("Root container #root not found in index.html");
}
ReactDOM.createRoot(container).render(
    <React.StrictMode>
        <CssBaseline />
        <App />
    </React.StrictMode>
);
