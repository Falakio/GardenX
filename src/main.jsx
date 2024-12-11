import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import App from "./App";
import theme from "./theme";
import { registerSW } from "virtual:pwa-register";
import "./index.css";

const updateSW = registerSW({
  onNeedRefresh() {
    // Show a prompt to the user to refresh the app
  },
  onOfflineReady() {
    // Show a prompt to the user that the app is ready to work offline
  },
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <App />
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
);
