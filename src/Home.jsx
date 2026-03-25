import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "./supabaseClient";
import BottomNav from "./BottomNav";

function formatReaderCount(value) {
  const num = Number(value);

  if (!num || Number.isNaN(num)) return "0";

  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}m`;
  }

  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}k`;
  }

  return String(num);
}

function Home() {
  const navigate = useNavigate();

  const [novels, setNovels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("Hot");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchNovels = async () => {
      setLoading(true);

      const { data, error } = await supabase
        .from("novels")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Failed to fetch novels:", error);
        setNovels([]);
      } else {
        setNovels(data || []);
      }

      setLoading(false);
    };

    fetchNovels();
  }, []);

  const handleNovelClick = (slug) => {
    navigate(`/novel/${slug}`);
  };

  const normalizedNovels = useMemo(() => {
    return (novels || []).map((book, index) => {
      const rankScore =
        typeof book.views === "number"
          ? book.views
          : typeof book.total_views === "number"
          ? book.total_views
          : typeof book.reader_count === "number"
          ? book.reader_count
          : 1000 - index;

      return {
        ...book,
        rankScore,
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
      };
    });
  }, [novels]);

  const filteredNovels = useMemo(() => {
    let list = [...normalizedNovels];

    if (activeTab === "Hot") {
      list.sort((a, b) => (b.rankScore || 0) - (a.rankScore || 0));
    } else if (activeTab === "New") {
      list.sort(
        (a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0)
      );
    }

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      list = list.filter(
        (book) =>
          book.title?.toLowerCase().includes(q) ||
          book.author?.toLowerCase().includes(q) ||
          book.description?.toLowerCase().includes(q) ||
          book.displayTag?.toLowerCase().includes(q)
      );
    }

    return list;
  }, [normalizedNovels, activeTab, searchTerm]);

  const heroNovels = filteredNovels.slice(0, 3);
  const trendingNovels = filteredNovels.slice(0, 8);
  const recommendedNovels = filteredNovels.slice(0, 20);
  const featuredNovel = heroNovels[0] || null;
  const continueReadingNovel = filteredNovels[1] || filteredNovels[0] || null;

  return (
    <div style={styles.page}>
      <div style={styles.phoneFrame}>
        <div style={styles.header}>
          <div>
            <div style={styles.headerEyebrow}>Discover stories</div>
            <div style={styles.headerTitle}>Novel World</div>
          </div>

          <button style={styles.headerAction} onClick={() => navigate("/my")}>
            ☺
          </button>
        </div>

        <div style={styles.tabsWrap}>
          {["Hot", "New", "All"].map((tab) => (
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

        <div style={styles.searchWrap}>
          <span style={styles.searchIcon}>⌕</span>
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search title, author, genre..."
            style={styles.searchInput}
          />
        </div>

        <div style={styles.quickRow}>
          <div style={styles.quickPill}>🔥 Trending</div>
          <div style={styles.quickPill}>💎 Premium Stories</div>
          <div style={styles.quickPill}>❤️ Romance</div>
        </div>

        <div style={styles.content}>
          {loading ? (
            <>
              <div style={styles.heroSkeleton}></div>

              <div style={styles.sectionHeader}>
                <div style={styles.sectionTitle}>Trending Now</div>
              </div>

              <div style={styles.horizontalList}>
                {[...Array(4)].map((_, i) => (
                  <div key={i} style={styles.horizontalCard}>
                    <div style={styles.horizontalSkeletonCover}></div>
                    <div style={styles.horizontalSkeletonText}></div>
                    <div style={styles.horizontalSkeletonSub}></div>
                  </div>
                ))}
              </div>

              <div style={styles.sectionHeader}>
                <div style={styles.sectionTitle}>For You</div>
              </div>

              {[...Array(4)].map((_, i) => (
                <div key={i} style={styles.recommendSkeleton}></div>
              ))}
            </>
          ) : filteredNovels.length === 0 ? (
            <div style={styles.emptyState}>
              <div style={styles.emptyIcon}>📚</div>
              <div style={styles.emptyTitle}>No novels found</div>
              <div style={styles.emptyText}>
                Try another keyword or add more active novels in Supabase.
              </div>
            </div>
          ) : (
            <>
              {featuredNovel && (
                <div
                  style={styles.heroCard}
                  onClick={() => handleNovelClick(featuredNovel.slug)}
                >
                  <img
                    src={featuredNovel.cover_url || "/cover.jpg"}
                    alt={featuredNovel.title}
                    style={styles.heroImage}
                  />

                  <div style={styles.heroOverlay}></div>
                  <div style={styles.heroGlow}></div>

                  <div style={styles.heroContent}>
                    <div style={styles.heroTitle}>{featuredNovel.title}</div>

                    <div style={styles.heroProofRow}>
                      <span style={styles.heroMetaChip}>
                        ⭐ {featuredNovel.rating}
                      </span>
                      <span style={styles.heroMetaChip}>
                        👀 {featuredNovel.readerCountFormatted} readers
                      </span>
                    </div>

                    <div style={styles.heroHook}>
                      {featuredNovel.description ||
                        "Betrayed by the man she trusted most, she vanished without a trace. Now she’s back—stronger, colder, and ready to make them regret everything."}
                    </div>

                    <div style={styles.heroButtonRow}>
                      <button
                        style={styles.readNowBtn}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleNovelClick(featuredNovel.slug);
                        }}
                      >
                        🔥 Start Reading Free
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {continueReadingNovel && (
                <div
                  style={styles.continueCard}
                  onClick={() => handleNovelClick(continueReadingNovel.slug)}
                >
                  <img
                    src={continueReadingNovel.cover_url || "/cover.jpg"}
                    alt={continueReadingNovel.title}
                    style={styles.continueCover}
                  />

                  <div style={styles.continueContent}>
                    <div style={styles.continueLabel}>Continue Reading</div>
                    <div style={styles.continueTitle}>
                      {continueReadingNovel.title}
                    </div>
                    <div style={styles.continueSub}>
                      {continueReadingNovel.author || "Unknown Author"}
                    </div>

                    <div style={styles.progressTrack}>
                      <div style={styles.progressFill}></div>
                    </div>
                  </div>

                  <div style={styles.continueArrow}>›</div>
                </div>
              )}

              <div style={styles.sectionHeader}>
                <div style={styles.sectionTitle}>Trending Now</div>
                <button
                  style={styles.sectionLink}
                  onClick={() => setActiveTab("Hot")}
                >
                  See all
                </button>
              </div>

              <div style={styles.horizontalList}>
                {trendingNovels.map((item, index) => (
                  <div
                    key={item.id}
                    style={styles.horizontalCard}
                    onClick={() => handleNovelClick(item.slug)}
                  >
                    <div style={styles.rankBadge}>#{index + 1}</div>
                    <img
                      src={item.cover_url || "/cover.jpg"}
                      alt={item.title}
                      style={styles.horizontalCover}
                    />
                    <div style={styles.horizontalTitle}>{item.title}</div>
                    <div style={styles.horizontalAuthor}>
                      {item.author || "Unknown"}
                    </div>
                  </div>
                ))}
              </div>

              <div style={styles.sectionHeader}>
                <div style={styles.sectionTitle}>Recommended For You</div>
              </div>

              <div style={styles.recommendList}>
                {recommendedNovels.map((book, index) => (
                  <div
                    key={book.id}
                    style={styles.bookRow}
                    onClick={() => handleNovelClick(book.slug)}
                  >
                    <img
                      src={book.cover_url || "/cover.jpg"}
                      alt={book.title}
                      style={styles.bookCover}
                    />

                    <div style={styles.bookContent}>
                      <div style={styles.bookTopRow}>
                        <div style={styles.bookTitle}>{book.title}</div>
                        {index < 3 && <div style={styles.hotLabel}>HOT</div>}
                      </div>

                      <div style={styles.bookProofRow}>
                        <span style={styles.bookProofChip}>
                          ⭐ {book.rating}
                        </span>
                        <span style={styles.bookProofChip}>
                          👀 {book.readerCountFormatted}
                        </span>
                      </div>

                      <div style={styles.bookDesc}>
                        {book.description ||
                          "Rejected, betrayed, and left with nothing — now she’s back stronger than ever."}
                      </div>

                      <div style={styles.bookBottomRow}>
                        <span style={styles.bookTag}>
                          {book.displayTag || "Romance"}
                        </span>

                        <div style={styles.readMiniBtn}>Start Reading Free</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        <div style={styles.bottomSpacer}></div>

        <BottomNav active="home" />
      </div>
    </div>
  );
}

const styles = {
  page: {
    width: "100%",
    minHeight: "100vh",
    background:
      "linear-gradient(180deg, #f6f7fb 0%, #eef1f8 50%, #f6f7fb 100%)",
  },

  phoneFrame: {
    width: "100%",
    maxWidth: "430px",
    minHeight: "100vh",
    background: "#ffffff",
    margin: "0 auto",
    fontFamily:
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    position: "relative",
    boxShadow: "0 0 0 1px rgba(0,0,0,0.03)",
  },

  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "18px 16px 8px",
  },

  headerEyebrow: {
    fontSize: "12px",
    color: "#8d93a6",
    fontWeight: "600",
    marginBottom: "2px",
  },

  headerTitle: {
    fontSize: "24px",
    fontWeight: "800",
    color: "#111827",
    letterSpacing: "-0.4px",
  },

  headerAction: {
    width: "38px",
    height: "38px",
    borderRadius: "50%",
    border: "none",
    background: "#f3f5fa",
    color: "#111827",
    fontSize: "18px",
    cursor: "pointer",
  },

  tabsWrap: {
    display: "flex",
    gap: "10px",
    padding: "10px 16px 10px",
  },

  tabBtn: {
    border: "none",
    background: "#f3f5fa",
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

  searchWrap: {
    margin: "2px 16px 10px",
    height: "46px",
    borderRadius: "14px",
    background: "#f6f7fb",
    display: "flex",
    alignItems: "center",
    padding: "0 14px",
    gap: "10px",
    border: "1px solid #edf0f5",
  },

  searchIcon: {
    color: "#8b90a0",
    fontSize: "16px",
  },

  searchInput: {
    border: "none",
    outline: "none",
    background: "transparent",
    flex: 1,
    fontSize: "14px",
    color: "#111827",
  },

  quickRow: {
    display: "flex",
    gap: "8px",
    overflowX: "auto",
    padding: "4px 16px 14px",
  },

  quickPill: {
    whiteSpace: "nowrap",
    padding: "8px 12px",
    borderRadius: "999px",
    background: "#fff6f2",
    color: "#ff6b3d",
    fontSize: "12px",
    fontWeight: "700",
    border: "1px solid #ffe3d8",
  },

  content: {
    padding: "0 16px",
  },

  heroCard: {
    position: "relative",
    height: "290px",
    borderRadius: "24px",
    overflow: "hidden",
    cursor: "pointer",
    marginBottom: "18px",
    boxShadow: "0 22px 48px rgba(16,24,40,0.18)",
  },

  heroImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",
  },

  heroOverlay: {
    position: "absolute",
    inset: 0,
    background:
      "linear-gradient(180deg, rgba(8,10,18,0.10) 0%, rgba(8,10,18,0.42) 42%, rgba(8,10,18,0.84) 100%)",
  },

  heroGlow: {
    position: "absolute",
    inset: 0,
    background:
      "radial-gradient(circle at top right, rgba(255,122,89,0.22) 0%, transparent 35%)",
    pointerEvents: "none",
  },

  heroContent: {
    position: "absolute",
    left: "16px",
    right: "16px",
    bottom: "16px",
    color: "#fff",
  },

  heroTitle: {
    fontSize: "24px",
    lineHeight: 1.06,
    fontWeight: "800",
    marginBottom: "10px",
    letterSpacing: "-0.5px",
    textShadow: "0 3px 14px rgba(0,0,0,0.28)",
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
  },

  heroProofRow: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap",
    marginBottom: "10px",
  },

  heroHook: {
    fontSize: "13px",
    lineHeight: 1.5,
    color: "rgba(255,255,255,0.92)",
    marginBottom: "10px",
    display: "-webkit-box",
    WebkitLineClamp: 3,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
    textShadow: "0 2px 10px rgba(0,0,0,0.24)",
  },

  heroMetaChip: {
    fontSize: "11px",
    background: "rgba(255,255,255,0.16)",
    padding: "6px 10px",
    borderRadius: "999px",
    backdropFilter: "blur(8px)",
    border: "1px solid rgba(255,255,255,0.08)",
  },

  heroButtonRow: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
  },

  readNowBtn: {
    border: "none",
    background: "#ffffff",
    color: "#111827",
    padding: "11px 16px",
    borderRadius: "999px",
    fontWeight: "800",
    fontSize: "13px",
    cursor: "pointer",
    boxShadow: "0 10px 24px rgba(0,0,0,0.14)",
  },

  continueCard: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "12px",
    borderRadius: "18px",
    background: "#f8f9fd",
    border: "1px solid #edf0f6",
    marginBottom: "18px",
    cursor: "pointer",
  },

  continueCover: {
    width: "56px",
    height: "78px",
    borderRadius: "10px",
    objectFit: "cover",
    flexShrink: 0,
  },

  continueContent: {
    flex: 1,
    minWidth: 0,
  },

  continueLabel: {
    fontSize: "11px",
    fontWeight: "800",
    color: "#ff6b3d",
    marginBottom: "4px",
  },

  continueTitle: {
    fontSize: "14px",
    fontWeight: "800",
    color: "#111827",
    marginBottom: "4px",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },

  continueSub: {
    fontSize: "12px",
    color: "#7c8496",
    marginBottom: "8px",
  },

  progressTrack: {
    width: "100%",
    height: "6px",
    borderRadius: "999px",
    background: "#e7ebf3",
    overflow: "hidden",
  },

  progressFill: {
    width: "42%",
    height: "100%",
    borderRadius: "999px",
    background: "linear-gradient(90deg, #ff7a59 0%, #ffb36b 100%)",
  },

  continueArrow: {
    fontSize: "24px",
    color: "#9aa1b3",
    lineHeight: 1,
  },

  sectionHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "12px",
  },

  sectionTitle: {
    fontSize: "17px",
    fontWeight: "800",
    color: "#111827",
    letterSpacing: "-0.2px",
  },

  sectionLink: {
    border: "none",
    background: "transparent",
    color: "#ff6b3d",
    fontSize: "12px",
    fontWeight: "700",
    cursor: "pointer",
  },

  horizontalList: {
    display: "flex",
    gap: "12px",
    overflowX: "auto",
    paddingBottom: "18px",
    marginBottom: "2px",
  },

  horizontalCard: {
    minWidth: "118px",
    maxWidth: "118px",
    position: "relative",
    cursor: "pointer",
  },

  rankBadge: {
    position: "absolute",
    top: "8px",
    left: "8px",
    zIndex: 2,
    background: "#111827",
    color: "#fff",
    fontSize: "10px",
    fontWeight: "800",
    padding: "5px 8px",
    borderRadius: "999px",
    boxShadow: "0 6px 16px rgba(17,24,39,0.22)",
  },

  horizontalCover: {
    width: "118px",
    height: "164px",
    objectFit: "cover",
    borderRadius: "16px",
    display: "block",
    boxShadow: "0 12px 26px rgba(17,24,39,0.10)",
  },

  horizontalTitle: {
    fontSize: "12px",
    fontWeight: "800",
    color: "#111827",
    marginTop: "8px",
    lineHeight: 1.3,
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
    minHeight: "32px",
  },

  horizontalAuthor: {
    fontSize: "11px",
    color: "#8a91a3",
    marginTop: "4px",
  },

  recommendList: {
    paddingBottom: "8px",
  },

  bookRow: {
    display: "flex",
    gap: "12px",
    marginBottom: "14px",
    cursor: "pointer",
    padding: "12px",
    borderRadius: "20px",
    background: "#ffffff",
    border: "1px solid #eff2f6",
    boxShadow: "0 10px 26px rgba(17,24,39,0.06)",
  },

  bookCover: {
    width: "78px",
    height: "112px",
    borderRadius: "14px",
    objectFit: "cover",
    flexShrink: 0,
    boxShadow: "0 10px 20px rgba(17,24,39,0.10)",
  },

  bookContent: {
    flex: 1,
    minWidth: 0,
  },

  bookProofRow: {
    display: "flex",
    gap: "6px",
    flexWrap: "wrap",
    marginBottom: "8px",
  },

  bookProofChip: {
    fontSize: "10px",
    fontWeight: "800",
    color: "#5e6575",
    background: "#f4f6fa",
    padding: "5px 8px",
    borderRadius: "999px",
    border: "1px solid #e9edf4",
  },

  bookBottomRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "8px",
  },

  bookTag: {
    fontSize: "11px",
    color: "#ff6b3d",
    fontWeight: "800",
    background: "#fff3ee",
    border: "1px solid #ffd9cf",
    padding: "6px 10px",
    borderRadius: "999px",
  },

  bookTopRow: {
    display: "flex",
    gap: "8px",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: "6px",
  },

  bookTitle: {
    fontSize: "16px",
    fontWeight: "800",
    color: "#111827",
    lineHeight: 1.2,
    flex: 1,
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
  },

  hotLabel: {
    fontSize: "10px",
    fontWeight: "800",
    color: "#ff5d3d",
    background: "#fff1ed",
    border: "1px solid #ffd9cf",
    padding: "4px 7px",
    borderRadius: "999px",
    flexShrink: 0,
  },

  bookDesc: {
    fontSize: "12px",
    color: "#6f7788",
    lineHeight: 1.5,
    marginBottom: "10px",
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
  },

  readMiniBtn: {
    fontSize: "12px",
    fontWeight: "800",
    color: "#ffffff",
    background: "linear-gradient(135deg, #111827 0%, #2b3240 100%)",
    padding: "9px 13px",
    borderRadius: "999px",
    flexShrink: 0,
    boxShadow: "0 8px 18px rgba(17,24,39,0.12)",
  },

  emptyState: {
    padding: "60px 20px 90px",
    textAlign: "center",
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
    color: "#7b8191",
    lineHeight: 1.5,
  },

  heroSkeleton: {
    height: "290px",
    borderRadius: "24px",
    background: "linear-gradient(90deg, #f3f4f7 25%, #eceef3 50%, #f3f4f7 75%)",
    marginBottom: "18px",
  },

  horizontalSkeletonCover: {
    width: "118px",
    height: "164px",
    borderRadius: "16px",
    background: "linear-gradient(90deg, #f3f4f7 25%, #eceef3 50%, #f3f4f7 75%)",
  },

  horizontalSkeletonText: {
    width: "90%",
    height: "12px",
    borderRadius: "8px",
    background: "#eef1f6",
    marginTop: "10px",
  },

  horizontalSkeletonSub: {
    width: "65%",
    height: "10px",
    borderRadius: "8px",
    background: "#f3f5f9",
    marginTop: "8px",
  },

  recommendSkeleton: {
    height: "126px",
    borderRadius: "18px",
    background: "linear-gradient(90deg, #f3f4f7 25%, #eceef3 50%, #f3f4f7 75%)",
    marginBottom: "14px",
  },

  bottomSpace: {
    height: "70px",
  },

  bottomNav: {
    position: "fixed",
    bottom: 0,
    left: "50%",
    transform: "translateX(-50%)",
    width: "100%",
    maxWidth: "430px",
    height: "60px",
    background: "#fff",
    borderTop: "1px solid #eee",
    display: "flex",
    justifyContent: "space-around",
    alignItems: "center",
  },

  navItem: {
    border: "none",
    background: "transparent",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    color: "#bbb",
    fontSize: "10px",
  },

  navItemActive: {
    border: "none",
    background: "transparent",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    color: "#111",
    fontSize: "10px",
  },

  navLabel: {
    color: "#bbb",
    fontSize: "10px",
  },

  navLabelActive: {
    color: "#111",
    fontSize: "10px",
    fontWeight: "600",
  },
};

export default Home;