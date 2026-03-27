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
import { useEffect, useState } from "react";
import BottomNav from "./BottomNav";
import { supabase } from "./supabaseClient";

const API_BASE =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

function My() {
  const navigate = useNavigate();

  const [coins, setCoins] = useState(0);
  const [autoUnlock, setAutoUnlock] = useState(false);
  const [toast, setToast] = useState("");
  const [authUser, setAuthUser] = useState(null);
  const [appUser, setAppUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchSessionUser = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/user/me`, {
        method: "GET",
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("Fetch session user error:", data.error);
        setAppUser(null);
        setCoins(0);
        setAutoUnlock(false);
        return null;
      }

      setAppUser(data.user || null);
      setCoins(data.user?.coins || 0);
      setAutoUnlock(Boolean(data.user?.auto_unlock));
      return data.user;
    } catch (error) {
      console.error("fetchSessionUser error:", error);
      setAppUser(null);
      setCoins(0);
      setAutoUnlock(false);
      return null;
    }
  };

  const linkAuthToSessionUser = async (accessToken) => {
    try {
      if (!accessToken) return null;

      const response = await fetch(`${API_BASE}/api/session/link-auth`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("Link auth error:", data.error);
        return null;
      }

      console.log("✅ Linked auth to session user");

      setAppUser(data.user || null);
      setCoins(data.user?.coins || 0);
      setAutoUnlock(Boolean(data.user?.auto_unlock));
      return data.user;
    } catch (error) {
      console.error("linkAuthToSessionUser error:", error);
      return null;
    }
  };

  const updateAutoUnlock = async (nextValue) => {
    try {
      const response = await fetch(`${API_BASE}/api/user/auto-unlock`, {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          autoUnlock: nextValue,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("Auto unlock update error:", data.error);
        setToast("Failed to update auto unlock");
        return;
      }

      setAutoUnlock(Boolean(data.user?.auto_unlock));
    } catch (error) {
      console.error("updateAutoUnlock error:", error);
      setToast("Failed to update auto unlock");
    }
  };

  useEffect(() => {
    const initUser = async () => {
      setLoading(true);

      try {
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError) {
          console.error("Auth getUser error:", authError);
        }

        setAuthUser(user || null);

        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) {
          console.error("Get session error:", sessionError.message);
        }

        if (session?.access_token) {
          await linkAuthToSessionUser(session.access_token);
        } else {
          await fetchSessionUser();
        }
      } finally {
        setLoading(false);
      }
    };

    initUser();
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(""), 2000);
    return () => clearTimeout(timer);
  }, [toast]);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Logout error:", error.message);
      return;
    }

    setAuthUser(null);

    // Keep session user from backend cookie if your backend supports guest session persistence.
    await fetchSessionUser();

    window.location.href = "/my";
  };

  const user = {
    name: authUser?.user_metadata?.name || authUser?.email || "Guest",
    id: appUser?.id?.slice(0, 6) || "----",
    badge: "Reader",
  };

  const showSoon = (label) => {
    setToast(`${label} coming soon`);
  };

  const menu = [
    {
      icon: <History size={19} />,
      label: "Reading History",
      onClick: () => showSoon("Reading History"),
    },
    {
      icon: <Wallet size={19} />,
      label: "Transaction Record",
      onClick: () => showSoon("Transaction Record"),
    },
    {
      icon: <Wallet size={19} />,
      label: "Coins Consumption Record",
      onClick: () => showSoon("Coins Consumption Record"),
    },
    {
      icon: <BookOpen size={19} />,
      label: "Unlocked Series",
      onClick: () => navigate("/bookshelf"),
    },
    {
      icon: <MessageSquare size={19} />,
      label: "Feedback Center",
      onClick: () => showSoon("Feedback Center"),
    },
    {
      icon: <Settings size={19} />,
      label: "Auto Unlock Chapter",
      toggle: true,
    },
    {
      icon: <Settings size={19} />,
      label: "Settings",
      onClick: () => showSoon("Settings"),
    },
  ];

  return (
    <div style={styles.page}>
      <div style={styles.phoneFrame}>
        <div style={styles.header}>
          <div style={styles.profile}>
            <div style={styles.avatar}>{user.name.charAt(0)}</div>

            <div style={styles.profileTextWrap}>
              <div style={styles.name}>{loading ? "Loading..." : user.name}</div>
              <div style={styles.sub}>ID: {user.id} · Welcome back</div>
            </div>
          </div>

          {authUser ? (
            <button style={styles.loginBtn} onClick={handleLogout}>
              Log out
            </button>
          ) : (
            <button
              style={styles.loginBtn}
              onClick={async () => {
                const { error } = await supabase.auth.signInWithOAuth({
                  provider: "google",
                  options: {
                    redirectTo: `${window.location.origin}/my`,
                  },
                });

                if (error) {
                  console.error("Login error:", error.message);
                }
              }}
            >
              Log in
            </button>
          )}
        </div>

        <div style={styles.walletShell}>
          <div style={styles.walletTop}>
            <div>
              <div style={styles.walletEyebrow}>Account</div>
              <div style={styles.walletTitle}>My Wallet</div>
            </div>

            <div style={styles.walletBadge}>
              <Sparkles size={14} />
              {user.badge}
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

            <button style={styles.subscribe} onClick={() => navigate("/")}>
              Subscribe
            </button>
          </div>
        </div>

        <div style={styles.sectionTitle}>My Activity</div>

        <div style={styles.menuCard}>
          {menu.map((item, i) => (
            <button
              key={item.label}
              type="button"
              onClick={item.toggle ? undefined : item.onClick}
              style={{
                ...styles.menuRow,
                ...(i !== menu.length - 1 ? styles.menuRowBorder : {}),
                ...(item.toggle ? styles.menuRowStatic : {}),
              }}
            >
              <div style={styles.menuLeft}>
                <div style={styles.menuIconWrap}>{item.icon}</div>
                <span style={styles.menuText}>{item.label}</span>
              </div>

              {item.toggle ? (
                <button
                  type="button"
                  onClick={async (e) => {
                    e.stopPropagation();
                    const nextValue = !autoUnlock;
                    setAutoUnlock(nextValue);
                    await updateAutoUnlock(nextValue);
                  }}
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
                  />
                </button>
              ) : (
                <ChevronRight size={18} color="#9aa1b3" />
              )}
            </button>
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

        {toast ? <div style={styles.toast}>{toast}</div> : null}
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
    position: "relative",
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
    width: "100%",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px",
    background: "#fff",
    border: "none",
    textAlign: "left",
    cursor: "pointer",
  },

  menuRowStatic: {
    cursor: "default",
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

  toast: {
    position: "fixed",
    left: "50%",
    bottom: "90px",
    transform: "translateX(-50%)",
    background: "rgba(17,24,39,0.92)",
    color: "#fff",
    padding: "10px 14px",
    borderRadius: "999px",
    fontSize: "12px",
    fontWeight: "700",
    boxShadow: "0 10px 24px rgba(0,0,0,0.18)",
    zIndex: 20,
  },
};

export default My;