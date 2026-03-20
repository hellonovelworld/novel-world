import { useNavigate } from "react-router-dom";

function PayPalCancel() {
  const navigate = useNavigate();

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>Payment Cancelled</h1>
        <p style={styles.text}>
          Your PayPal checkout was cancelled. No coins were added.
        </p>
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

export default PayPalCancel;
