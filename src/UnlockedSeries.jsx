import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

function UnlockedSeries() {
  const navigate = useNavigate();
  const [series, setSeries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUnlockedSeries = async () => {
      try {
        setLoading(true);

        const response = await fetch(`${API_BASE}/api/unlocked-series`, {
          method: "GET",
          credentials: "include",
        });

        const data = await response.json().catch(() => null);

        if (!response.ok) {
          console.error(
            "Failed to fetch unlocked series:",
            data?.error || "Unknown error"
          );
          setSeries([]);
          return;
        }

        setSeries(Array.isArray(data?.series) ? data.series : []);
      } catch (error) {
        console.error("fetchUnlockedSeries error:", error);
        setSeries([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUnlockedSeries();
  }, []);

  return (
    <div style={styles.page}>
      <div style={styles.phoneFrame}>
        <div style={styles.header}>
          <button style={styles.backButton} onClick={() => navigate(-1)}>
            ‹
          </button>
          <div style={styles.headerTitle}>Unlocked Series</div>
        </div>

        {loading ? (
          <div style={styles.centerState}>Loading...</div>
        ) : series.length === 0 ? (
          <div style={styles.centerState}>No unlocked series yet</div>
        ) : (
          <div style={styles.list}>
            {series.map((item) => {
              const novel = item.novel;

              return (
                <div
                  key={novel.id}
                  style={styles.card}
                  onClick={() => navigate(`/novel/${novel.slug}`)}
                >
                  <img
                    src={novel.cover_url || "/cover.jpg"}
                    alt={novel.title}
                    style={styles.cover}
                  />

                  <div style={styles.content}>
                    <div style={styles.title}>{novel.title}</div>

                    <div style={styles.author}>
                      {novel.author || "Novel World"}
                    </div>

                    <div style={styles.metaRow}>
                      <span style={styles.metaChip}>
                        {item.unlockedCount} unlocked
                      </span>
                      <span style={styles.metaChip}>
                        Latest: Chapter {item.latestUnlockedChapter}
                      </span>
                    </div>

                    <div style={styles.time}>
                      {item.latestUnlockedAt
                        ? new Date(item.latestUnlockedAt).toLocaleString()
                        : ""}
                    </div>
                  </div>

                  <div style={styles.arrow}>›</div>
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
    padding: "14px",
    boxShadow: "0 12px 30px rgba(17,24,39,0.05)",
    display: "flex",
    gap: "12px",
    alignItems: "center",
    cursor: "pointer",
  },

  cover: {
    width: "72px",
    height: "100px",
    objectFit: "cover",
    borderRadius: "14px",
    flexShrink: 0,
    boxShadow: "0 10px 20px rgba(17,24,39,0.10)",
  },

  content: {
    flex: 1,
    minWidth: 0,
  },

  title: {
    fontSize: "16px",
    fontWeight: "800",
    color: "#111827",
    lineHeight: 1.25,
    marginBottom: "6px",
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
  },

  author: {
    fontSize: "12px",
    color: "#8b93a6",
    marginBottom: "8px",
    fontWeight: "700",
  },

  metaRow: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap",
    marginBottom: "8px",
  },

  metaChip: {
    fontSize: "11px",
    color: "#ff6b3d",
    fontWeight: "800",
    background: "#fff3ee",
    border: "1px solid #ffd9cf",
    padding: "6px 10px",
    borderRadius: "999px",
  },

  time: {
    fontSize: "11px",
    color: "#98a2b3",
  },

  arrow: {
    fontSize: "24px",
    color: "#9aa1b3",
    lineHeight: 1,
    flexShrink: 0,
  },
};

export default UnlockedSeries;