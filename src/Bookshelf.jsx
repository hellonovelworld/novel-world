import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "./supabaseClient";
import BottomNav from "./BottomNav";
import { BookOpen, Clock3, Sparkles, ChevronRight } from "lucide-react";

function formatReaderCount(value) {
  const num = Number(value);

  if (!num || Number.isNaN(num)) return "0";

  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}m`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;

  return String(num);
}

function Bookshelf() {
  const navigate = useNavigate();

  const [novels, setNovels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("Reading");

  useEffect(() => {
    const fetchNovels = async () => {
      setLoading(true);

      const { data, error } = await supabase
        .from("novels")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Failed to fetch bookshelf novels:", error);
        setNovels([]);
      } else {
        setNovels(data || []);
      }

      setLoading(false);
    };

    fetchNovels();
  }, []);

  const normalizedNovels = useMemo(() => {
    return (novels || []).map((book, index) => ({
      ...book,
      chapterCount:
        book.chapter_count ||
        book.total_chapters ||
        book.chapters_count ||
        null,
      displayTag:
        book.genre ||
        book.category ||
        (index % 4 === 0
          ? "CEO"
          : index % 4 === 1
          ? "Romance"
          : index % 4 === 2
          ? "Revenge"
          : "Werewolf"),
      rating:
        typeof book.rating === "number"
          ? book.rating.toFixed(1)
          : book.rating
          ? Number(book.rating).toFixed(1)
          : "4.8",
      readerCountFormatted: formatReaderCount(book.reader_count || 0),
      progress: Math.min(82, 22 + index * 14),
      lastChapter: Math.min(
        book.chapter_count || book.total_chapters || 20,
        3 + index * 2
      ),
    }));
  }, [novels]);

  const readingList = normalizedNovels.slice(0, 4);
  const unlockedList = normalizedNovels.slice(0, 8);

  const currentList = activeTab === "Reading" ? readingList : unlockedList;

  return (
    <div style={styles.page}>
      <div style={styles.phoneFrame}>
        <div style={styles.header}>
          <div>
            <div style={styles.headerEyebrow}>Your library</div>
            <div style={styles.headerTitle}>Bookshelf</div>
          </div>

          <div style={styles.headerBadge}>
            <Sparkles size={14} />
            Saved Reads
          </div>
        </div>

        <div style={styles.tabsWrap}>
          {["Reading", "Unlocked"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                ...styles.tabBtn,
                ...(activeTab === tab ? styles.tabBtnActive : {}),
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        <div style={styles.summaryCard}>
          <div style={styles.summaryLeft}>
            <div style={styles.summaryIconWrap}>
              <BookOpen size={18} />
            </div>

            <div>
              <div style={styles.summaryTitle}>Your Reading Space</div>
              <div style={styles.summaryText}>
                Continue where you left off and keep your unlocked stories in
                one place.
              </div>
            </div>
          </div>
        </div>

        <div style={styles.sectionHeader}>
          <div style={styles.sectionTitle}>
            {activeTab === "Reading" ? "Continue Reading" : "Unlocked Stories"}
          </div>
          <div style={styles.sectionCount}>{currentList.length} items</div>
        </div>

        {loading ? (
          <div style={styles.listWrap}>
            {[...Array(4)].map((_, i) => (
              <div key={i} style={styles.skeletonCard}></div>
            ))}
          </div>
        ) : currentList.length === 0 ? (
          <div style={styles.emptyCard}>
            <div style={styles.emptyIcon}>📚</div>
            <div style={styles.emptyTitle}>Your bookshelf is empty</div>
            <div style={styles.emptyText}>
              Start reading a story and it will appear here.
            </div>
            <button style={styles.emptyBtn} onClick={() => navigate("/")}>
              Explore Stories
            </button>
          </div>
        ) : (
          <div style={styles.listWrap}>
            {currentList.map((book) => (
              <div
                key={book.id}
                style={styles.bookCard}
                onClick={() => navigate(`/novel/${book.slug}`)}
              >
                <img
                  src={book.cover_url || "/cover.jpg"}
                  alt={book.title}
                  style={styles.bookCover}
                />

                <div style={styles.bookContent}>
                  <div style={styles.bookTopRow}>
                    <div style={styles.bookTitle}>{book.title}</div>
                    <ChevronRight size={18} color="#a0a7b8" />
                  </div>

                  <div style={styles.proofRow}>
                    <span style={styles.proofChip}>⭐ {book.rating}</span>
                    <span style={styles.proofChip}>
                      👀 {book.readerCountFormatted}
                    </span>
                    <span style={styles.genreChip}>
                      {book.displayTag || "Novel"}
                    </span>
                  </div>

                  <div style={styles.bookDesc}>
                    {book.description ||
                      "An emotional story full of tension, heartbreak, and addictive twists."}
                  </div>

                  {activeTab === "Reading" ? (
                    <>
                      <div style={styles.progressMeta}>
                        <div style={styles.progressLabel}>
                          <Clock3 size={13} />
                          Chapter {book.lastChapter}
                        </div>
                        <div style={styles.progressPercent}>
                          {book.progress}%
                        </div>
                      </div>

                      <div style={styles.progressTrack}>
                        <div
                          style={{
                            ...styles.progressFill,
                            width: `${book.progress}%`,
                          }}
                        ></div>
                      </div>

                      <div style={styles.actionRow}>
                        <button
                          style={styles.primaryBtn}
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/novel/${book.slug}`);
                          }}
                        >
                          Continue
                        </button>
                      </div>
                    </>
                  ) : (
                    <div style={styles.actionRow}>
                      <div style={styles.unlockedBadge}>Unlocked</div>
                      <button
                        style={styles.secondaryBtn}
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/novel/${book.slug}`);
                        }}
                      >
                        Open
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <div style={styles.bottomSpace}></div>

        <BottomNav active="bookshelf" />
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background:
      "linear-gradient(180deg, #f6f7fb 0%, #eef1f8 50%, #f6f7fb 100%)",
  },

  phoneFrame: {
    width: "100%",
    maxWidth: "430px",
    minHeight: "100vh",
    margin: "0 auto",
    padding: "18px 16px 0",
    fontFamily:
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "12px",
    marginBottom: "16px",
  },

  headerEyebrow: {
    fontSize: "12px",
    color: "#8d93a6",
    fontWeight: "700",
    marginBottom: "2px",
  },

  headerTitle: {
    fontSize: "30px",
    fontWeight: "800",
    color: "#111827",
    letterSpacing: "-0.6px",
  },

  headerBadge: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    background: "#fff5ef",
    color: "#ff6b3d",
    border: "1px solid #ffd9cc",
    padding: "8px 11px",
    borderRadius: "999px",
    fontSize: "11px",
    fontWeight: "800",
    whiteSpace: "nowrap",
  },

  tabsWrap: {
    display: "flex",
    gap: "10px",
    marginBottom: "14px",
  },

  tabBtn: {
    border: "none",
    background: "#eef1f7",
    color: "#7b8191",
    padding: "10px 16px",
    borderRadius: "999px",
    fontSize: "13px",
    fontWeight: "700",
    cursor: "pointer",
  },

  tabBtnActive: {
    background: "linear-gradient(135deg, #111827 0%, #2d3748 100%)",
    color: "#fff",
    boxShadow: "0 10px 24px rgba(17,24,39,0.18)",
  },

  summaryCard: {
    background: "#ffffff",
    border: "1px solid #edf0f5",
    borderRadius: "22px",
    padding: "16px",
    boxShadow: "0 12px 30px rgba(17,24,39,0.05)",
    marginBottom: "16px",
  },

  summaryLeft: {
    display: "flex",
    gap: "12px",
    alignItems: "flex-start",
  },

  summaryIconWrap: {
    width: "40px",
    height: "40px",
    borderRadius: "14px",
    background: "linear-gradient(135deg, #111827 0%, #2b3240 100%)",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  summaryTitle: {
    fontSize: "16px",
    fontWeight: "800",
    color: "#111827",
    marginBottom: "4px",
  },

  summaryText: {
    fontSize: "13px",
    lineHeight: 1.5,
    color: "#7b8191",
  },

  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "12px",
  },

  sectionTitle: {
    fontSize: "18px",
    fontWeight: "800",
    color: "#111827",
    letterSpacing: "-0.2px",
  },

  sectionCount: {
    fontSize: "12px",
    fontWeight: "700",
    color: "#8d93a6",
  },

  listWrap: {
    paddingBottom: "4px",
  },

  bookCard: {
    display: "flex",
    gap: "12px",
    padding: "12px",
    borderRadius: "22px",
    background: "#ffffff",
    border: "1px solid #edf0f5",
    boxShadow: "0 12px 28px rgba(17,24,39,0.05)",
    marginBottom: "14px",
    cursor: "pointer",
  },

  bookCover: {
    width: "84px",
    height: "118px",
    objectFit: "cover",
    borderRadius: "14px",
    flexShrink: 0,
    boxShadow: "0 10px 22px rgba(17,24,39,0.10)",
  },

  bookContent: {
    flex: 1,
    minWidth: 0,
  },

  bookTopRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "8px",
    marginBottom: "8px",
  },

  bookTitle: {
    fontSize: "17px",
    lineHeight: 1.2,
    fontWeight: "800",
    color: "#111827",
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
  },

  proofRow: {
    display: "flex",
    gap: "6px",
    flexWrap: "wrap",
    marginBottom: "8px",
  },

  proofChip: {
    fontSize: "10px",
    fontWeight: "800",
    color: "#5e6575",
    background: "#f4f6fa",
    padding: "5px 8px",
    borderRadius: "999px",
    border: "1px solid #e9edf4",
  },

  genreChip: {
    fontSize: "10px",
    fontWeight: "800",
    color: "#ff6b3d",
    background: "#fff3ee",
    padding: "5px 8px",
    borderRadius: "999px",
    border: "1px solid #ffd9cf",
  },

  bookDesc: {
    fontSize: "12px",
    lineHeight: 1.5,
    color: "#6f7788",
    marginBottom: "10px",
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
  },

  progressMeta: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "7px",
  },

  progressLabel: {
    display: "flex",
    alignItems: "center",
    gap: "5px",
    fontSize: "11px",
    fontWeight: "700",
    color: "#8b93a6",
  },

  progressPercent: {
    fontSize: "11px",
    fontWeight: "800",
    color: "#ff6b3d",
  },

  progressTrack: {
    width: "100%",
    height: "7px",
    borderRadius: "999px",
    background: "#e7ebf3",
    overflow: "hidden",
    marginBottom: "10px",
  },

  progressFill: {
    height: "100%",
    borderRadius: "999px",
    background: "linear-gradient(90deg, #ff7a59 0%, #ffb36b 100%)",
  },

  actionRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "8px",
  },

  primaryBtn: {
    border: "none",
    background: "linear-gradient(135deg, #111827 0%, #2b3240 100%)",
    color: "#ffffff",
    padding: "10px 14px",
    borderRadius: "999px",
    fontSize: "12px",
    fontWeight: "800",
    cursor: "pointer",
    boxShadow: "0 8px 18px rgba(17,24,39,0.12)",
  },

  secondaryBtn: {
    border: "none",
    background: "#111827",
    color: "#ffffff",
    padding: "9px 14px",
    borderRadius: "999px",
    fontSize: "12px",
    fontWeight: "800",
    cursor: "pointer",
  },

  unlockedBadge: {
    fontSize: "11px",
    fontWeight: "800",
    color: "#10b981",
    background: "#ecfdf5",
    border: "1px solid #bbf7d0",
    padding: "6px 10px",
    borderRadius: "999px",
  },

  emptyCard: {
    background: "#ffffff",
    border: "1px solid #edf0f5",
    borderRadius: "24px",
    padding: "34px 20px",
    textAlign: "center",
    boxShadow: "0 12px 30px rgba(17,24,39,0.05)",
  },

  emptyIcon: {
    fontSize: "40px",
    marginBottom: "10px",
  },

  emptyTitle: {
    fontSize: "18px",
    fontWeight: "800",
    color: "#111827",
    marginBottom: "8px",
  },

  emptyText: {
    fontSize: "13px",
    lineHeight: 1.5,
    color: "#7b8191",
    marginBottom: "14px",
  },

  emptyBtn: {
    border: "none",
    background: "linear-gradient(135deg, #111827 0%, #2b3240 100%)",
    color: "#ffffff",
    padding: "11px 16px",
    borderRadius: "999px",
    fontSize: "13px",
    fontWeight: "800",
    cursor: "pointer",
  },

  skeletonCard: {
    height: "144px",
    borderRadius: "22px",
    background: "linear-gradient(90deg, #f3f4f7 25%, #eceef3 50%, #f3f4f7 75%)",
    marginBottom: "14px",
  },

  bottomSpace: {
    height: "76px",
  },
};

export default Bookshelf;