import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getCoins, spendCoins } from "./wallet";
import { chapters } from "./chaptersData";

function Chapter() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [showCatalogue, setShowCatalogue] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showRecommend, setShowRecommend] = useState(false);
  const [coins, setCoins] = useState(0);
  const [unlockedChapters, setUnlockedChapters] = useState([]);
  const [selectedPackKey, setSelectedPackKey] = useState(null);
  const [paypalLoading, setPaypalLoading] = useState(false);

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

  const chapter = chapters.find((c) => c.id === chapterNumber) || chapters[0];

  useEffect(() => {
    const initUserAndLoadData = async () => {
      try {
        let userId = localStorage.getItem("userId");

        const initRes = await fetch(
          "https://novel-world-api.onrender.com/api/user/init",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ userId }),
          }
        );

        const initData = await initRes.json();

        if (!initRes.ok || !initData.success) {
          throw new Error(initData.error || "Failed to initialize user");
        }

        localStorage.setItem("userId", initData.userId);

        const userRes = await fetch(
          "https://novel-world-api.onrender.com/api/user/data",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ userId: initData.userId }),
          }
        );

        const userData = await userRes.json();

        if (!userRes.ok || !userData.success) {
          throw new Error(userData.error || "Failed to load user data");
        }

        setCoins(Number(userData.user.coins || 0));
        setUnlockedChapters(
          Array.isArray(userData.user.unlocked)
            ? userData.user.unlocked
            : []
        );
      } catch (error) {
        console.error("init/load user error:", error);
      }
    };

    initUserAndLoadData();
  }, []);
  
  useEffect(() => {
    fetch("https://novel-world-api.onrender.com/health")
      .catch(() => {});
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

  const refreshCoins = () => {
    setCoins(getCoins());
  };

  const addCoinsToWallet = (amount) => {
    const updated = Number(getCoins()) + Number(amount);
    localStorage.setItem("coins", String(updated));
    setCoins(updated);
  };

  const isLastChapter = chapterNumber === lastChapter;

  const chapterPrices = {
    4: 449,
    5: 508,
    6: 563,
    7: 508,
    8: 521,
    9: 540,
    10: 563,
  };

  const unlockPrice = chapterPrices[chapterNumber] || 0;

  const isLockedChapter =
    chapter.locked && !unlockedChapters.includes(chapterNumber);

  const handlePrev = () => {
    if (chapterNumber <= 1) {
      navigate("/chapter/1");
    } else {
      navigate(`/chapter/${chapterNumber - 1}`);
    }
  };

  const handleNext = () => {
    if (chapterNumber >= lastChapter) {
      setShowRecommend(true);
    } else {
      navigate(`/chapter/${chapterNumber + 1}`);
    }
  };

  const handlePackSelect = (pack) => {
    setSelectedPack(pack.key);
  };

  const handlePayNow = async (packArg = null) => {
    const packToBuy = packArg || selectedPackData;

    if (!packToBuy) {
      alert("Please select a coin package first.");
      return;
    }

    try {
      setPaypalLoading(true);

      localStorage.setItem("lastChapter", String(chapterNumber));

      localStorage.setItem(
        "pendingPack",
        JSON.stringify({
          key: packToBuy.key,
          coins: packToBuy.coins,
          price: packToBuy.price,
          amount: packToBuy.amount,
        })
      );

      const response = await fetch(
        "https://novel-world-api.onrender.com/api/paypal/create-order",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: localStorage.getItem("userId"),
            packKey: packToBuy.key,
          }),
        }
      );

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
    if (coins < unlockPrice) {
      setShowModal(true);
      return;
     }

    try {
      const userId = localStorage.getItem("userId");

      const response = await fetch(
        "https://novel-world-api.onrender.com/api/unlock-chapter",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId,
            chapterNumber,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        alert(data.error || "Unlock failed");
        return;
      }

      setCoins(Number(data.coins || 0));
      setUnlockedChapters(Array.isArray(data.unlocked) ? data.unlocked : []);
      setShowModal(false);
      alert(`Chapter ${chapterNumber} unlocked successfully.`);
    } catch (error) {
      console.error("unlock error:", error);
      alert("Unlock failed");
    }
  };

  const handleChapterClick = (chapterItem) => {
    navigate(`/chapter/${chapterItem.id}`);
    setShowCatalogue(false);
  };

  const selectedPackData = packs.find(
    (pack) => pack.key === selectedPackKey
  );

  const paragraphs = (chapter.content || "")
    .split("\n\n")
    .map((p) => p.trim())
    .filter((p) => p !== "");

  return (
    <div style={styles.page}>
      <div style={styles.topBar}>
        <button style={styles.backButton} onClick={() => navigate("/novel")}>
          ‹
        </button>
        <span style={styles.topTitle}>{chapter.novelTitle}</span>
      </div>

      <div style={styles.content}>
        <h1 style={styles.chapterTitle}>{chapter.title}</h1>

        {!isLockedChapter ? (
          paragraphs.map((p, i) => (
            <p key={i} style={styles.paragraph}>
              {p}
            </p>
          ))
        ) : (
          <>
            {paragraphs.slice(0, 2).map((p, i) => (
              <p key={i} style={styles.paragraph}>
                {p}
              </p>
            ))}

            <div style={styles.fadeOverlay}></div>

            <div style={styles.paywallCard}>
              <h2 style={styles.paywallTitle}>Unlock Chapters</h2>

              <div style={styles.priceLabel}>Unlock Price</div>
              <div style={styles.bigPrice}>{unlockPrice}</div>
              <div style={styles.priceSub}>Coins or Bonus</div>

              <div style={styles.walletRow}>
                <span>My Wallet</span>
                <span>{coins} Coins&nbsp;&nbsp;0 Bonus</span>
              </div>

              <button style={styles.unlockNowButton} onClick={handleUnlockNow}>
                Unlock Now
              </button>

              <div style={styles.packGrid}>
                {packs.map((pack) => {
                  const isSelected = selectedPackKey === pack.key;

                  return (
                    <button
                      key={pack.key}
                      type="button"
                      onClick={() => {
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
                                  {pack.coins} <span style={styles.coinsSmall}>Coins</span>
                                </div>

                                <div
                                  style={
                                    isSelected ? styles.packPriceDark : styles.packPrice
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
                onClick={handlePayNow}
                disabled={paypalLoading}
              >
                {paypalLoading ? "Redirecting to PayPal..." : "PAY NOW"}
              </button>
            </div>
          </>
        )}

        <div style={styles.navButtons}>
          <button style={styles.navButton} onClick={handlePrev}>
            Prev
          </button>

          <button
            style={styles.navButton}
            onClick={() => setShowCatalogue(true)}
          >
            Catalogue
          </button>

          {isLastChapter ? (
            <button
              style={styles.navButton}
              onClick={() => setShowRecommend(true)}
            >
              Recommend
            </button>
          ) : (
            <button style={styles.navButton} onClick={handleNext}>
              Next
            </button>
          )}
        </div>
      </div>

      {showCatalogue && (
        <div
          style={styles.drawerOverlay}
          onClick={() => setShowCatalogue(false)}
        >
          <div style={styles.drawer} onClick={(e) => e.stopPropagation()}>
            <div style={styles.drawerHeader}>
              <div style={styles.drawerBookInfo}>
                <img
                  src="/cover.jpg"
                  alt="Book cover"
                  style={styles.drawerCover}
                />
                <div>
                  <div style={styles.drawerTitle}>{chapter.novelTitle}</div>
                  <div style={styles.drawerMeta}>
                    <span style={styles.drawerCount}>
                      {chapters.length} Chapter
                    </span>
                    <span style={styles.drawerStatus}>Complete</span>
                  </div>
                </div>
              </div>

              <button
                style={styles.drawerClose}
                onClick={() => setShowCatalogue(false)}
              >
                ☰
              </button>
            </div>

            <div style={styles.drawerDivider}></div>

            <div style={styles.chapterList}>
              {chapters.map((chapterItem) => {
                const isCurrent = chapterItem.id === chapterNumber;
                const locked =
                  chapterItem.locked &&
                  !unlockedChapters.includes(chapterItem.id);

                return (
                  <button
                    key={chapterItem.id}
                    style={styles.chapterRow}
                    onClick={() => handleChapterClick(chapterItem)}
                  >
                    <span
                      style={{
                        ...styles.chapterRowText,
                        ...(isCurrent ? styles.chapterRowActive : {}),
                      }}
                    >
                      {chapterItem.id}. {chapterItem.title}
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

      {showModal && (
        <div style={styles.modalOverlay} onClick={() => setShowModal(false)}>
          <div style={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            <h3 style={styles.modalTitle}>Unlock Chapter {chapterNumber}</h3>
            <p style={styles.modalText}>
              You need {unlockPrice} coins to unlock this chapter. Your wallet
              currently has {coins} coins. Recharge first to continue.
            </p>

            <div style={styles.modalButtons}>
              <button
                style={styles.modalCancel}
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
          <div style={styles.recommendCard} onClick={(e) => e.stopPropagation()}>
            <button
              style={styles.recommendClose}
              onClick={() => setShowRecommend(false)}
            >
              ×
            </button>

            <div style={styles.recommendTop}>
              <img
                src="/cover.jpg"
                alt="Left novel"
                style={styles.recommendSideCover}
              />
              <div style={styles.recommendCenterLogo}>M</div>
              <img
                src="/cover.jpg"
                alt="Right novel"
                style={styles.recommendSideCover}
              />
            </div>

            <h3 style={styles.recommendTitle}>
              His Assistant Tortured My “Mother”
            </h3>

            <div style={styles.recommendMetaRow}>
              <div style={styles.recommendApp}>
                <span style={styles.recommendDot}>M</span>
                <span>Poe</span>
              </div>

              <div style={styles.recommendTag}>Romance/Realistic</div>

              <div style={styles.recommendLikes}>♥ 548</div>
            </div>

            <div style={styles.recommendExcerpt}>
              It was Daniel Harper&apos;s mother&apos;s fiftieth birthday, and
              his female assistant, Tiffany, suddenly sent me a picture. The
              photo showed Daniel&apos;s mother locked in a dog cage...
            </div>

            <button style={styles.readingNowButton}>Reading Now</button>
            <button
              style={styles.homeLinkButton}
              onClick={() => navigate("/")}
            >
              Go to HomePage
            </button>
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
    justifyContent: "space-between",
    marginTop: "14px",
    gap: "14px",
  },

  navButton: {
    flex: 1,
    height: "40px",
    borderRadius: "22px",
    border: "1px solid #ddd",
    background: "#f5f5f5",
    fontSize: "12px",
    cursor: "pointer",
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

  modalCancelFull: {
    width: "100%",
    height: "40px",
    borderRadius: "8px",
    border: "1px solid #ddd",
    background: "#f5f5f5",
    color: "#333",
    fontWeight: "600",
    cursor: "pointer",
    marginTop: "12px",
  },

  paypalBox: {
    marginTop: "10px",
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
    background: "#fff",
    borderRadius: "14px",
    padding: "22px 18px 18px",
    boxSizing: "border-box",
    position: "relative",
  },

  recommendClose: {
    position: "absolute",
    top: "10px",
    right: "10px",
    border: "none",
    background: "transparent",
    fontSize: "28px",
    color: "#bbb",
    cursor: "pointer",
    lineHeight: 1,
  },

  recommendTop: {
    display: "grid",
    gridTemplateColumns: "90px 1fr 90px",
    gap: "14px",
    alignItems: "center",
    marginBottom: "14px",
  },

  recommendSideCover: {
    width: "90px",
    height: "120px",
    objectFit: "cover",
    borderRadius: "8px",
  },

  recommendCenterLogo: {
    height: "120px",
    borderRadius: "20px",
    background: "linear-gradient(180deg, #ff6b57, #ff2e8b)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#fff",
    fontSize: "78px",
    fontWeight: "800",
  },

  recommendTitle: {
    fontSize: "18px",
    lineHeight: "1.35",
    fontWeight: "800",
    margin: "0 0 12px 0",
    color: "#111",
  },

  recommendMetaRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "10px",
    marginBottom: "10px",
    flexWrap: "wrap",
  },

  recommendApp: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    fontSize: "13px",
    color: "#555",
  },

  recommendDot: {
    width: "16px",
    height: "16px",
    borderRadius: "999px",
    background: "#ffe8eb",
    color: "#ff5a74",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "10px",
    fontWeight: "700",
  },

  recommendTag: {
    background: "#dff2ef",
    color: "#222",
    fontSize: "12px",
    padding: "6px 10px",
    borderRadius: "4px",
  },

  recommendLikes: {
    fontSize: "13px",
    color: "#444",
  },

  recommendExcerpt: {
    background: "#f6f6f6",
    borderRadius: "4px",
    padding: "12px 12px",
    fontSize: "12px",
    lineHeight: "1.6",
    color: "#222",
    marginBottom: "18px",
  },

  readingNowButton: {
    width: "100%",
    height: "44px",
    border: "none",
    borderRadius: "24px",
    background: "#111",
    color: "#fff",
    fontSize: "14px",
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
  },
};

export default Chapter;
