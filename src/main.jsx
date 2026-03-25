import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { PayPalScriptProvider } from "@paypal/react-paypal-js";
import "./index.css";


import Home from "./Home";
import NovelDetails from "./App";
import Chapter from "./Chapter";
import My from "./My";
import Bookshelf from "./Bookshelf";
import PayPalSuccess from "./PayPalSuccess";
import PayPalCancel from "./PayPalCancel";

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
          <Route path="/novel/:slug" element={<NovelDetails />} />
          <Route path="/chapter/:id" element={<Chapter />} />
          <Route path="/novel/:slug/chapter/:id" element={<Chapter />} />
          <Route path="/bookshelf" element={<Bookshelf />} />
          <Route path="/my" element={<My />} />
          <Route path="/paypal-success" element={<PayPalSuccess />} />
          <Route path="/paypal-cancel" element={<PayPalCancel />} />
          
        </Routes>
      </BrowserRouter>
    </PayPalScriptProvider>
  </React.StrictMode>
);
