import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { PayPalScriptProvider } from "@paypal/react-paypal-js";
import "./index.css";

import Home from "./Home";
import App from "./App";
import Chapter from "./Chapter";
import My from "./My";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <PayPalScriptProvider
      options={{
        "client-id": import.meta.env.VITE_PAYPAL_CLIENT_ID,
        currency: "USD",
        intent: "capture",
      }}
    >
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/novel" element={<App />} />
          <Route path="/chapter/:id" element={<Chapter />} />
          <Route path="/my" element={<My />} />
        </Routes>
      </BrowserRouter>
    </PayPalScriptProvider>
  </React.StrictMode>
);