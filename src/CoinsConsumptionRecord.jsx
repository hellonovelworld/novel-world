import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

function formatType(type) {
  if (!type) return "Transaction";

  switch (type) {
    case "purchase":
      return "Coins Purchased";
    case "unlock":
      return "Chapter Unlock";
    case "refund":
      return "Refund";
    case "bonus":
      return "Bonus";
    default:
      return type.charAt(0).toUpperCase() + type.slice(1);
  }
}

function CoinsConsumptionRecord() {
  const navigate = useNavigate();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);

        const response = await fetch(`${API_BASE}/api/coin-transactions`, {
          method: "GET",
          credentials: "include",
        });

        const data = await response.json().catch(() => null);

        if (!response.ok) {
          console.error(
            "Failed to fetch coin transactions:",
            data?.error || "Unknown error"
          );
          setRecords([]);
          return;
        }

        setRecords(Array.isArray(data?.transactions) ? data.transactions : []);
      } catch (error) {
        console.error("fetchTransactions error:", error);
        setRecords([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  return (
    <div style={styles.page}>
      <div style={styles.phoneFrame}>
        <div style={styles.header}>
          <button style={styles.backButton} onClick={() => navigate(-1)}>
            ‹
          </button>
          <div style={styles.headerTitle}>Coins Consumption Record</div>
        </div>

        {loading ? (
          <div style={styles.centerState}>Loading...</div>
        ) : records.length === 0 ? (
          <div style={styles.centerState}>No coin records yet</div>
        ) : (
          <div style={styles.list}>
            {records.map((item) => {
              const isPositive = Number(item.amount || 0) > 0;

              return (
                <div key={item.id} style={styles.card}>
                  <div style={styles.topRow}>
                    <div style={styles.recordTitle}>
                      {formatType(item.type)}
                    </div>

                    <div
                      style={{
                        ...styles.amount,
                        color: isPositive ? "#027a48" : "#d92d20",
                      }}
                    >
                      {isPositive ? "+" : ""}
                      {item.amount}
                    </div>
                  </div>

                  {item.note ? (
                    <div style={styles.note}>{item.note}</div>
                  ) : null}

                  {item.novels?.title ? (
                    <div style={styles.metaRow}>
                      <span style={styles.metaLabel}>Novel</span>
                      <span style={styles.metaValue}>{item.novels.title}</span>
                    </div>
                  ) : null}

                  {item.chapters?.chapter_number ? (
                    <div style={styles.metaRow}>
                      <span style={styles.metaLabel}>Chapter</span>
                      <span style={styles.metaValue}>
                        Chapter {item.chapters.chapter_number}
                      </span>
                    </div>
                  ) : null}

                  <div style={styles.metaRow}>
                    <span style={styles.metaLabel}>Balance After</span>
                    <span style={styles.metaValue}>
                      {item.balance_after ?? "-"}
                    </span>
                  </div>

                  <div style={styles.metaRow}>
                    <span style={styles.metaLabel}>Date</span>
                    <span style={styles.metaValue}>
                      {item.created_at
                        ? new Date(item.created_at).toLocaleString()
                        : "-"}
                    </span>
                  </div>
                </div>
              );
            })}
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

  recordTitle: {
    fontSize: "16px",
    fontWeight: "800",
    color: "#111827",
    lineHeight: 1.25,
  },

  amount: {
    fontSize: "22px",
    fontWeight: "800",
  },

  note: {
    fontSize: "13px",
    color: "#667085",
    marginBottom: "12px",
    lineHeight: 1.45,
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
};

export default CoinsConsumptionRecord;