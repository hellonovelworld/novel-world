export const getCoins = () => {
  const coins = localStorage.getItem("coins");
  return coins ? parseInt(coins, 10) : 0;
};

export const addCoins = (amount) => {
  const current = getCoins();
  const next = current + amount;
  localStorage.setItem("coins", String(next));
  return next;
};

export const spendCoins = (amount) => {
  const current = getCoins();

  if (current >= amount) {
    const next = current - amount;
    localStorage.setItem("coins", String(next));
    return true;
  }

  return false;
};

export const getUnlockedChapters = () => {
  const saved = localStorage.getItem("unlockedChapters");
  return saved ? JSON.parse(saved) : [];
};

export const unlockChapter = (chapterNumber) => {
  const unlocked = getUnlockedChapters();

  if (!unlocked.includes(chapterNumber)) {
    const updated = [...unlocked, chapterNumber];
    localStorage.setItem("unlockedChapters", JSON.stringify(updated));
    return updated;
  }

  return unlocked;
};

export const isChapterUnlocked = (chapterNumber) => {
  const unlocked = getUnlockedChapters();
  return unlocked.includes(chapterNumber);
};

export const resetWallet = () => {
  localStorage.setItem("coins", "0");
  localStorage.setItem("unlockedChapters", JSON.stringify([]));
};

export const seedWallet = (coins = 1000) => {
  localStorage.setItem("coins", String(coins));
};