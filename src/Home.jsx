import { useNavigate } from "react-router-dom";

function Home() {
  const navigate = useNavigate();

  const topCovers = [
    { title: "He Never Spoke To Me", img: "/cover.jpg" },
    { title: "You Chose Her Over Me?", img: "/cover.jpg" },
    { title: "Five Years of Workplace...", img: "/cover.jpg" },
    { title: "Five Months Pregnant...", img: "/cover.jpg" },
    { title: "After my boyfriend...", img: "/cover.jpg" },
    { title: "My Billionaire Ex's True Love", img: "/cover.jpg" },
    { title: "He Called Me Bed Buddy", img: "/cover.jpg" },
  ];

  const books = [
    {
      title: "He 'Saved' Her 7 Times in the Jungle",
      author: "Bronte",
      tags: ["Romance"],
      desc: `My mercenary husband Jax spent a night in the jungle with his drugged teammate Selene...`,
      img: "/cover.jpg",
    },
    {
      title: "Time Never Said It Forgave",
      author: "Allan Poe",
      tags: ["Realistic", "Romance"],
      desc: `Avery's POV "Mrs. Sterling, I've reviewed the supplementary clauses..."`,
      img: "/cover.jpg",
    },
    {
      title: "My Boyfriend's a Jerk? I'm Marrying a Billionaire!",
      author: "Hemingway",
      tags: ["Romance", "Realistic"],
      desc: `After seven years of secretly dating my best friend's brother...`,
      img: "/cover.jpg",
    },
  ];

  return (
    <div style={styles.page}>
      <div style={styles.phoneFrame}>

        {/* Tabs */}
        <div style={styles.tabs}>
          <span style={styles.activeTab}>Hot</span>
          <span style={styles.tab}>New</span>
          <span style={styles.tab}>Playlet</span>
        </div>

        {/* Search */}
        <div style={styles.searchBox}>
          <span style={styles.searchIcon}>⌕</span>
          <span style={styles.searchText}>Search for novel</span>
        </div>

        {/* Banner */}
        <div style={styles.bannerWrap}>
          <img src="/cover.jpg" alt="Banner" style={styles.banner} />
          <div style={styles.bannerDots}>
            <span style={styles.dotActive}></span>
            <span style={styles.dot}></span>
            <span style={styles.dot}></span>
          </div>
        </div>

        {/* Horizontal Section */}
        <div style={styles.sectionTitle}>Edit Recommend</div>

        <div style={styles.horizontalList}>
          {topCovers.map((item, index) => (
            <div
              key={index}
              style={styles.horizontalCard}
              onClick={() => navigate("/novel")}
            >
              <img src={item.img} alt={item.title} style={styles.horizontalCover} />
              <div style={styles.horizontalText}>{item.title}</div>
            </div>
          ))}
        </div>

        {/* Recommend */}
        <div style={styles.sectionTitle}>Recommend</div>

        <div style={styles.recommendList}>
          {books.map((book, index) => (
            <div
              key={index}
              style={styles.bookRow}
              onClick={() => navigate("/novel")}
            >
              <img src={book.img} alt={book.title} style={styles.bookCover} />

              <div style={styles.bookContent}>
                <div style={styles.bookTitle}>{book.title}</div>
                <div style={styles.bookDesc}>{book.desc}</div>

                <div style={styles.metaRow}>
                  <div style={styles.authorRow}>
                    <span style={styles.authorBadge}>M</span>
                    <span style={styles.authorName}>{book.author}</span>
                  </div>

                  {book.tags.map((tag, i) => (
                    <span key={i} style={styles.tag}>
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div style={styles.bottomSpacer}></div>

        {/* Bottom Navigation */}
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