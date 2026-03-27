import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

const API_BASE =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

function PayPalSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [message, setMessage] = useState("Finalizing your payment...");
  const [loading, setLoading] = useState(true);
  const hasCapturedRef = useRef(false);

  useEffect(() => {
    if (hasCapturedRef.current) return;
    hasCapturedRef.current = true;

    const capturePayment = async () => {
      try {
        const orderID = searchParams.get("token");

        if (!orderID) {
          setMessage("Missing PayPal order ID.");
          setLoading(false);
          return;
        }

        const response = await fetch(`${API_BASE}/api/paypal/capture-order`, {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ orderID }),
        });

        const result = await response.json();
        console.log("paypal success capture result:", result);

        if (!response.ok || !result.success) {
          setMessage(
            `Payment capture failed: ${result.error || "Unknown error"}`
          );
          setLoading(false);
          return;
        }

        const nextPath =
          typeof result.redirectTo === "string" && result.redirectTo
            ? result.redirectTo
            : "/my";

        if (result.alreadyProcessed) {
          setMessage("Payment already processed. Redirecting...");
        } else if (result.vipActivated) {
          setMessage("SVIP activated successfully! Redirecting...");
        } else if (typeof result.addCoins === "number" && result.addCoins > 0) {
          setMessage(`${result.addCoins} coins added successfully! Redirecting...`);
        } else {
          setMessage("Payment completed successfully! Redirecting...");
        }

        setLoading(false);

        setTimeout(() => {
          navigate(nextPath);
        }, 1800);
      } catch (error) {
        console.error("PayPal success error:", error);
        setMessage(`Something went wrong: ${error.message || "Unknown error"}`);
        setLoading(false);
      }
    };

    capturePayment();
  }, [navigate, searchParams]);

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>Payment Success</h1>
        <p style={styles.text}>{message}</p>

        <button
          style={{
            ...styles.button,
            ...(loading ? styles.buttonDisabled : {}),
          }}
          onClick={() => navigate("/my")}
          disabled={loading}
        >
          {loading ? "Processing..." : "Go to My Wallet"}
        </button>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#fafafa",
    padding: "20px",
    boxSizing: "border-box",
    fontFamily: "'Inter', 'Poppins', sans-serif",
  },
  card: {
    width: "100%",
    maxWidth: "420px",
    background: "#fff",
    borderRadius: "14px",
    padding: "28px 22px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
    textAlign: "center",
  },
  title: {
    margin: "0 0 12px",
    fontSize: "24px",
    fontWeight: "800",
    color: "#111",
  },
  text: {
    margin: "0 0 18px",
    fontSize: "15px",
    lineHeight: "1.7",
    color: "#555",
  },
  button: {
    width: "100%",
    height: "44px",
    border: "none",
    borderRadius: "999px",
    background: "#111",
    color: "#fff",
    fontWeight: "700",
    cursor: "pointer",
  },
  buttonDisabled: {
    opacity: 0.7,
    cursor: "not-allowed",
  },
};

export default PayPalSuccess;