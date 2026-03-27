import React, { useEffect } from "react";
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
import ReadingHistory from "./ReadingHistory";
import TransactionRecord from "./TransactionRecord";
import CoinsConsumptionRecord from "./CoinsConsumptionRecord";
import UnlockedSeries from "./UnlockedSeries";
import Feedback from "./Feedback";
import Settings from "./Settings";
import Terms from "./Terms";
import Privacy from "./Privacy";
import Refund from "./Refund";

const API_BASE =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

function RootApp() {
  useEffect(() => {
    const initSessionUser = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/user/init`, {
          method: "POST",
          credentials: "include",
        });

        const data = await response.json();
        console.log("init user:", data);
      } catch (error) {
        console.error("init user failed:", error);
      }
    };

    initSessionUser();
  }, []);

  return (
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
          <Route path="/feedback" element={<Feedback />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/refund" element={<Refund />} />
          <Route path="/paypal-success" element={<PayPalSuccess />} />
          <Route path="/paypal-cancel" element={<PayPalCancel />} />
          <Route path="/reading-history" element={<ReadingHistory />} />
          <Route path="/transaction-record" element={<TransactionRecord />} />
          <Route path="/coins-consumption-record" element={<CoinsConsumptionRecord />} />
          <Route path="/unlocked-series" element={<UnlockedSeries />} />
        </Routes>
      </BrowserRouter>
    </PayPalScriptProvider>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(
    <RootApp />
);