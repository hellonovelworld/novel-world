import { useNavigate } from "react-router-dom";
import {
  History,
  Wallet,
  MessageSquare,
  Settings,
  BookOpen,
  Crown,
  ChevronRight,
  User,
  Home,
  Library,
} from "lucide-react";

import { getCoins } from "./wallet";
import { useEffect, useState } from "react";

function My() {
  const navigate = useNavigate();

  const [coins, setCoins] = useState(0);

  useEffect(() => {
    setCoins(getCoins());
  }, []);

  const menu = [
    { icon: <History size={18} />, label: "Reading history" },
    { icon: <Wallet size={18} />, label: "Transaction record" },
    { icon: <Wallet size={18} />, label: "Coins consumption record" },
    { icon: <BookOpen size={18} />, label: "Unlocked short series list" },
    { icon: <MessageSquare size={18} />, label: "Feedback center" },
    { icon: <Settings size={18} />, label: "Auto unlock chapter", toggle: true },
    { icon: <Settings size={18} />, label: "Settings" },
  ];

  return (
    <div style={styles.page}>
      <div style={styles.phoneFrame}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.profile}>
            <div style={styles.avatar}>M</div>

            <div>
              <div style={styles.name}>Master-4881721</div>
              <div style={styles.sub}>ID:4881721 ｜ Hi novel!</div>
            </div>
          </div>

          <div style={styles.login}>Log in ›</div>
        </div>

        {/* Wallet */}
        <div style={styles.walletCard}>
          <div style={styles.walletTitle}>My Wallet</div>

          <div style={styles.walletStats}>
            <div>
              <div style={styles.walletNumber}>{coins}</div>
              <div style={styles.walletLabel}>Coins</div>
            </div>

            <div>
              <div style={styles.walletNumber}>0</div>
              <div style={styles.walletLabel}>Bonus</div>
            </div>
          </div>
        </div>

        {/* SVIP */}
        <div style={styles.svip}>
          <div>
            <div style={styles.svipTitle}>
              <Crown size={16} /> SVIP MEMBERSHIP
            </div>
            <div style={styles.svipText}>
              Read all novels on the site without restrictions
            </div>
          </div>

          <button style={styles.subscribe}>Subscribe now</button>
        </div>

        {/* Menu */}
        <div style={styles.menuCard}>
          {menu.map((item, i) => (
            <div key={i} style={styles.menuRow}>
              <div style={styles.menuLeft}>
                {item.icon}
                <span style={styles.menuText}>{item.label}</span>
              </div>

              {item.toggle ? (
                <div style={styles.toggle}>
                  <div style={styles.toggleCircle}></div>
                </div>
              ) : (
                <ChevronRight size={18} color="#999" />
              )}
            </div>
          ))}
        </div>

        <div style={styles.bottomSpace}></div>

        {/* Bottom Navigation */}
        <div style={styles.bottomNav}>
          <button style={styles.navItem} onClick={() => navigate("/")}>
            <Home size={22} />
            <span style={styles.navLabel}>Home</span>
          </button>

          <button style={styles.navItem}>
            <Library size={22} />
            <span style={styles.navLabel}>Bookshelf</span>
          </button>

          <button style={styles.navItemActive}>
            <User size={22} />
            <span style={styles.navLabelActive}>My</span>
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    background: "#efefef",
    minHeight: "100vh",
  },

  phoneFrame: {
    maxWidth: "430px",
    margin: "0 auto",
    background: "#efefef",
    padding: "16px",
    fontFamily:
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial",
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
  },

  avatar: {
    width: "42px",
    height: "42px",
    borderRadius: "50%",
    background: "#ffe8ea",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#ff5c77",
    fontWeight: "700",
    fontSize: "20px",
  },

  name: {
    fontWeight: "700",
    fontSize: "15px",
  },

  sub: {
    fontSize: "11px",
    color: "#888",
  },

  login: {
    fontSize: "12px",
    color: "#888",
  },

  walletCard: {
    background: "#f3e7d2",
    borderRadius: "8px 8px 0 0",
    padding: "18px",
    border: "1px solid #e6c68f",
  },

  walletTitle: {
    fontWeight: "700",
    marginBottom: "16px",
  },

  walletStats: {
    display: "flex",
    gap: "60px",
  },

  walletNumber: {
    fontSize: "22px",
    fontWeight: "800",
  },

  walletLabel: {
    fontSize: "11px",
    color: "#777",
  },

  svip: {
    background: "#16185f",
    color: "#fff",
    borderRadius: "0 0 8px 8px",
    padding: "16px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "18px",
  },

  svipTitle: {
    fontSize: "12px",
    fontWeight: "700",
    display: "flex",
    gap: "6px",
    alignItems: "center",
    marginBottom: "4px",
  },

  svipText: {
    fontSize: "11px",
    color: "#d7d7ff",
  },

  subscribe: {
    background: "#f4deb2",
    border: "none",
    padding: "8px 14px",
    borderRadius: "20px",
    fontSize: "11px",
    fontWeight: "700",
  },

  menuCard: {
    background: "#fff",
    borderRadius: "8px",
  },

  menuRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "14px 16px",
  },

  menuLeft: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },

  menuText: {
    fontSize: "13px",
  },

  toggle: {
    width: "38px",
    height: "22px",
    background: "#ddd",
    borderRadius: "20px",
    position: "relative",
  },

  toggleCircle: {
    width: "18px",
    height: "18px",
    background: "#fff",
    borderRadius: "50%",
    position: "absolute",
    top: "2px",
    left: "2px",
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

export default My;