import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

function formatPurchaseLabel(item) {
  if (!item) return "Purchase";

  if (item.pack_key === "svip_7day") {
    return "SVIP 7-Day Membership";
  }

  if (item.coins) {
    return `${item.coins} Coins Pack`;
  }

  return item.pack_key || "Purchase";
}

function formatStatus(status) {
  if (!status) return "Unknown";
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function TransactionRecord() {
  const navigate = useNavigate();

  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPurchases = async () => {
      try {
        setLoading(true);

        const response = await fetch(`${API_BASE}/api/purchases`, {
          method: "GET",
          credentials: "include",
        });

        const data = await response.json().catch(() => null);

        if (!response.ok) {
          console.error(
            "Failed to fetch purchases:",
            data?.error || "Unknown error"
          );
          setRecords([]);
          return;
        }

        setRecords(Array.isArray(data?.purchases) ? data.purchases : []);
      } catch (error) {
        console.error("fetchPurchases error:", error);
        setRecords([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPurchases();
  }, []);

  return (
    <div style={styles.page}>
      <div style={styles.phoneFrame}>
        <div style={styles.header}>
          <button style={styles.backButton} onClick={() => navigate(-1)}>
            ‹
          </button>
          <div style={styles.headerTitle}>Transaction Record</div>
        </div>

        {loading ? (
          <div style={styles.centerState}>Loading...</div>
        ) : records.length === 0 ? (
          <div style={styles.centerState}>No transaction records yet</div>
        ) : (
          <div style={styles.list}>
            {records.map((item) => (
              <div key={item.id} style={styles.card}>
                <div style={styles.topRow}>
                  <div style={styles.purchaseTitle}>
                    {formatPurchaseLabel(item)}
                  </div>

                  <div
                    style={{
                      ...styles.statusBadge,
                      ...(item.status === "completed"
                        ? styles.statusCompleted
                        : item.status === "pending"
                        ? styles.statusPending
                        : styles.statusDefault),
                    }}
                  >
                    {formatStatus(item.status)}
                  </div>
                </div>

                <div style={styles.amount}>${Number(item.amount || 0).toFixed(2)}</div>

                <div style={styles.metaRow}>
                  <span style={styles.metaLabel}>Pack</span>
                  <span style={styles.metaValue}>{item.pack_key || "-"}</span>
                </div>

                {item.chapter_number ? (
                  <div style={styles.metaRow}>
                    <span style={styles.metaLabel}>Chapter</span>
                    <span style={styles.metaValue}>Chapter {item.chapter_number}</span>
                  </div>
                ) : null}

                {item.slug ? (
                  <div style={styles.metaRow}>
                    <span style={styles.metaLabel}>Novel</span>
                    <span style={styles.metaValue}>{item.slug}</span>
                  </div>
                ) : null}

                <div style={styles.metaRow}>
                  <span style={styles.metaLabel}>Date</span>
                  <span style={styles.metaValue}>
                    {item.created_at
                      ? new Date(item.created_at).toLocaleString()
                      : "-"}
                  </span>
                </div>

                {item.paypal_order_id ? (
                  <div style={styles.orderId}>
                    Order: {item.paypal_order_id}
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(180deg, #f6f7fb 0%, #eef1f8 100%)",
  },

  phoneFrame: {
    maxWidth: "430px",
    minHeight: "100vh",
    margin: "0 auto",
    padding: "18px 16px 24px",
    fontFamily:
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
  },

  header: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginBottom: "18px",
  },

  backButton: {
    width: "38px",
    height: "38px",
    borderRadius: "12px",
    border: "none",
    background: "#ffffff",
    color: "#111827",
    fontSize: "28px",
    lineHeight: 1,
    cursor: "pointer",
    boxShadow: "0 8px 20px rgba(17,24,39,0.06)",
  },

  headerTitle: {
    fontSize: "22px",
    fontWeight: "800",
    color: "#111827",
    letterSpacing: "-0.3px",
  },

  centerState: {
    textAlign: "center",
    color: "#7b8191",
    fontSize: "14px",
    padding: "60px 20px",
  },

  list: {
    display: "flex",
    flexDirection: "column",
    gap: "14px",
  },

  card: {
    background: "#ffffff",
    border: "1px solid #edf0f5",
    borderRadius: "20px",
    padding: "16px",
    boxShadow: "0 12px 30px rgba(17,24,39,0.05)",
  },

  topRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: "10px",
    alignItems: "flex-start",
    marginBottom: "10px",
  },

  purchaseTitle: {
    fontSize: "16px",
    fontWeight: "800",
    color: "#111827",
    lineHeight: 1.25,
  },

  amount: {
    fontSize: "24px",
    fontWeight: "800",
    color: "#111827",
    marginBottom: "12px",
  },

  statusBadge: {
    fontSize: "11px",
    fontWeight: "800",
    padding: "6px 10px",
    borderRadius: "999px",
    whiteSpace: "nowrap",
  },

  statusCompleted: {
    background: "#ecfdf3",
    color: "#027a48",
    border: "1px solid #abefc6",
  },

  statusPending: {
    background: "#fff7e8",
    color: "#b54708",
    border: "1px solid #f5d08a",
  },

  statusDefault: {
    background: "#f4f6fa",
    color: "#667085",
    border: "1px solid #e5e7eb",
  },

  metaRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: "10px",
    marginBottom: "8px",
  },

  metaLabel: {
    fontSize: "12px",
    color: "#8b93a6",
    fontWeight: "700",
  },

  metaValue: {
    fontSize: "12px",
    color: "#111827",
    fontWeight: "700",
    textAlign: "right",
    wordBreak: "break-word",
  },

  orderId: {
    marginTop: "10px",
    fontSize: "11px",
    color: "#98a2b3",
    wordBreak: "break-all",
  },
};

export default TransactionRecord;