import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "./supabaseClient";
import { List, Settings, Moon, Sun, Bookmark } from "lucide-react";

const API_BASE =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

function Chapter() {
  const { slug, id } = useParams();
  const navigate = useNavigate();

  const [showCatalogue, setShowCatalogue] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showRecommend, setShowRecommend] = useState(false);
  const [recommendedNovel, setRecommendedNovel] = useState(null);
  const [recommendLoading, setRecommendLoading] = useState(false);

  const [coins, setCoins] = useState(0);
  const [unlockedChapters, setUnlockedChapters] = useState([]);
  const [selectedPackKey, setSelectedPackKey] = useState(null);
  const [paypalLoading, setPaypalLoading] = useState(false);
  const [isVip, setIsVip] = useState(false);
  const [vipExpiry, setVipExpiry] = useState(null);

  const [chapters, setChapters] = useState([]);
  const [chaptersLoading, setChaptersLoading] = useState(true);

  const [novelId, setNovelId] = useState(null);
  const [novelTitle, setNovelTitle] = useState(
    "At My Mother’s Funeral, My Husband Chose His Mistress—So I Took Everything"
  );
  const [novelCover, setNovelCover] = useState("/cover.jpg");

  const [showSettings, setShowSettings] = useState(false);
  const [showBottomMenu, setShowBottomMenu] = useState(false);

  const [fontSize, setFontSize] = useState(15);
  const [isNightMode, setIsNightMode] = useState(false);
  const [bookmarks, setBookmarks] = useState({});

  const chapterNumber = Number(id) || 1;
  const lastChapter = chapters.length;

  const packs = [
    {
      key: "pack_1998",
      coins: 1998,
      price: "$19.98",
      amount: "19.98",
      bonus: "+152 Bonus",
      tag: "+8%",
    },
    {
      key: "pack_2999",
      coins: 2999,
      price: "$29.99",
      amount: "29.99",
      bonus: "+291 Bonus",
      tag: "+10%",
    },
    {
      key: "pack_3499",
      coins: 3499,
      price: "$34.99",
      amount: "34.99",
      bonus: "+451 Bonus",
      tag: "+13%",
    },
    {
      key: "pack_3999",
      coins: 3999,
      price: "$39.99",
      amount: "39.99",
      bonus: "+821 Bonus",
      tag: "+21%",
    },
    {
      key: "pack_5999",
      coins: 5999,
      price: "$59.99",
      amount: "59.99",
      bonus: "+1889 Bonus",
      tag: "+31%",
    },
    {
      key: "svip_7day",
      coins: 0,
      price: "$49.99",
      amount: "49.99",
      bonus: "7 Days Unlimited",
      tag: "SVIP",
      isVip: true,
    },
  ];

  const chapter =
    chapters.find((c) => c.chapter_number === chapterNumber) || chapters[0];

  const theme = useMemo(() => {
    return isNightMode
      ? {
          pageBg: "#111111",
          surfaceBg: "#181818",
          topBarBg: "#181818",
          cardBg: "#1f1f1f",
          text: "#f5f5f5",
          subText: "#bbbbbb",
          border: "#2a2a2a",
          navBg: "#222222",
          navText: "#f5f5f5",
          fade:
            "linear-gradient(to bottom, rgba(24,24,24,0), rgba(24,24,24,1))",
          modalBg: "#1e1e1e",
          excerptBg: "#252525",
          drawerBg: "#161616",
          drawerOverlay: "rgba(0,0,0,0.55)",
        }
      : {
          pageBg: "#ffffff",
          surfaceBg: "#fafafa",
          topBarBg: "#fafafa",
          cardBg: "#fafafa",
          text: "#333333",
          subText: "#666666",
          border: "#dddddd",
          navBg: "#f5f5f5",
          navText: "#333333",
          fade:
            "linear-gradient(to bottom, rgba(250,250,250,0), rgba(250,250,250,1))",
          modalBg: "#ffffff",
          excerptBg: "#f6f6f6",
          drawerBg: "#ffffff",
          drawerOverlay: "rgba(0,0,0,0.45)",
        };
  }, [isNightMode]);

  const applyUserData = (user) => {
    const unlocked = Array.isArray(user?.unlocked) ? user.unlocked : [];
    const expiry = user?.vip_expiry || null;
    const vipActive = expiry ? new Date(expiry) > new Date() : false;

    setCoins(Number(user?.coins || 0));
    setUnlockedChapters(unlocked);
    setVipExpiry(expiry);
    setIsVip(vipActive);
  };

  const fetchSessionUser = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/user/me`, {
        method: "GET",
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("Fetch session user error:", data.error);
        setCoins(0);
        setUnlockedChapters([]);
        setVipExpiry(null);
        setIsVip(false);
        return null;
      }

      applyUserData(data.user || {});
      return data.user || null;
    } catch (error) {
      console.error("fetchSessionUser error:", error);
      setCoins(0);
      setUnlockedChapters([]);
      setVipExpiry(null);
      setIsVip(false);
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
      applyUserData(data.user || {});
      return data.user || null;
    } catch (error) {
      console.error("linkAuthToSessionUser error:", error);
      return null;
    }
  };

  useEffect(() => {
    setShowBottomMenu(false);
    setShowSettings(false);
  }, [chapterNumber, slug]);

  useEffect(() => {
    const initUserAndLoadData = async () => {
      try {
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
      } catch (error) {
        console.error("init/load user error:", error);
        setIsVip(false);
        setVipExpiry(null);
      }
    };

    initUserAndLoadData();
  }, []);

  useEffect(() => {
    fetch(`${API_BASE}/health`, {
      credentials: "include",
    }).catch(() => {});
  }, []);

  useEffect(() => {
    setPaypalLoading(false);
  }, []);

  useEffect(() => {
    const resetPaypalLoading = () => {
      setPaypalLoading(false);
    };

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        setPaypalLoading(false);
      }
    };

    window.addEventListener("pageshow", resetPaypalLoading);
    window.addEventListener("focus", resetPaypalLoading);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("pageshow", resetPaypalLoading);
      window.removeEventListener("focus", resetPaypalLoading);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  useEffect(() => {
    const fetchNovel = async () => {
      const { data, error } = await supabase
        .from("novels")
        .select("id, title, cover_url")
        .eq("slug", slug)
        .single();

      if (error) {
        console.error("Failed to fetch novel:", error);
        return;
      }

      if (data?.id) {
        setNovelId(data.id);
      }

      if (data?.title) {
        setNovelTitle(data.title);
      }

      if (data?.cover_url && data.cover_url.trim() !== "") {
        setNovelCover(data.cover_url);
      } else {
        setNovelCover("/cover.jpg");
      }
    };

    if (slug) {
      fetchNovel();
    }
  }, [slug]);

  useEffect(() => {
    if (!novelId) return;

    const fetchChapters = async () => {
      setChaptersLoading(true);

      const { data, error } = await supabase
        .from("chapters")
        .select("*")
        .eq("novel_id", novelId)
        .order("chapter_number", { ascending: true });

      if (error) {
        console.error("Failed to fetch chapters:", error);
        setChapters([]);
      } else {
        setChapters(data || []);
      }

      setChaptersLoading(false);
    };

    fetchChapters();
  }, [novelId]);

  useEffect(() => {
    const fetchRecommendedNovel = async () => {
      if (!slug) return;

      setRecommendLoading(true);

      const { data, error } = await supabase
        .from("novels")
        .select("id, slug, title, author, description, cover_url, is_active")
        .eq("is_active", true)
        .neq("slug", slug)
        .limit(6);

      if (error) {
        console.error("Failed to fetch recommended novels:", error);
        setRecommendedNovel(null);
        setRecommendLoading(false);
        return;
      }

      if (data && data.length > 0) {
        const randomIndex = Math.floor(Math.random() * data.length);
        setRecommendedNovel(data[randomIndex]);
      } else {
        setRecommendedNovel(null);
      }

      setRecommendLoading(false);
    };

    fetchRecommendedNovel();
  }, [slug]);

  const isLastChapter = chapterNumber === lastChapter;
  const unlockPrice = Number(chapter?.coin_price || 0);

  const isChapterUnlocked = (targetChapterNumber) => {
    const chapterItem = chapters.find(
      (c) => c.chapter_number === targetChapterNumber
    );

    if (!chapterItem) return false;
    if (isVip) return true;
    if (chapterItem.is_free) return true;

    return unlockedChapters.includes(targetChapterNumber);
  };

  const isLockedChapter = !isChapterUnlocked(chapterNumber);

  const selectedPackData = packs.find((pack) => pack.key === selectedPackKey);

  const paragraphs = (chapter?.content || "")
    .split("\n\n")
    .map((p) => p.trim())
    .filter((p) => p !== "");

  const bookmarkKey = `${slug}-${chapterNumber}`;
  const isBookmarked = !!bookmarks[bookmarkKey];

  const recommendedCover =
    recommendedNovel?.cover_url && recommendedNovel.cover_url.trim() !== ""
      ? recommendedNovel.cover_url
      : "/cover.jpg";

  const decreaseFont = () => {
    setFontSize((prev) => Math.max(13, prev - 1));
  };

  const increaseFont = () => {
    setFontSize((prev) => Math.min(24, prev + 1));
  };

  const handleToggleBookmark = () => {
    setBookmarks((prev) => {
      const next = { ...prev };

      if (next[bookmarkKey]) {
        delete next[bookmarkKey];
      } else {
        next[bookmarkKey] = {
          slug,
          chapterNumber,
          title: chapter?.title || `Chapter ${chapterNumber}`,
          novelTitle,
          savedAt: new Date().toISOString(),
        };
      }

      return next;
    });
  };

  const handleOpenContents = () => {
    setShowBottomMenu(false);
    setShowSettings(false);
    setShowCatalogue(true);
  };

  const handleOpenSettings = () => {
    setShowSettings((prev) => !prev);
  };

  const handleToggleTheme = () => {
    setIsNightMode((prev) => !prev);
  };

  const handleReaderTap = () => {
    if (showCatalogue || showModal || showRecommend) return;

    setShowBottomMenu((prev) => {
      const next = !prev;
      if (!next) setShowSettings(false);
      return next;
    });
  };

  const handlePrev = () => {
    if (chapterNumber <= 1) {
      navigate(slug ? `/novel/${slug}` : "/novel");
    } else {
      navigate(`/novel/${slug}/chapter/${chapterNumber - 1}`);
    }
  };

  const handleNext = () => {
    if (chapterNumber >= lastChapter) {
      setShowRecommend(true);
    } else {
      navigate(`/novel/${slug}/chapter/${chapterNumber + 1}`);
    }
  };

  const handlePayNow = async (packArg = null) => {
    const packToBuy = packArg || selectedPackData;

    if (!packToBuy) {
      alert("Please select a coin package first.");
      return;
    }

    try {
      setPaypalLoading(true);

      const response = await fetch(`${API_BASE}/api/paypal/create-order`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          packKey: packToBuy.key,
          slug,
          novelId,
          chapterNumber,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.approveUrl) {
        throw new Error(data.error || "Failed to start PayPal checkout");
      }

      window.location.href = data.approveUrl;
    } catch (err) {
      alert(`Unable to open PayPal: ${err.message || "Unknown error"}`);
      setPaypalLoading(false);
    }
  };

  const handleUnlockNow = async () => {
    if (isVip) {
      setShowModal(false);
      return;
    }

    if (coins < unlockPrice) {
      setShowModal(true);
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/api/unlock-chapter`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          slug,
          novelId,
          chapterNumber,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        alert(data.error || "Unlock failed");
        return;
      }

      setCoins(Number(data.coins || 0));
      setUnlockedChapters(Array.isArray(data.unlocked) ? data.unlocked : []);
      setVipExpiry(data.vip_expiry || vipExpiry);

      if (data.vip_expiry) {
        setIsVip(new Date(data.vip_expiry) > new Date());
      }

      setShowModal(false);
      alert(`Chapter ${chapterNumber} unlocked successfully.`);
    } catch (error) {
      console.error("unlock error:", error);
      alert("Unlock failed");
    }
  };

  const handleChapterClick = (chapterItem) => {
    navigate(`/novel/${slug}/chapter/${chapterItem.chapter_number}`);
    setShowCatalogue(false);
    setShowBottomMenu(false);
    setShowSettings(false);
  };

  if (chaptersLoading) {
    return (
      <div
        style={{ ...styles.page, background: theme.pageBg, color: theme.text }}
      >
        <div
          style={{
            ...styles.topBar,
            background: theme.topBarBg,
            borderBottom: `1px solid ${theme.border}`,
          }}
        >
          <button
            style={{ ...styles.backButton, color: theme.text }}
            onClick={() => navigate(`/novel/${slug}`)}
          >
            ‹
          </button>
          <span
            style={{ ...styles.topTitle, color: theme.text, cursor: "pointer" }}
            onClick={() => navigate(`/novel/${slug}`)}
          >
            {novelTitle}
          </span>
        </div>

        <div style={{ ...styles.content, background: theme.surfaceBg }}>
          <p
            style={{
              ...styles.paragraph,
              color: theme.text,
              fontSize: `${fontSize}px`,
            }}
          >
            Loading chapters...
          </p>
        </div>
      </div>
    );
  }

  if (!chapter) {
    return (
      <div
        style={{ ...styles.page, background: theme.pageBg, color: theme.text }}
      >
        <div
          style={{
            ...styles.topBar,
            background: theme.topBarBg,
            borderBottom: `1px solid ${theme.border}`,
          }}
        >
          <button
            style={{ ...styles.backButton, color: theme.text }}
            onClick={() => navigate(`/novel/${slug}`)}
          >
            ‹
          </button>

          <span
            style={{
              ...styles.topTitle,
              color: theme.text,
              cursor: "pointer",
              transition: "opacity 0.2s ease",
            }}
            onClick={() => navigate(`/novel/${slug}`)}
            onMouseEnter={(e) => (e.target.style.opacity = 0.6)}
            onMouseLeave={(e) => (e.target.style.opacity = 1)}
          >
            {novelTitle}
          </span>
        </div>

        <div style={{ ...styles.content, background: theme.surfaceBg }}>
          <p
            style={{
              ...styles.paragraph,
              color: theme.text,
              fontSize: `${fontSize}px`,
            }}
          >
            Chapter not found.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ ...styles.page, background: theme.pageBg, color: theme.text }}>
      <div
        style={{
          ...styles.topBar,
          background: theme.topBarBg,
          borderBottom: `1px solid ${theme.border}`,
        }}
      >
        <button
          style={{ ...styles.backButton, color: theme.text }}
          onClick={() => navigate(`/novel/${slug}`)}
        >
          ‹
        </button>
        <span
          style={{
            ...styles.topTitle,
            color: theme.text,
            cursor: "pointer",
          }}
          onClick={() => navigate(`/novel/${slug}`)}
        >
          {novelTitle}
        </span>
      </div>

      <div
        style={{
          ...styles.content,
          background: theme.surfaceBg,
          paddingBottom: showBottomMenu ? "110px" : "40px",
        }}
        onClick={handleReaderTap}
      >
        {isVip && (
          <div style={styles.vipActiveBanner}>
            VIP Active · Unlimited Access
            {vipExpiry ? ` until ${new Date(vipExpiry).toLocaleDateString()}` : ""}
          </div>
        )}

        <h1
          style={{
            ...styles.chapterTitle,
            color: theme.text,
          }}
        >
          {chapter.title}
        </h1>

        {!isLockedChapter ? (
          paragraphs.map((p, i) => (
            <p
              key={i}
              style={{
                ...styles.paragraph,
                fontSize: `${fontSize}px`,
                color: theme.text,
              }}
            >
              {p}
            </p>
          ))
        ) : (
          <>
            {paragraphs.slice(0, 2).map((p, i) => (
              <p
                key={i}
                style={{
                  ...styles.paragraph,
                  fontSize: `${fontSize}px`,
                  color: theme.text,
                }}
              >
                {p}
              </p>
            ))}

            <div
              style={{
                ...styles.fadeOverlay,
                background: theme.fade,
              }}
            ></div>

            <div
              style={{
                ...styles.paywallCard,
                background: theme.cardBg,
                border: `1px solid ${theme.border}`,
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <h2 style={{ ...styles.paywallTitle, color: theme.text }}>
                Unlock Chapters
              </h2>

              <div style={{ ...styles.priceLabel, color: theme.subText }}>
                Unlock Price
              </div>
              <div style={{ ...styles.bigPrice, color: theme.text }}>
                {unlockPrice}
              </div>
              <div style={{ ...styles.priceSub, color: theme.subText }}>
                Coins or Bonus
              </div>

              <div style={{ ...styles.walletRow, color: theme.subText }}>
                <span>My Wallet</span>
                <span>{coins} Coins&nbsp;&nbsp;0 Bonus</span>
              </div>

              <button
                style={styles.unlockNowButton}
                onClick={(e) => {
                  e.stopPropagation();
                  handleUnlockNow();
                }}
              >
                Unlock Now
              </button>

              <div style={styles.packGrid}>
                {packs.map((pack) => {
                  const isSelected = selectedPackKey === pack.key;

                  return (
                    <button
                      key={pack.key}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedPackKey(pack.key);

                        setTimeout(() => {
                          handlePayNow(pack);
                        }, 100);
                      }}
                      disabled={paypalLoading}
                      style={
                        isSelected
                          ? { ...styles.packCard, ...styles.packCardDark }
                          : styles.packCard
                      }
                    >
                      {pack.isVip ? (
                        <>
                          <div style={styles.vipBadge}>{pack.tag}</div>

                          <div
                            style={
                              isSelected
                                ? { ...styles.packBonus, color: "#ff6a84" }
                                : styles.packBonus
                            }
                          >
                            {pack.bonus}
                          </div>

                          <div
                            style={
                              isSelected
                                ? { ...styles.vipPrice, color: "#fff" }
                                : styles.vipPrice
                            }
                          >
                            {pack.price}
                          </div>

                          <div
                            style={
                              isSelected ? styles.packPriceDark : styles.vipSub
                            }
                          >
                            7 Day
                          </div>
                        </>
                      ) : (
                        <>
                          <div style={styles.badge}>{pack.tag}</div>

                          <div
                            style={
                              isSelected
                                ? { ...styles.packBonus, color: "#ff6a84" }
                                : styles.packBonus
                            }
                          >
                            {pack.bonus}
                          </div>

                          <div
                            style={
                              isSelected
                                ? { ...styles.packCoins, color: "#fff" }
                                : styles.packCoins
                            }
                          >
                            {pack.coins}{" "}
                            <span style={styles.coinsSmall}>Coins</span>
                          </div>

                          <div
                            style={
                              isSelected
                                ? styles.packPriceDark
                                : styles.packPrice
                            }
                          >
                            {pack.price}
                          </div>
                        </>
                      )}
                    </button>
                  );
                })}
              </div>

              <button
                style={styles.payNowButton}
                onClick={(e) => {
                  e.stopPropagation();
                  handlePayNow();
                }}
                disabled={paypalLoading}
              >
                {paypalLoading ? "Redirecting to PayPal..." : "PAY NOW"}
              </button>
            </div>
          </>
        )}

        <div style={styles.navButtons} onClick={(e) => e.stopPropagation()}>
          <button
            style={{
              ...styles.navButton,
              background: theme.navBg,
              color: theme.navText,
              border: `1px solid ${theme.border}`,
            }}
            onClick={(e) => {
              e.stopPropagation();
              handlePrev();
            }}
          >
            Prev
          </button>

          <button
            style={{
              ...styles.centerMenuButton,
              background: theme.navBg,
              color: theme.navText,
              border: `1px solid ${theme.border}`,
            }}
            onClick={(e) => {
              e.stopPropagation();
              setShowBottomMenu((prev) => {
                const next = !prev;
                if (!next) setShowSettings(false);
                return next;
              });
            }}
          >
            <List size={22} strokeWidth={2} />
          </button>

          {isLastChapter ? (
            <button
              style={{
                ...styles.navButton,
                background: theme.navBg,
                color: theme.navText,
                border: `1px solid ${theme.border}`,
              }}
              onClick={(e) => {
                e.stopPropagation();
                setShowRecommend(true);
              }}
            >
              Recommend
            </button>
          ) : (
            <button
              style={{
                ...styles.navButton,
                background: theme.navBg,
                color: theme.navText,
                border: `1px solid ${theme.border}`,
              }}
              onClick={(e) => {
                e.stopPropagation();
                handleNext();
              }}
            >
              Next
            </button>
          )}
        </div>
      </div>

      {showSettings && showBottomMenu && (
        <div
          style={{
            ...styles.floatingSettingsPopup,
            background: theme.modalBg,
            border: `1px solid ${theme.border}`,
            color: theme.text,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div style={styles.settingsPopupRow}>
            <span style={{ ...styles.settingsLabel, color: theme.text }}>
              Text Size
            </span>

            <div style={styles.settingsActions}>
              <button
                style={{
                  ...styles.settingsActionButton,
                  background: theme.navBg,
                  color: theme.navText,
                  border: `1px solid ${theme.border}`,
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  decreaseFont();
                }}
              >
                A-
              </button>

              <span style={{ ...styles.fontSizeValue, color: theme.text }}>
                {fontSize}px
              </span>

              <button
                style={{
                  ...styles.settingsActionButton,
                  background: theme.navBg,
                  color: theme.navText,
                  border: `1px solid ${theme.border}`,
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  increaseFont();
                }}
              >
                A+
              </button>
            </div>
          </div>
        </div>
      )}

      {showBottomMenu && (
        <div
          style={{
            ...styles.readerBottomMenu,
            background: theme.surfaceBg,
            borderTop: `1px solid ${theme.border}`,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            style={styles.readerMenuItem}
            onClick={(e) => {
              e.stopPropagation();
              handleOpenContents();
            }}
          >
            <div style={{ ...styles.readerMenuIcon, color: theme.text }}>
              <List size={22} strokeWidth={2} />
            </div>
            <div style={{ ...styles.readerMenuLabel, color: theme.text }}>
              Contents
            </div>
          </button>

          <button
            style={styles.readerMenuItem}
            onClick={(e) => {
              e.stopPropagation();
              handleOpenSettings();
            }}
          >
            <div style={{ ...styles.readerMenuIcon, color: theme.text }}>
              <Settings size={22} strokeWidth={2} />
            </div>
            <div style={{ ...styles.readerMenuLabel, color: theme.text }}>
              Settings
            </div>
          </button>

          <button
            style={styles.readerMenuItem}
            onClick={(e) => {
              e.stopPropagation();
              handleToggleTheme();
            }}
          >
            <div style={{ ...styles.readerMenuIcon, color: theme.text }}>
              {isNightMode ? (
                <Sun size={22} strokeWidth={2} />
              ) : (
                <Moon size={22} strokeWidth={2} />
              )}
            </div>

            <div style={{ ...styles.readerMenuLabel, color: theme.text }}>
              {isNightMode ? "Light" : "Night"}
            </div>
          </button>

          <button
            style={styles.readerMenuItem}
            onClick={(e) => {
              e.stopPropagation();
              handleToggleBookmark();
            }}
          >
            <div
              style={{
                ...styles.readerMenuIcon,
                color: isBookmarked ? "#fbbf24" : theme.subText,
              }}
            >
              <Bookmark
                size={22}
                strokeWidth={2}
                fill={isBookmarked ? "#fbbf24" : "none"}
              />
            </div>
            <div
              style={{
                ...styles.readerMenuLabel,
                color: isBookmarked ? "#fbbf24" : theme.text,
              }}
            >
              {isBookmarked ? "Saved" : "Bookmark"}
            </div>
          </button>
        </div>
      )}

      {showCatalogue && (
        <div
          style={{
            ...styles.drawerOverlay,
            background: theme.drawerOverlay,
          }}
          onClick={() => setShowCatalogue(false)}
        >
          <div
            style={{
              ...styles.drawer,
              background: theme.drawerBg,
              color: theme.text,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={styles.drawerHeader}>
              <div style={styles.drawerBookInfo}>
                <img
                  src={novelCover}
                  alt="Book cover"
                  style={styles.drawerCover}
                />
                <div>
                  <div style={{ ...styles.drawerTitle, color: theme.text }}>
                    {novelTitle}
                  </div>
                  <div style={styles.drawerMeta}>
                    <span style={{ ...styles.drawerCount, color: theme.text }}>
                      {chapters.length} Chapter
                    </span>
                    <span
                      style={{ ...styles.drawerStatus, color: theme.subText }}
                    >
                      Complete
                    </span>
                  </div>
                </div>
              </div>

              <button
                style={{ ...styles.drawerClose, color: theme.text }}
                onClick={() => setShowCatalogue(false)}
              >
                ☰
              </button>
            </div>

            <div
              style={{
                ...styles.drawerDivider,
                borderTop: `1px solid ${theme.border}`,
              }}
            ></div>

            <div style={styles.chapterList}>
              {chapters.map((chapterItem) => {
                const isCurrent = chapterItem.chapter_number === chapterNumber;
                const locked = !isChapterUnlocked(chapterItem.chapter_number);

                return (
                  <button
                    key={chapterItem.id}
                    style={styles.chapterRow}
                    onClick={() => handleChapterClick(chapterItem)}
                  >
                    <span
                      style={{
                        ...styles.chapterRowText,
                        color: isCurrent ? "#ff4b68" : theme.text,
                        ...(isCurrent ? styles.chapterRowActive : {}),
                      }}
                    >
                      {chapterItem.chapter_number}. {chapterItem.title}
                    </span>

                    {locked && !isCurrent && (
                      <span style={styles.lockIcon}>🔒</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {showModal && !isVip && (
        <div style={styles.modalOverlay} onClick={() => setShowModal(false)}>
          <div
            style={{
              ...styles.modalCard,
              background: theme.modalBg,
              color: theme.text,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ ...styles.modalTitle, color: theme.text }}>
              Unlock Chapter {chapterNumber}
            </h3>
            <p style={{ ...styles.modalText, color: theme.subText }}>
              You need {unlockPrice} coins to unlock this chapter. Your wallet
              currently has {coins} coins. Recharge first to continue.
            </p>

            <div style={styles.modalButtons}>
              <button
                style={{
                  ...styles.modalCancel,
                  background: theme.navBg,
                  color: theme.navText,
                  border: `1px solid ${theme.border}`,
                }}
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>

              <button
                style={styles.modalPay}
                onClick={handlePayNow}
                disabled={paypalLoading}
              >
                {paypalLoading ? "OPENING PAYPAL..." : "Pay Now"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showRecommend && (
        <div
          style={styles.recommendOverlay}
          onClick={() => setShowRecommend(false)}
        >
          <div
            style={{
              ...styles.recommendCard,
              background: theme.modalBg,
              color: theme.text,
              border: `1px solid ${theme.border}`,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              style={{ ...styles.recommendClose, color: theme.subText }}
              onClick={() => setShowRecommend(false)}
            >
              ×
            </button>

            {recommendLoading ? (
              <>
                <div style={styles.recommendHero}>
                  <div style={styles.recommendGlow}></div>
                </div>

                <h3 style={{ ...styles.recommendTitle, color: theme.text }}>
                  Loading recommendation...
                </h3>
              </>
            ) : recommendedNovel ? (
              <>
                <div style={styles.recommendHero}>
                  <div style={styles.recommendGlow}></div>

                  <img
                    src={recommendedCover}
                    alt={recommendedNovel.title}
                    style={styles.recommendMainCover}
                  />
                </div>

                <h3 style={{ ...styles.recommendTitle, color: theme.text }}>
                  {recommendedNovel.title}
                </h3>

                <div style={styles.recommendMetaRow}>
                  <div style={styles.recommendApp}>
                    <span style={styles.recommendDot}>M</span>
                    <span style={{ color: theme.subText }}>
                      {recommendedNovel.author || "Novel World"}
                    </span>
                  </div>
                </div>

                <div
                  style={{
                    ...styles.recommendExcerpt,
                    background: theme.excerptBg,
                    color: theme.text,
                    border: `1px solid ${theme.border}`,
                  }}
                >
                  {recommendedNovel.description ||
                    "Discover another gripping story waiting for you."}
                </div>

                <button
                  style={styles.readingNowButton}
                  onClick={() => {
                    setShowRecommend(false);
                    navigate(`/novel/${recommendedNovel.slug}`);
                  }}
                >
                  Reading Now
                </button>

                <button
                  style={styles.homeLinkButton}
                  onClick={() => {
                    setShowRecommend(false);
                    navigate(`/novel/${slug}`);
                  }}
                >
                  Go to HomePage
                </button>
              </>
            ) : (
              <>
                <div style={styles.recommendHero}>
                  <div style={styles.recommendGlow}></div>
                </div>

                <h3 style={{ ...styles.recommendTitle, color: theme.text }}>
                  No recommendation available
                </h3>

                <div
                  style={{
                    ...styles.recommendExcerpt,
                    background: theme.excerptBg,
                    color: theme.text,
                    border: `1px solid ${theme.border}`,
                  }}
                >
                  We couldn’t find another active novel to recommend right now.
                </div>

                <button
                  style={styles.homeLinkButton}
                  onClick={() => {
                    setShowRecommend(false);
                    navigate(`/novel/${slug}`);
                  }}
                >
                  Go to HomePage
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#ffffff",
    fontFamily: "'Inter', 'Poppins', -apple-system, sans-serif",
    color: "#333",
  },

  topBar: {
    height: "44px",
    display: "flex",
    alignItems: "center",
    padding: "0 12px",
    background: "#fafafa",
    position: "sticky",
    top: 0,
    zIndex: 10,
    gap: "8px",
  },

  backButton: {
    border: "none",
    background: "transparent",
    fontSize: "30px",
    cursor: "pointer",
    color: "#333",
    marginRight: "8px",
    padding: 0,
    lineHeight: 1,
    flexShrink: 0,
  },

  topTitle: {
    fontSize: "12px",
    color: "#444",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },

  content: {
    width: "100%",
    maxWidth: "600px",
    margin: "0 auto",
    padding: "14px 16px 40px",
    background: "#fafafa",
    boxSizing: "border-box",
    position: "relative",
  },

  settingsLabel: {
    fontSize: "13px",
    fontWeight: "700",
  },

  settingsActions: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },

  settingsActionButton: {
    minWidth: "42px",
    height: "34px",
    borderRadius: "18px",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "700",
  },

  fontSizeValue: {
    fontSize: "13px",
    fontWeight: "700",
    minWidth: "42px",
    textAlign: "center",
  },

  floatingSettingsPopup: {
    position: "fixed",
    left: "50%",
    transform: "translateX(-50%)",
    bottom: "84px",
    width: "calc(100% - 32px)",
    maxWidth: "600px",
    borderRadius: "16px",
    padding: "14px 16px",
    zIndex: 145,
    boxShadow: "0 8px 30px rgba(0,0,0,0.18)",
    boxSizing: "border-box",
  },

  settingsPopupRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "12px",
    flexWrap: "wrap",
  },

  vipActiveBanner: {
    background: "linear-gradient(90deg, #f7d774, #f2c94c)",
    color: "#3a2a00",
    fontSize: "12px",
    fontWeight: "800",
    textAlign: "center",
    padding: "10px 12px",
    borderRadius: "10px",
    marginBottom: "14px",
  },

  chapterTitle: {
    fontSize: "16px",
    fontWeight: "700",
    marginBottom: "18px",
    color: "#333",
  },

  paragraph: {
    fontSize: "15px",
    lineHeight: "1.95",
    marginBottom: "18px",
    textAlign: "left",
    color: "#333",
  },

  fadeOverlay: {
    height: "80px",
    marginTop: "-10px",
    background:
      "linear-gradient(to bottom, rgba(250,250,250,0), rgba(250,250,250,1))",
  },

  paywallCard: {
    background: "#fafafa",
    border: "1px solid #f0f0f0",
    borderRadius: "4px",
    padding: "16px 14px 14px",
    marginTop: "18px",
    marginBottom: "16px",
    width: "100%",
    boxSizing: "border-box",
  },

  paywallTitle: {
    textAlign: "center",
    fontSize: "12px",
    fontWeight: "700",
    margin: "0 0 20px 0",
    color: "#333",
  },

  priceLabel: {
    textAlign: "center",
    fontSize: "10px",
    fontWeight: "600",
    color: "#555",
    marginBottom: "4px",
  },

  bigPrice: {
    textAlign: "center",
    fontSize: "40px",
    lineHeight: 1,
    fontWeight: "800",
    color: "#222",
    letterSpacing: "-1px",
    fontFamily: "'Inter', sans-serif",
    fontFeatureSettings: "'tnum'",
  },

  priceSub: {
    textAlign: "center",
    fontSize: "10px",
    color: "#666",
    marginTop: "4px",
    marginBottom: "20px",
  },

  walletRow: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "10px",
    color: "#4b4b4b",
    marginBottom: "12px",
  },

  unlockNowButton: {
    width: "100%",
    height: "36px",
    border: "none",
    borderRadius: "20px",
    background: "#f8cb8e",
    color: "#fff",
    fontWeight: "700",
    fontSize: "11px",
    cursor: "pointer",
    marginBottom: "14px",
  },

  packGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: "6px",
    marginBottom: "14px",
  },

  packCard: {
    position: "relative",
    background: "#f9eddc",
    border: "1px solid #f8e7d3",
    borderRadius: "3px",
    textAlign: "center",
    padding: "10px 7px 0",
    minHeight: "90px",
    boxSizing: "border-box",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    cursor: "pointer",
    appearance: "none",
    WebkitAppearance: "none",
    outline: "none",
  },

  packCardDark: {
    background: "#151515",
    border: "1px solid #2b2b2b",
    color: "#fff",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    cursor: "pointer",
  },

  badge: {
    position: "absolute",
    top: "-10px",
    left: "0",
    background: "#ff4b68",
    color: "#fff",
    fontSize: "10px",
    fontWeight: "700",
    padding: "4px 10px",
    borderRadius: "2px",
  },

  vipBadge: {
    position: "absolute",
    top: "-10px",
    left: "0",
    background: "linear-gradient(180deg, #F4D7A8 0%, #D9B47A 100%)",
    color: "#5c3b00",
    fontSize: "10px",
    fontWeight: "700",
    padding: "4px 10px",
    borderRadius: "2px",
  },

  packBonus: {
    fontSize: "10px",
    color: "#ff4b68",
    marginBottom: "3px",
    lineHeight: "1.15",
  },

  packCoins: {
    fontSize: "16px",
    fontWeight: "800",
    color: "#111",
    marginBottom: "3px",
    lineHeight: "1.1",
    letterSpacing: "-0.3px",
    fontFamily: "'Inter', sans-serif",
    fontFeatureSettings: "'tnum'",
  },

  coinsSmall: {
    fontSize: "10px",
    fontWeight: "600",
  },

  packPrice: {
    fontSize: "10px",
    fontWeight: "700",
    color: "#a16207",
    background: "#f9e1c6",
    margin: "0 -8px 0",
    padding: "6px 0",
    borderBottomLeftRadius: "3px",
    borderBottomRightRadius: "3px",
  },

  packPriceDark: {
    fontSize: "10px",
    fontWeight: "700",
    color: "#fff",
    background: "#3a3a3a",
    margin: "0 -8px 0",
    padding: "6px 0",
    borderBottomLeftRadius: "3px",
    borderBottomRightRadius: "3px",
  },

  vipPrice: {
    fontSize: "16px",
    fontWeight: "800",
    color: "#111",
    marginTop: "18px",
    marginBottom: "18px",
  },

  vipSub: {
    fontSize: "10px",
    fontWeight: "700",
    color: "#a16207",
    background: "#f9e1c6",
    margin: "0 -8px 0",
    padding: "6px 0",
    borderBottomLeftRadius: "3px",
    borderBottomRightRadius: "3px",
  },

  payNowButton: {
    width: "100%",
    height: "42px",
    border: "none",
    borderRadius: "4px",
    background: "#111",
    color: "#fff",
    fontSize: "12px",
    fontWeight: "700",
    cursor: "pointer",
  },

  navButtons: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginTop: "14px",
    gap: "clamp(12px, 4vw, 28px)",
  },

  navButton: {
    width: "clamp(96px, 22vw, 140px)",
    height: "clamp(34px, 6vw, 42px)",
    borderRadius: "12px",
    border: "1px solid #ddd",
    background: "#f5f5f5",
    fontSize: "clamp(12px, 2.2vw, 14px)",
    cursor: "pointer",
    fontWeight: "500",
    flexShrink: 0,
  },

  centerMenuButton: {
    width: "clamp(42px, 9vw, 52px)",
    height: "clamp(42px, 9vw, 52px)",
    minWidth: "clamp(42px, 9vw, 52px)",
    borderRadius: "999px",
    border: "1px solid #ddd",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#f5f5f5",
    cursor: "pointer",
    padding: 0,
    flexShrink: 0,
  },

  readerBottomMenu: {
    position: "fixed",
    left: "50%",
    transform: "translateX(-50%)",
    bottom: 0,
    width: "100%",
    maxWidth: "600px",
    zIndex: 140,
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    padding: "10px 16px calc(10px + env(safe-area-inset-bottom))",
    boxShadow: "0 -4px 16px rgba(0,0,0,0.08)",
    boxSizing: "border-box",
  },

  readerMenuItem: {
    border: "none",
    background: "transparent",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "6px",
    padding: "6px 4px",
    cursor: "pointer",
  },

  readerMenuIcon: {
    fontSize: "22px",
    lineHeight: 1,
  },

  readerMenuLabel: {
    fontSize: "12px",
    fontWeight: "500",
  },

  drawerOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.45)",
    zIndex: 110,
    display: "flex",
    justifyContent: "flex-start",
  },

  drawer: {
    width: "min(82vw, 420px)",
    height: "100vh",
    background: "#fff",
    overflowY: "auto",
    boxShadow: "2px 0 18px rgba(0,0,0,0.18)",
  },

  drawerHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "14px 16px 10px",
  },

  drawerBookInfo: {
    display: "flex",
    gap: "10px",
    alignItems: "center",
  },

  drawerCover: {
    width: "38px",
    height: "52px",
    borderRadius: "4px",
    objectFit: "cover",
  },

  drawerTitle: {
    fontSize: "11px",
    fontWeight: "700",
    color: "#111",
    maxWidth: "220px",
    lineHeight: "1.4",
  },

  drawerMeta: {
    display: "flex",
    gap: "8px",
    marginTop: "6px",
    alignItems: "center",
  },

  drawerCount: {
    fontSize: "10px",
    fontWeight: "700",
    color: "#111",
  },

  drawerStatus: {
    fontSize: "10px",
    color: "#777",
  },

  drawerClose: {
    border: "none",
    background: "transparent",
    fontSize: "18px",
    cursor: "pointer",
    color: "#111",
  },

  drawerDivider: {
    borderTop: "1px solid #ececec",
  },

  chapterList: {
    padding: "8px 0 18px",
  },

  chapterRow: {
    width: "100%",
    border: "none",
    background: "transparent",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "14px 16px",
    cursor: "pointer",
    textAlign: "left",
  },

  chapterRowText: {
    fontSize: "11px",
    color: "#111",
  },

  chapterRowActive: {
    color: "#ff4b68",
  },

  lockIcon: {
    fontSize: "14px",
    opacity: 0.6,
  },

  modalOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.45)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 120,
    padding: "20px",
    boxSizing: "border-box",
  },

  modalCard: {
    width: "100%",
    maxWidth: "360px",
    background: "#fff",
    borderRadius: "12px",
    padding: "20px",
    boxSizing: "border-box",
    boxShadow: "0 10px 30px rgba(0,0,0,0.18)",
  },

  modalTitle: {
    margin: "0 0 10px 0",
    fontSize: "18px",
    fontWeight: "700",
    color: "#222",
  },

  modalText: {
    margin: "0 0 18px 0",
    fontSize: "14px",
    lineHeight: "1.6",
    color: "#555",
  },

  modalButtons: {
    display: "flex",
    gap: "10px",
  },

  modalCancel: {
    flex: 1,
    height: "40px",
    borderRadius: "8px",
    border: "1px solid #ddd",
    background: "#f5f5f5",
    color: "#333",
    fontWeight: "600",
    cursor: "pointer",
  },

  modalPay: {
    flex: 1,
    height: "40px",
    borderRadius: "8px",
    border: "none",
    background: "#111",
    color: "#fff",
    fontWeight: "700",
    cursor: "pointer",
  },

  recommendOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.55)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 130,
    padding: "20px",
    boxSizing: "border-box",
  },

  recommendCard: {
    width: "100%",
    maxWidth: "420px",
    borderRadius: "24px",
    padding: "22px 20px 18px",
    boxSizing: "border-box",
    position: "relative",
    boxShadow: "0 18px 50px rgba(0,0,0,0.22)",
  },

  recommendClose: {
    position: "absolute",
    top: "10px",
    right: "12px",
    border: "none",
    background: "transparent",
    fontSize: "34px",
    cursor: "pointer",
    lineHeight: 1,
    zIndex: 2,
  },

  recommendHero: {
    position: "relative",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: "18px",
    minHeight: "150px",
  },

  recommendGlow: {
    position: "absolute",
    width: "180px",
    height: "120px",
    borderRadius: "28px",
    background: "linear-gradient(180deg, #ff6b57, #ff2e8b)",
    opacity: 0.95,
  },

  recommendMainCover: {
    position: "relative",
    width: "120px",
    height: "160px",
    objectFit: "cover",
    borderRadius: "16px",
    boxShadow: "0 10px 24px rgba(0,0,0,0.18)",
    zIndex: 1,
  },

  recommendTitle: {
    fontSize: "18px",
    lineHeight: "1.35",
    fontWeight: "800",
    margin: "0 0 12px 0",
    textAlign: "center",
  },

  recommendMetaRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
    marginBottom: "14px",
    flexWrap: "wrap",
  },

  recommendApp: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    fontSize: "13px",
  },

  recommendDot: {
    width: "18px",
    height: "18px",
    borderRadius: "999px",
    background: "#ffe8eb",
    color: "#ff5a74",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "11px",
    fontWeight: "700",
  },

  recommendExcerpt: {
    borderRadius: "14px",
    padding: "14px",
    fontSize: "13px",
    lineHeight: "1.65",
    marginBottom: "18px",
  },

  readingNowButton: {
    width: "100%",
    height: "48px",
    border: "none",
    borderRadius: "999px",
    background: "#111",
    color: "#fff",
    fontSize: "15px",
    fontWeight: "700",
    cursor: "pointer",
    marginBottom: "12px",
  },

  homeLinkButton: {
    width: "100%",
    border: "none",
    background: "transparent",
    color: "#f0a94d",
    fontSize: "14px",
    cursor: "pointer",
    padding: "6px 0",
  },
};

export default Chapter;