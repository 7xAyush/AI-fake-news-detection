import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import DesignApp from "./app/App.tsx";
import "./styles-design/index.css";
import "./styles-design/theme.css";
import { AuthProvider } from "./state/AuthContext.jsx";

// Mount the React app into the root div, wrapping the design App
// with our existing AuthProvider and router so functionality is preserved.
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <DesignApp />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
