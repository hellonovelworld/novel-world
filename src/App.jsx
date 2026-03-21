import { useNavigate } from "react-router-dom";

function App() {
  const navigate = useNavigate();

  const catalogueText = `
I checked my phone for the sixth time in twenty minutes. Six missed calls from Ryan, but not a single text explaining where he was. Around me, the Metro Denver Prenatal Clinic buzzed with life—expectant mothers nestled against their partners' shoulders, fingers intertwined, sharing whispered excitement about the images they would soon see. I sat alone, my wedding ring suddenly heavy on my finger.
`;

  return (
    <div style={styles.page}>
      <div style={styles.phoneFrame}>
        <div style={styles.heroSection}>
          <div style={styles.backgroundWrap}>
            <div style={styles.backgroundImage}></div>
            <div style={styles.backgroundOverlay}></div>
          </div>

          <button
            onClick={() => window.history.back()}
            style={styles.backButton}
          >
            ‹
          </button>

          <div style={styles.heroContent}>
            <img src="/cover.jpg" alt="Book cover" style={styles.cover} />
            <h1 style={styles.title}>
              Divorce After His Betrayal with the Nanny
            </h1>
            <p style={styles.author}>Completed | Jane Austen</p>
          </div>
        </div>

        <div style={styles.previewCard}>
          <div style={styles.quoteHeader}>
            <span style={styles.quoteMark}>“</span>
            <div style={styles.quoteLine}></div>
          </div>

          <p style={styles.previewParagraph}>
            I checked my phone for the sixth time in twenty minutes. Six missed
            calls from Ryan, but not a single text explaining where he was.
            Around me, the Metro Denver Prenatal Clinic buzzed with
            life—expectant mothers nestled against their partners&apos;
            shoulders, fingers intertwined, sharing whispered excitement about
            the images they would soon see. I sat alone, my wedding ring
            suddenly heavy on my finger. My hand instinctively moved to my
            rounded belly, feeling the slight flutter that had become familiar
            these past few weeks. Twenty weeks. Halfway there. Today was our
            anatomy scan—the day we&apos;d confirm our baby was developing
            properly, maybe even learn if we were having a boy or girl.
          </p>

          <div style={styles.quoteFooter}>”</div>
        </div>

        <div style={styles.catalogueCard}>
          <div style={styles.catalogueHeader}>
            <div style={styles.catalogueTitle}>Catalogue</div>
            <div style={styles.catalogueLatest}>
              Latest chapter: Chapter 10 &gt;
            </div>
          </div>

          <p style={styles.catalogueParagraph}>{catalogueText}</p>
        </div>

        <div style={styles.bottomSpace}></div>

        <div style={styles.stickyBar}>
          <button
            style={styles.stickyButton}
            onClick={() => navigate("/chapter/1")}
          >
            Start Reading
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
    background: "#efefef",
    position: "relative",
    margin: "0 auto",
    fontFamily:
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
  },

  heroSection: {
    position: "relative",
    height: "330px",
    overflow: "hidden",
  },

  backgroundWrap: {
    position: "absolute",
    inset: 0,
    overflow: "hidden",
  },

  backgroundImage: {
    position: "absolute",
    inset: "-20px",
    backgroundImage: 'url("/cover.jpg")',
    backgroundSize: "cover",
    backgroundPosition: "center",
    filter: "blur(22px)",
    transform: "scale(1.18)",
  },

  backgroundOverlay: {
    position: "absolute",
    inset: 0,
    background: "rgba(255,255,255,0.62)",
  },

  backButton: {
    position: "absolute",
    top: "10px",
    left: "8px",
    width: "30px",
    height: "30px",
    border: "none",
    background: "transparent",
    color: "#111111",
    fontSize: "34px",
    lineHeight: 1,
    cursor: "pointer",
    zIndex: 5,
    padding: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  heroContent: {
    position: "relative",
    zIndex: 2,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    paddingTop: "20px",
    textAlign: "center",
  },

  cover: {
    width: "78px",
    height: "128px",
    objectFit: "cover",
    borderRadius: "10px",
    marginBottom: "10px",
    boxShadow: "0 4px 10px rgba(0,0,0,0.08)",
  },

  title: {
    margin: "0 24px 4px",
    fontSize: "14px",
    lineHeight: "1.25",
    fontWeight: "700",
    color: "#111111",
  },

  author: {
    margin: 0,
    fontSize: "11px",
    color: "#8a8a8a",
    fontWeight: "400",
  },

  previewCard: {
    position: "relative",
    zIndex: 3,
    background: "#ffffff",
    margin: "-36px 14px 14px",
    borderRadius: "4px",
    padding: "10px 12px 8px",
  },

  quoteHeader: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginBottom: "8px",
  },

  quoteMark: {
    fontSize: "28px",
    lineHeight: 1,
    color: "#f1c8aa",
  },

  quoteLine: {
    width: "220px",
    height: "2px",
    background: "#f1c8aa",
    borderRadius: "999px",
  },

  previewParagraph: {
    margin: 0,
    fontSize: "11px",
    lineHeight: "1.6",
    color: "#2a2a2a",
    textAlign: "left",
  },

  quoteFooter: {
    textAlign: "right",
    color: "#f1c8aa",
    fontSize: "24px",
    lineHeight: 1,
    marginTop: "2px",
  },

  catalogueCard: {
    margin: "0 14px",
    background: "#efefef",
  },

  catalogueHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "8px 0",
    borderTop: "1px solid #e3e3e3",
    borderBottom: "1px solid #e3e3e3",
    marginBottom: "10px",
  },

  catalogueTitle: {
    fontSize: "11px",
    fontWeight: "700",
    color: "#111111",
  },

  catalogueLatest: {
    fontSize: "10px",
    color: "#a0a0a0",
  },

  catalogueParagraph: {
    margin: 0,
    fontSize: "11px",
    lineHeight: "1.6",
    color: "#2b2b2b",
    textAlign: "left",
    whiteSpace: "pre-line",
  },

  bottomSpace: {
    height: "70px",
  },

  stickyBar: {
    position: "fixed",
    left: "50%",
    transform: "translateX(-50%)",
    bottom: "8px",
    width: "100%",
    maxWidth: "430px",
    padding: "0 16px",
    boxSizing: "border-box",
    zIndex: 20,
  },

  stickyButton: {
    width: "100%",
    height: "34px",
    border: "none",
    borderRadius: "4px",
    background: "#111111",
    color: "#ffffff",
    fontSize: "11px",
    fontWeight: "600",
    cursor: "pointer",
  },
};

export default App;