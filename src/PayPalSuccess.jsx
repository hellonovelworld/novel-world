import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

function PayPalSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [message, setMessage] = useState("Finalizing your payment...");

  useEffect(() => {
    const capturePayment = async () => {
      try {
        const orderID = searchParams.get("token");
        const pendingPackRaw = localStorage.getItem("pendingPack");

        if (!orderID) {
          setMessage("Missing PayPal order ID.");
          return;
        }

        if (!pendingPackRaw) {
          setMessage("No pending coin package found.");
          return;
        }

        const pendingPack = JSON.parse(pendingPackRaw);

        const response = await fetch(
          "https://novel-world-api.onrender.com/api/paypal/capture-order",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              orderID,
              packCoins: pendingPack.coins,
            }),
          }
        );

        const result = await response.json();
        console.log("paypal success capture result:", result);

        if (!response.ok || !result.success) {
          setMessage(`Payment capture failed: ${result.error || "Unknown error"}`);
          return;
        }

        const currentCoins = Number(localStorage.getItem("coins") || 0);
        const updatedCoins = currentCoins + Number(result.addCoins || pendingPack.coins);

        localStorage.setItem("coins", String(updatedCoins));
        localStorage.removeItem("pendingPack");

        setMessage(`${pendingPack.coins} coins added successfully! Redirecting...`);

        setTimeout(() => {
          navigate("/novel");
        }, 1800);
      } catch (error) {
        console.error("PayPal success error:", error);
        setMessage(`Something went wrong: ${error.message || "Unknown error"}`);
      }
    };

    capturePayment();
  }, [navigate, searchParams]);

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>Payment Success</h1>
        <p style={styles.text}>{message}</p>
        <button style={styles.button} onClick={() => navigate("/novel")}>
          Back to Novel
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
};

export default PayPalSuccess;
