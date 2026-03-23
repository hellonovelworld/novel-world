import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "./supabaseClient";

function Home() {
  const navigate = useNavigate();
  const [novels, setNovels] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const topNovels = novels.slice(0, 8);
  const recommendNovels = novels;

  return (
    <div style={styles.page}>
      <div style={styles.phoneFrame}>
        <div style={styles.tabs}>
          <span style={styles.activeTab}>Hot</span>
          <span style={styles.tab}>New</span>
          <span style={styles.tab}>Playlet</span>
        </div>

        <div style={styles.searchBox}>
          <span style={styles.searchIcon}>⌕</span>
          <span style={styles.searchText}>Search for novel</span>
        </div>

        <div style={styles.bannerWrap}>
          <img
            src={topNovels[0]?.cover_url || "/cover.jpg"}
            alt="Banner"
            style={styles.banner}
          />
          <div style={styles.bannerDots}>
            <span style={styles.dotActive}></span>
            <span style={styles.dot}></span>
            <span style={styles.dot}></span>
          </div>
        </div>

        <div style={styles.sectionTitle}>Edit Recommend</div>

        <div style={styles.horizontalList}>
          {loading ? (
            <div style={styles.loadingText}>Loading novels...</div>
          ) : topNovels.length === 0 ? (
            <div style={styles.loadingText}>No novels found.</div>
          ) : (
            topNovels.map((item) => (
              <div
                key={item.id}
                style={styles.horizontalCard}
                onClick={() => handleNovelClick(item.slug)}
              >
                <img
                  src={item.cover_url || "/cover.jpg"}
                  alt={item.title}
                  style={styles.horizontalCover}
                />
                <div style={styles.horizontalText}>{item.title}</div>
              </div>
            ))
          )}
        </div>

        <div style={styles.sectionTitle}>Recommend</div>

        <div style={styles.recommendList}>
          {loading ? (
            <div style={styles.loadingText}>Loading novels...</div>
          ) : recommendNovels.length === 0 ? (
            <div style={styles.loadingText}>No novels found.</div>
          ) : (
            recommendNovels.map((book) => (
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
                  <div style={styles.bookTitle}>{book.title}</div>
                  <div style={styles.bookDesc}>
                    {book.description || "No description yet."}
                  </div>

                  <div style={styles.metaRow}>
                    <div style={styles.authorRow}>
                      <span style={styles.authorBadge}>M</span>
                      <span style={styles.authorName}>
                        {book.author || "Unknown Author"}
                      </span>
                    </div>

                    <span style={styles.tag}>Novel</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div style={styles.bottomSpacer}></div>

        <div style={styles.bottomNav}>
          <button style={styles.navItemActive} onClick={() => navigate("/")}>
            <div style={styles.navIconActive}>⌂</div>
            <div style={styles.navLabelActive}>Home</div>
          </button>

          <button style={styles.navItem} onClick={() => navigate("/bookshelf")}>
            <div style={styles.navIcon}>▭</div>
            <div style={styles.navLabel}>Bookshelf</div>
          </button>

          <button style={styles.navItem} onClick={() => navigate("/my")}>
            <div style={styles.navIcon}>◯</div>
            <div style={styles.navLabel}>My</div>
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    width: "100%",
    minHeight: "100vh",
    background: "#efefef",
  },

  phoneFrame: {
    width: "100%",
    maxWidth: "430px",
    minHeight: "100vh",
    background: "#fff",
    margin: "0 auto",
    fontFamily:
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
  },

  tabs: {
    display: "flex",
    gap: "18px",
    padding: "14px 16px 10px",
    fontSize: "14px",
  },

  activeTab: {
    fontWeight: "700",
    color: "#111",
  },

  tab: {
    color: "#bfbfbf",
    fontWeight: "600",
  },

  searchBox: {
    margin: "0 16px 14px",
    height: "40px",
    borderRadius: "10px",
    background: "#f5f5f5",
    display: "flex",
    alignItems: "center",
    padding: "0 12px",
    gap: "8px",
  },

  searchIcon: {
    color: "#888",
    fontSize: "16px",
  },

  searchText: {
    color: "#c0c0c0",
    fontSize: "12px",
  },

  bannerWrap: {
    margin: "0 16px 16px",
    position: "relative",
  },

  banner: {
    width: "100%",
    height: "120px",
    objectFit: "cover",
    borderRadius: "6px",
  },

  bannerDots: {
    position: "absolute",
    bottom: "10px",
    left: "50%",
    transform: "translateX(-50%)",
    display: "flex",
    gap: "5px",
  },

  dot: {
    width: "6px",
    height: "6px",
    borderRadius: "50%",
    background: "rgba(255,255,255,0.5)",
  },

  dotActive: {
    width: "6px",
    height: "6px",
    borderRadius: "50%",
    background: "#fff",
  },

  sectionTitle: {
    fontSize: "12px",
    fontWeight: "700",
    margin: "0 16px 10px",
  },

  horizontalList: {
    display: "flex",
    gap: "10px",
    overflowX: "auto",
    padding: "0 16px 18px",
  },

  horizontalCard: {
    minWidth: "90px",
    cursor: "pointer",
  },

  horizontalCover: {
    width: "90px",
    height: "130px",
    objectFit: "cover",
    borderRadius: "4px",
  },

  horizontalText: {
    fontSize: "11px",
    marginTop: "6px",
  },

  recommendList: {
    padding: "0 16px",
  },

  bookRow: {
    display: "flex",
    gap: "10px",
    marginBottom: "14px",
    cursor: "pointer",
  },

  bookCover: {
    width: "52px",
    height: "74px",
    borderRadius: "4px",
    objectFit: "cover",
  },

  bookContent: {
    flex: 1,
  },

  bookTitle: {
    fontSize: "12px",
    fontWeight: "700",
    marginBottom: "4px",
  },

  bookDesc: {
    fontSize: "11px",
    color: "#888",
    marginBottom: "6px",
  },

  metaRow: {
    display: "flex",
    gap: "6px",
    alignItems: "center",
  },

  authorRow: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
  },

  authorBadge: {
    width: "14px",
    height: "14px",
    borderRadius: "50%",
    background: "#ffe8eb",
    color: "#ff6680",
    fontSize: "9px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  authorName: {
    fontSize: "11px",
    color: "#666",
  },

  tag: {
    fontSize: "10px",
    background: "#e6f4f1",
    padding: "3px 8px",
    borderRadius: "4px",
  },

  loadingText: {
    fontSize: "12px",
    color: "#666",
    padding: "8px 0",
  },

  bottomSpacer: {
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
    textAlign: "center",
    color: "#bbb",
    fontSize: "10px",
    cursor: "pointer",
  },

  navItemActive: {
    border: "none",
    background: "transparent",
    textAlign: "center",
    color: "#111",
    fontSize: "10px",
    cursor: "pointer",
  },

  navIcon: {
    fontSize: "22px",
    marginBottom: "4px",
    color: "#bbb",
  },

  navIconActive: {
    fontSize: "22px",
    marginBottom: "4px",
    color: "#111",
  },

  navLabel: {
    color: "#bbb",
  },

  navLabelActive: {
    color: "#111",
    fontWeight: "600",
  },
};

export default Home;
