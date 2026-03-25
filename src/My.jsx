import { useNavigate } from "react-router-dom";
import {
  History,
  Wallet,
  MessageSquare,
  Settings,
  BookOpen,
  Crown,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { getCoins } from "./wallet";
import { useEffect, useState } from "react";
import BottomNav from "./BottomNav";

function My() {
  const navigate = useNavigate();
  const [coins, setCoins] = useState(0);
  const [autoUnlock, setAutoUnlock] = useState(false);

  useEffect(() => {
    setCoins(getCoins());
  }, []);

  const menu = [
    { icon: <History size={19} />, label: "Reading History" },
    { icon: <Wallet size={19} />, label: "Transaction Record" },
    { icon: <Wallet size={19} />, label: "Coins Consumption Record" },
    { icon: <BookOpen size={19} />, label: "Unlocked Series" },
    { icon: <MessageSquare size={19} />, label: "Feedback Center" },
    {
      icon: <Settings size={19} />,
      label: "Auto Unlock Chapter",
      toggle: true,
    },
    { icon: <Settings size={19} />, label: "Settings" },
  ];

  return (
    <div style={styles.page}>
      <div style={styles.phoneFrame}>
        <div style={styles.header}>
          <div style={styles.profile}>
            <div style={styles.avatar}>M</div>

            <div style={styles.profileTextWrap}>
              <div style={styles.name}>Master-4881721</div>
              <div style={styles.sub}>ID: 4881721 · Welcome back</div>
            </div>
          </div>

          <button style={styles.loginBtn}>Log in</button>
        </div>

        <div style={styles.walletShell}>
          <div style={styles.walletTop}>
            <div>
              <div style={styles.walletEyebrow}>Account</div>
              <div style={styles.walletTitle}>My Wallet</div>
            </div>

            <div style={styles.walletBadge}>
              <Sparkles size={14} />
              Reader
            </div>
          </div>

          <div style={styles.walletStats}>
            <div style={styles.walletStatCard}>
              <div style={styles.walletNumber}>{coins}</div>
              <div style={styles.walletLabel}>Coins</div>
            </div>

            <div style={styles.walletStatCard}>
              <div style={styles.walletNumber}>0</div>
              <div style={styles.walletLabel}>Bonus</div>
            </div>
          </div>

          <div style={styles.svipCard}>
            <div style={styles.svipLeft}>
              <div style={styles.svipIconWrap}>
                <Crown size={18} />
              </div>

              <div>
                <div style={styles.svipTitle}>SVIP Membership</div>
                <div style={styles.svipText}>
                  Unlock all novels and read without restrictions
                </div>
              </div>
            </div>

            <button
              style={styles.subscribe}
              onClick={() => navigate("/")}
            >
              Subscribe
            </button>
          </div>
        </div>

        <div style={styles.sectionTitle}>My Activity</div>

        <div style={styles.menuCard}>
          {menu.map((item, i) => (
            <div
              key={i}
              style={{
                ...styles.menuRow,
                ...(i !== menu.length - 1 ? styles.menuRowBorder : {}),
              }}
            >
              <div style={styles.menuLeft}>
                <div style={styles.menuIconWrap}>{item.icon}</div>
                <span style={styles.menuText}>{item.label}</span>
              </div>

              {item.toggle ? (
                <button
                  type="button"
                  onClick={() => setAutoUnlock((prev) => !prev)}
                  style={{
                    ...styles.toggle,
                    ...(autoUnlock ? styles.toggleActive : {}),
                  }}
                >
                  <div
                    style={{
                      ...styles.toggleCircle,
                      ...(autoUnlock ? styles.toggleCircleActive : {}),
                    }}
                  ></div>
                </button>
              ) : (
                <ChevronRight size={18} color="#9aa1b3" />
              )}
            </div>
          ))}
        </div>

        <div style={styles.tipCard}>
          <div style={styles.tipTitle}>Reading Tip</div>
          <div style={styles.tipText}>
            Subscribe to SVIP for the smoothest binge-reading experience.
          </div>
        </div>

        <div style={styles.bottomSpace}></div>

        <BottomNav active="my" />
      </div>
    </div>
  );
}

const styles = {
  page: {
    background: "linear-gradient(180deg, #f6f7fb 0%, #eef1f8 100%)",
    minHeight: "100vh",
  },

  phoneFrame: {
    maxWidth: "430px",
    minHeight: "100vh",
    margin: "0 auto",
    background: "transparent",
    padding: "18px 16px 0",
    fontFamily:
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "18px",
  },

  profile: {
    display: "flex",
    gap: "12px",
    alignItems: "center",
    minWidth: 0,
  },

  avatar: {
    width: "48px",
    height: "48px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #ffe6ea 0%, #ffd7df 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#ff5c77",
    fontWeight: "800",
    fontSize: "24px",
    flexShrink: 0,
    boxShadow: "0 8px 18px rgba(255,92,119,0.16)",
  },

  profileTextWrap: {
    minWidth: 0,
  },

  name: {
    fontWeight: "800",
    fontSize: "16px",
    color: "#111827",
    lineHeight: 1.2,
    marginBottom: "3px",
  },

  sub: {
    fontSize: "12px",
    color: "#8b93a6",
  },

  loginBtn: {
    border: "none",
    background: "#ffffff",
    color: "#6b7280",
    fontSize: "13px",
    fontWeight: "700",
    borderRadius: "999px",
    padding: "10px 14px",
    boxShadow: "0 8px 20px rgba(17,24,39,0.06)",
    cursor: "pointer",
  },

  walletShell: {
    background: "#ffffff",
    borderRadius: "24px",
    padding: "16px",
    marginBottom: "18px",
    boxShadow: "0 14px 36px rgba(17,24,39,0.06)",
    border: "1px solid #edf0f5",
  },

  walletTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "10px",
    marginBottom: "14px",
  },

  walletEyebrow: {
    fontSize: "11px",
    fontWeight: "800",
    color: "#ff7a59",
    marginBottom: "4px",
    textTransform: "uppercase",
    letterSpacing: "0.4px",
  },

  walletTitle: {
    fontWeight: "800",
    fontSize: "28px",
    color: "#111827",
    letterSpacing: "-0.4px",
  },

  walletBadge: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    background: "#fff5ef",
    color: "#ff6b3d",
    border: "1px solid #ffd9cc",
    padding: "7px 10px",
    borderRadius: "999px",
    fontSize: "11px",
    fontWeight: "800",
    whiteSpace: "nowrap",
  },

  walletStats: {
    display: "flex",
    gap: "12px",
    marginBottom: "14px",
  },

  walletStatCard: {
    flex: 1,
    background: "linear-gradient(180deg, #fff9f2 0%, #fff4e6 100%)",
    border: "1px solid #f5dfbe",
    borderRadius: "18px",
    padding: "14px",
  },

  walletNumber: {
    fontSize: "30px",
    fontWeight: "800",
    color: "#111827",
    lineHeight: 1,
    marginBottom: "6px",
  },

  walletLabel: {
    fontSize: "12px",
    color: "#8b93a6",
    fontWeight: "700",
  },

  svipCard: {
    background: "linear-gradient(135deg, #171a67 0%, #23278f 100%)",
    color: "#fff",
    borderRadius: "20px",
    padding: "15px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "12px",
  },

  svipLeft: {
    display: "flex",
    gap: "12px",
    alignItems: "center",
    minWidth: 0,
  },

  svipIconWrap: {
    width: "38px",
    height: "38px",
    borderRadius: "12px",
    background: "rgba(255,255,255,0.14)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  svipTitle: {
    fontSize: "15px",
    fontWeight: "800",
    marginBottom: "4px",
  },

  svipText: {
    fontSize: "12px",
    color: "#d8dcff",
    lineHeight: 1.4,
  },

  subscribe: {
    background: "#f6dfad",
    color: "#111827",
    border: "none",
    padding: "11px 16px",
    borderRadius: "999px",
    fontSize: "12px",
    fontWeight: "800",
    whiteSpace: "nowrap",
    cursor: "pointer",
    flexShrink: 0,
  },

  sectionTitle: {
    fontSize: "18px",
    fontWeight: "800",
    color: "#111827",
    marginBottom: "12px",
    letterSpacing: "-0.2px",
  },

  menuCard: {
    background: "#ffffff",
    borderRadius: "24px",
    overflow: "hidden",
    border: "1px solid #edf0f5",
    boxShadow: "0 12px 30px rgba(17,24,39,0.05)",
    marginBottom: "14px",
  },

  menuRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px",
    background: "#fff",
  },

  menuRowBorder: {
    borderBottom: "1px solid #f1f3f7",
  },

  menuLeft: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    minWidth: 0,
  },

  menuIconWrap: {
    width: "36px",
    height: "36px",
    borderRadius: "12px",
    background: "#f7f8fc",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#111827",
    flexShrink: 0,
  },

  menuText: {
    fontSize: "14px",
    fontWeight: "700",
    color: "#111827",
  },

  toggle: {
    width: "44px",
    height: "26px",
    background: "#e5e7eb",
    borderRadius: "999px",
    position: "relative",
    border: "none",
    cursor: "pointer",
    transition: "all 0.2s ease",
    flexShrink: 0,
  },

  toggleActive: {
    background: "#ff7a59",
  },

  toggleCircle: {
    width: "22px",
    height: "22px",
    background: "#fff",
    borderRadius: "50%",
    position: "absolute",
    top: "2px",
    left: "2px",
    transition: "all 0.2s ease",
    boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
  },

  toggleCircleActive: {
    left: "20px",
  },

  tipCard: {
    background: "linear-gradient(180deg, #fff8f3 0%, #fff3ea 100%)",
    border: "1px solid #ffe0cf",
    borderRadius: "18px",
    padding: "14px 16px",
    marginBottom: "8px",
  },

  tipTitle: {
    fontSize: "13px",
    fontWeight: "800",
    color: "#ff6b3d",
    marginBottom: "4px",
  },

  tipText: {
    fontSize: "12px",
    color: "#7b8191",
    lineHeight: 1.45,
  },

  bottomSpace: {
    height: "76px",
  },
};

export default My;