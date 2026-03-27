import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

function ReadingHistory() {
  const navigate = useNavigate();

  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = async () => {
    try {
      setLoading(true);

      const res = await fetch(`${API_BASE}/api/reading-progress`, {
        credentials: "include",
      });

      const data = await res.json();

      if (!res.ok) {
        console.error(data.error);
        setHistory([]);
        return;
      }

      // sort latest first
      const sorted = (data.progress || []).sort(
        (a, b) => new Date(b.updated_at) - new Date(a.updated_at)
      );

      setHistory(sorted);
    } catch (err) {
      console.error(err);
      setHistory([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleContinue = (item) => {
    const slug = item?.novels?.slug;
    const chapter = item?.last_read_chapter_number || 1;

    if (!slug) return;

    navigate(`/novel/${slug}/chapter/${chapter}`);
  };

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <button onClick={() => navigate(-1)} style={styles.back}>
          ←
        </button>
        <div style={styles.title}>Reading History</div>
      </div>

      {loading ? (
        <div style={styles.loading}>Loading...</div>
      ) : history.length === 0 ? (
        <div style={styles.empty}>No reading history yet</div>
      ) : (
        <div style={styles.list}>
          {history.map((item) => (
            <div
              key={item.id}
              style={styles.card}
              onClick={() => handleContinue(item)}
            >
              <img
                src={item.novels?.cover_url || "/cover.jpg"}
                style={styles.cover}
              />

              <div style={styles.content}>
                <div style={styles.name}>
                  {item.novels?.title || "Untitled"}
                </div>

                <div style={styles.chapter}>
                  Chapter {item.last_read_chapter_number}
                </div>

                <div style={styles.time}>
                  {new Date(item.updated_at).toLocaleString()}
                </div>
              </div>

              <div style={styles.arrow}>›</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  page: {
    maxWidth: "430px",
    margin: "0 auto",
    padding: "16px",
    fontFamily: "sans-serif",
  },

  header: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "20px",
  },

  back: {
    border: "none",
    background: "#eee",
    borderRadius: "8px",
    padding: "6px 10px",
    cursor: "pointer",
  },

  title: {
    fontSize: "18px",
    fontWeight: "700",
  },

  loading: {
    textAlign: "center",
    marginTop: "40px",
  },

  empty: {
    textAlign: "center",
    marginTop: "40px",
    color: "#888",
  },

  list: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },

  card: {
    display: "flex",
    gap: "12px",
    padding: "12px",
    borderRadius: "12px",
    background: "#fff",
    border: "1px solid #eee",
    cursor: "pointer",
  },

  cover: {
    width: "60px",
    height: "80px",
    objectFit: "cover",
    borderRadius: "8px",
  },

  content: {
    flex: 1,
  },

  name: {
    fontWeight: "700",
    marginBottom: "4px",
  },

  chapter: {
    fontSize: "13px",
    color: "#666",
  },

  time: {
    fontSize: "11px",
    color: "#aaa",
    marginTop: "6px",
  },

  arrow: {
    fontSize: "20px",
    color: "#bbb",
  },
};

export default ReadingHistory;