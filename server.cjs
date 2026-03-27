require("dotenv").config();
const express = require("express");
const cors = require("cors");
const crypto = require("crypto");
const cookieParser = require("cookie-parser");
const { createClient } = require("@supabase/supabase-js");

const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5175",
  "https://novel-world.com",
  "https://www.novel-world.com",
  "https://novel-world.vercel.app",
];

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET;
const PAYPAL_BASE =
  process.env.PAYPAL_ENV === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

const CLIENT_URL = process.env.CLIENT_URL || "https://novel-world.com";

if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
  throw new Error("Missing PAYPAL_CLIENT_ID or PAYPAL_CLIENT_SECRET in .env");
}

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env");
}

if (!SUPABASE_ANON_KEY) {
  throw new Error("Missing SUPABASE_ANON_KEY in .env");
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const PACKS = {
  pack_1998: { coins: 1998, amount: "19.98" },
  pack_2999: { coins: 2999, amount: "29.99" },
  pack_3499: { coins: 3499, amount: "34.99" },
  pack_3999: { coins: 3999, amount: "39.99" },
  pack_5999: { coins: 5999, amount: "59.99" },

  svip_7day: {
    coins: 0,
    amount: "49.99",
    vipDays: 7,
  },
};

function isUuid(value) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value || ""
  );
}

function sha256(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function makeSessionToken() {
  return crypto.randomBytes(32).toString("hex");
}

function getCookieOptions() {
  const isProduction = process.env.NODE_ENV === "production";

  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    path: "/",
    maxAge: 1000 * 60 * 60 * 24 * 30,
  };
}

function serializeUser(user) {
  return {
    id: user.id,
    coins: Number(user.coins || 0),
    vip_expiry: user.vip_expiry,
    auto_unlock: Boolean(user.auto_unlock),
    auth_user_id: user.auth_user_id || null,
    email: user.email || null,
  };
}

function isVipActive(user) {
  if (!user?.vip_expiry) return false;
  return new Date(user.vip_expiry) > new Date();
}

function buildPurchaseRedirect(purchase) {
  if (purchase?.slug && purchase?.chapter_number) {
    return `/novel/${purchase.slug}/chapter/${purchase.chapter_number}`;
  }

  if (purchase?.slug) {
    return `/novel/${purchase.slug}`;
  }

  return "/my";
}

function buildPurchaseContext(purchase) {
  return {
    slug: purchase?.slug || null,
    novelId: purchase?.novel_id || null,
    chapterNumber: purchase?.chapter_number || null,
  };
}

async function getSessionRowFromCookie(req) {
  const rawToken = req.cookies?.nw_session;

  if (!rawToken) {
    return null;
  }

  const tokenHash = sha256(rawToken);

  const { data: session, error: sessionError } = await supabase
    .from("sessions")
    .select("id, user_id, expires_at, is_guest")
    .eq("token_hash", tokenHash)
    .maybeSingle();

  if (sessionError) {
    throw sessionError;
  }

  if (!session) {
    return null;
  }

  const isExpired = new Date(session.expires_at) <= new Date();

  if (isExpired) {
    await supabase.from("sessions").delete().eq("id", session.id);
    return null;
  }

  return session;
}

async function getSessionUserFromCookie(req) {
  const session = await getSessionRowFromCookie(req);

  if (!session) {
    return null;
  }

  const { data: user, error: userError } = await supabase
    .from("users")
    .select("*")
    .eq("id", session.user_id)
    .single();

  if (userError || !user) {
    return null;
  }

  return user;
}

async function requireSessionUser(req, res) {
  const user = await getSessionUserFromCookie(req);

  if (!user) {
    res.status(401).json({ error: "No valid session" });
    return null;
  }

  return user;
}

async function getOrCreateSessionUser(req, res) {
  const existingUser = await getSessionUserFromCookie(req);

  if (existingUser) {
    return { user: existingUser, isNew: false };
  }

  const userId = crypto.randomUUID();

  const { error: insertUserError } = await supabase.from("users").insert({
    id: userId,
    coins: 0,
    unlocked: [],
    auto_unlock: false,
    vip_expiry: null,
    updated_at: new Date().toISOString(),
  });

  if (insertUserError) {
    throw insertUserError;
  }

  const rawSessionToken = makeSessionToken();
  const tokenHash = sha256(rawSessionToken);
  const expiresAt = new Date(
    Date.now() + 1000 * 60 * 60 * 24 * 30
  ).toISOString();

  const { error: insertSessionError } = await supabase.from("sessions").insert({
    user_id: userId,
    token_hash: tokenHash,
    is_guest: true,
    expires_at: expiresAt,
  });

  if (insertSessionError) {
    throw insertSessionError;
  }

  res.cookie("nw_session", rawSessionToken, getCookieOptions());

  const { data: user, error: fetchUserError } = await supabase
    .from("users")
    .select("*")
    .eq("id", userId)
    .single();

  if (fetchUserError) {
    throw fetchUserError;
  }

  return { user, isNew: true };
}

async function getAccessToken() {
  const auth = Buffer.from(
    `${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`
  ).toString("base64");

  const response = await fetch(`${PAYPAL_BASE}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.error_description || "Failed to get PayPal access token"
    );
  }

  return data.access_token;
}

async function resolveNovelIdFromBody({ slug, novelId }) {
  if (novelId) return novelId;
  if (!slug) return null;

  const { data: novel, error } = await supabase
    .from("novels")
    .select("id")
    .eq("slug", slug)
    .single();

  if (error || !novel) {
    return null;
  }

  return novel.id;
}

async function resolveChapterForNovel({ novelId, chapterId, chapterNumber }) {
  if (!novelId) return null;

  if (chapterId) {
    const { data: chapter, error } = await supabase
      .from("chapters")
      .select("id, novel_id, chapter_number, title, is_free, coin_price")
      .eq("id", chapterId)
      .eq("novel_id", novelId)
      .maybeSingle();

    if (error) throw error;
    if (chapter) return chapter;
  }

  if (chapterNumber) {
    const numericChapterNumber = Number(chapterNumber);

    if (!numericChapterNumber || Number.isNaN(numericChapterNumber)) {
      return null;
    }

    const { data: chapter, error } = await supabase
      .from("chapters")
      .select("id, novel_id, chapter_number, title, is_free, coin_price")
      .eq("novel_id", novelId)
      .eq("chapter_number", numericChapterNumber)
      .maybeSingle();

    if (error) throw error;
    if (chapter) return chapter;
  }

  return null;
}

async function getLinkedUserIds(user) {
  let userIds = [user.id];

  if (user.auth_user_id) {
    const { data: linkedUsers, error: linkedUsersError } = await supabase
      .from("users")
      .select("id")
      .eq("auth_user_id", user.auth_user_id);

    if (linkedUsersError) {
      throw linkedUsersError;
    }

    userIds = [...new Set([user.id, ...(linkedUsers || []).map((u) => u.id)])];
  }

  return userIds;
}

app.get("/", (req, res) => {
  res.send("Novel World backend is running");
});

app.get("/health", (req, res) => {
  res.json({ ok: true });
});

app.post("/api/user/init", async (req, res) => {
  try {
    const { user } = await getOrCreateSessionUser(req, res);

    res.json({
      success: true,
      user: serializeUser(user),
    });
  } catch (error) {
    console.error("user/init error:", error);
    res.status(500).json({ error: error.message || "Failed to init user" });
  }
});

app.get("/api/user/me", async (req, res) => {
  try {
    const user = await getSessionUserFromCookie(req);

    if (!user) {
      return res.status(401).json({ error: "No valid session" });
    }

    res.json({
      success: true,
      user: serializeUser(user),
    });
  } catch (error) {
    console.error("user/me error:", error);
    res
      .status(500)
      .json({ error: error.message || "Failed to load current user" });
  }
});

app.post("/api/user/data", async (req, res) => {
  try {
    const { userId } = req.body || {};

    if (!isUuid(userId)) {
      return res.status(400).json({ error: "Invalid userId" });
    }

    const { data: user, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();

    if (error || !user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      success: true,
      user: serializeUser(user),
    });
  } catch (error) {
    console.error("user/data error:", error);
    res.status(500).json({ error: error.message || "Failed to load user" });
  }
});

app.post("/api/session/logout", async (req, res) => {
  try {
    const rawToken = req.cookies?.nw_session;

    if (rawToken) {
      const tokenHash = sha256(rawToken);
      await supabase.from("sessions").delete().eq("token_hash", tokenHash);
    }

    res.clearCookie("nw_session", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      path: "/",
    });

    res.json({ success: true });
  } catch (error) {
    console.error("session/logout error:", error);
    res
      .status(500)
      .json({ error: error.message || "Failed to logout session" });
  }
});

app.post("/api/session/link-auth", async (req, res) => {
  try {
    const sessionRow = await getSessionRowFromCookie(req);

    if (!sessionRow) {
      return res.status(401).json({ error: "No session cookie" });
    }

    const authHeader = req.headers.authorization || "";
    const accessToken = authHeader.startsWith("Bearer ")
      ? authHeader.slice(7)
      : null;

    if (!accessToken) {
      return res.status(401).json({ error: "Missing auth token" });
    }

    const authResponse = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        apikey: SUPABASE_ANON_KEY,
      },
    });

    const authUser = await authResponse.json().catch(() => null);

    if (!authResponse.ok || !authUser?.id) {
      return res.status(401).json({ error: "Invalid auth user" });
    }

    const { data: alreadyLinkedUser, error: linkedFetchError } = await supabase
      .from("users")
      .select("*")
      .eq("auth_user_id", authUser.id)
      .maybeSingle();

    if (linkedFetchError) {
      throw linkedFetchError;
    }

    if (alreadyLinkedUser && alreadyLinkedUser.id !== sessionRow.user_id) {
      const { error: updateSessionError } = await supabase
        .from("sessions")
        .update({
          user_id: alreadyLinkedUser.id,
          is_guest: false,
          expires_at: new Date(
            Date.now() + 1000 * 60 * 60 * 24 * 30
          ).toISOString(),
        })
        .eq("id", sessionRow.id);

      if (updateSessionError) {
        throw updateSessionError;
      }

      return res.json({
        success: true,
        user: serializeUser(alreadyLinkedUser),
      });
    }

    const { data: updatedUser, error: updateError } = await supabase
      .from("users")
      .update({
        auth_user_id: authUser.id,
        email: authUser.email || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", sessionRow.user_id)
      .select()
      .single();

    if (updateError || !updatedUser) {
      throw updateError || new Error("Failed to update user");
    }

    await supabase
      .from("sessions")
      .update({
        is_guest: false,
        expires_at: new Date(
          Date.now() + 1000 * 60 * 60 * 24 * 30
        ).toISOString(),
      })
      .eq("id", sessionRow.id);

    res.json({
      success: true,
      user: serializeUser(updatedUser),
    });
  } catch (error) {
    console.error("session/link-auth error:", error);
    res
      .status(500)
      .json({ error: error.message || "Failed to link auth user" });
  }
});

app.patch("/api/user/auto-unlock", async (req, res) => {
  try {
    const user = await requireSessionUser(req, res);
    if (!user) return;

    const { autoUnlock } = req.body || {};

    if (typeof autoUnlock !== "boolean") {
      return res.status(400).json({ error: "autoUnlock must be boolean" });
    }

    const { data: updatedUser, error } = await supabase
      .from("users")
      .update({
        auto_unlock: autoUnlock,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id)
      .select()
      .single();

    if (error || !updatedUser) {
      throw error || new Error("Failed to update auto unlock");
    }

    res.json({
      success: true,
      user: serializeUser(updatedUser),
    });
  } catch (error) {
    console.error("user/auto-unlock error:", error);
    res
      .status(500)
      .json({ error: error.message || "Failed to update auto unlock" });
  }
});

app.post("/api/feedback", async (req, res) => {
  try {
    const user = await requireSessionUser(req, res);
    if (!user) return;

    const { message, email } = req.body || {};

    const trimmedMessage = String(message || "").trim();
    const trimmedEmail = String(email || "").trim();

    if (!trimmedMessage) {
      return res.status(400).json({ error: "Message is required" });
    }

    if (trimmedMessage.length < 5) {
      return res.status(400).json({ error: "Message is too short" });
    }

    if (trimmedMessage.length > 2000) {
      return res.status(400).json({ error: "Message is too long" });
    }

    if (
      trimmedEmail &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)
    ) {
      return res.status(400).json({ error: "Please enter a valid email address" });
    }

    const { data, error } = await supabase
      .from("feedback_messages")
      .insert({
        user_id: user.id,
        email: trimmedEmail || user.email || null,
        message: trimmedMessage,
      })
      .select()
      .single();

    if (error || !data) {
      throw error || new Error("Failed to save feedback");
    }

    res.json({
      success: true,
      feedback: data,
    });
  } catch (error) {
    console.error("POST /api/feedback error:", error);
    res.status(500).json({
      error: error.message || "Failed to submit feedback",
    });
  }
});

/**
 * READING PROGRESS ROUTES
 */

app.post("/api/reading-progress", async (req, res) => {
  try {
    const user = await requireSessionUser(req, res);
    if (!user) return;

    const { slug, novelId, chapterId, chapterNumber } = req.body || {};

    const resolvedNovelId = await resolveNovelIdFromBody({ slug, novelId });

    if (!resolvedNovelId) {
      return res.status(400).json({ error: "Missing or invalid novelId/slug" });
    }

    const numericChapterNumber = Number(chapterNumber);

    if (
      !numericChapterNumber ||
      Number.isNaN(numericChapterNumber) ||
      numericChapterNumber < 1
    ) {
      return res.status(400).json({ error: "Invalid chapterNumber" });
    }

    const chapter = await resolveChapterForNovel({
      novelId: resolvedNovelId,
      chapterId,
      chapterNumber: numericChapterNumber,
    });

    if (!chapter) {
      return res.status(404).json({ error: "Chapter not found for this novel" });
    }

    const { data: existingProgress, error: existingError } = await supabase
      .from("reading_progress")
      .select("id, last_read_chapter_number")
      .eq("user_id", user.id)
      .eq("novel_id", resolvedNovelId)
      .maybeSingle();

    if (existingError) {
      throw existingError;
    }

    if (
      existingProgress &&
      Number(existingProgress.last_read_chapter_number || 0) >
        numericChapterNumber
    ) {
      return res.json({
        success: true,
        skipped: true,
        progress: {
          id: existingProgress.id,
          user_id: user.id,
          novel_id: resolvedNovelId,
          chapter_id: chapter.id,
          last_read_chapter_number:
            existingProgress.last_read_chapter_number,
        },
      });
    }

    const { data: savedProgress, error: saveError } = await supabase
      .from("reading_progress")
      .upsert(
        {
          user_id: user.id,
          novel_id: resolvedNovelId,
          chapter_id: chapter.id,
          last_read_chapter_number: numericChapterNumber,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "user_id,novel_id",
        }
      )
      .select()
      .single();

    if (saveError || !savedProgress) {
      throw saveError || new Error("Failed to save reading progress");
    }

    res.json({
      success: true,
      progress: savedProgress,
    });
  } catch (error) {
    console.error("reading-progress POST error:", error);
    res
      .status(500)
      .json({ error: error.message || "Failed to save reading progress" });
  }
});

app.get("/api/reading-progress", async (req, res) => {
  try {
    const user = await requireSessionUser(req, res);
    if (!user) return;

    const { data, error } = await supabase
      .from("reading_progress")
      .select(`
        id,
        user_id,
        novel_id,
        chapter_id,
        last_read_chapter_number,
        updated_at,
        novels (
          id,
          slug,
          title,
          author,
          cover_url
        )
      `)
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false });

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      progress: data || [],
    });
  } catch (error) {
    console.error("reading-progress GET all error:", error);
    res
      .status(500)
      .json({ error: error.message || "Failed to fetch reading progress" });
  }
});

app.get("/api/reading-progress/:novelId", async (req, res) => {
  try {
    const user = await requireSessionUser(req, res);
    if (!user) return;

    const { novelId } = req.params;

    if (!isUuid(novelId)) {
      return res.status(400).json({ error: "Invalid novelId" });
    }

    const { data, error } = await supabase
      .from("reading_progress")
      .select(`
        id,
        user_id,
        novel_id,
        chapter_id,
        last_read_chapter_number,
        updated_at,
        novels (
          id,
          slug,
          title,
          author,
          cover_url
        )
      `)
      .eq("user_id", user.id)
      .eq("novel_id", novelId)
      .maybeSingle();

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      progress: data || null,
    });
  } catch (error) {
    console.error("reading-progress GET one error:", error);
    res
      .status(500)
      .json({ error: error.message || "Failed to fetch reading progress" });
  }
});

app.get("/api/purchases", async (req, res) => {
  try {
    const user = await requireSessionUser(req, res);
    if (!user) return;

    if (user.auth_user_id) {
      const userIds = await getLinkedUserIds(user);

      const { data, error } = await supabase
        .from("purchases")
        .select(`
          id,
          paypal_order_id,
          coins,
          amount,
          pack_key,
          status,
          slug,
          novel_id,
          chapter_number,
          created_at,
          user_id
        `)
        .in("user_id", userIds)
        .order("created_at", { ascending: false });

      if (error) throw error;

      return res.json({
        success: true,
        purchases: data || [],
      });
    }

    const { data, error } = await supabase
      .from("purchases")
      .select(`
        id,
        paypal_order_id,
        coins,
        amount,
        pack_key,
        status,
        slug,
        novel_id,
        chapter_number,
        created_at,
        user_id
      `)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) throw error;

    res.json({
      success: true,
      purchases: data || [],
    });
  } catch (error) {
    console.error("GET /api/purchases error:", error);
    res.status(500).json({ error: error.message || "Failed to fetch purchases" });
  }
});

app.get("/api/coin-transactions", async (req, res) => {
  try {
    const user = await requireSessionUser(req, res);
    if (!user) return;

    const userIds = await getLinkedUserIds(user);

    const { data, error } = await supabase
      .from("coin_transactions")
      .select(`
        id,
        user_id,
        type,
        amount,
        balance_after,
        novel_id,
        chapter_id,
        note,
        created_at,
        novels:novel_id (
          id,
          slug,
          title,
          cover_url
        ),
        chapters:chapter_id (
          id,
          chapter_number,
          title
        )
      `)
      .in("user_id", userIds)
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      transactions: data || [],
    });
  } catch (error) {
    console.error("GET /api/coin-transactions error:", error);
    res
      .status(500)
      .json({ error: error.message || "Failed to fetch coin transactions" });
  }
});

app.get("/api/unlocked-series", async (req, res) => {
  try {
    const user = await requireSessionUser(req, res);
    if (!user) return;

    const userIds = await getLinkedUserIds(user);

    const { data, error } = await supabase
      .from("unlocked_chapters")
      .select(`
        id,
        user_id,
        novel_id,
        chapter_id,
        chapter_number,
        unlocked_at,
        novels:novel_id (
          id,
          slug,
          title,
          author,
          cover_url
        )
      `)
      .in("user_id", userIds)
      .order("unlocked_at", { ascending: false });

    if (error) {
      throw error;
    }

    const rows = data || [];
    const groupedMap = new Map();

    for (const row of rows) {
      const novel = row.novels;
      if (!novel?.id) continue;

      if (!groupedMap.has(novel.id)) {
        groupedMap.set(novel.id, {
          novel,
          unlockedCount: 0,
          latestUnlockedChapter: 0,
          latestUnlockedAt: row.unlocked_at,
        });
      }

      const entry = groupedMap.get(novel.id);
      entry.unlockedCount += 1;

      if (Number(row.chapter_number || 0) > entry.latestUnlockedChapter) {
        entry.latestUnlockedChapter = Number(row.chapter_number || 0);
      }

      if (
        row.unlocked_at &&
        new Date(row.unlocked_at) > new Date(entry.latestUnlockedAt)
      ) {
        entry.latestUnlockedAt = row.unlocked_at;
      }
    }

    const series = Array.from(groupedMap.values()).sort(
      (a, b) => new Date(b.latestUnlockedAt) - new Date(a.latestUnlockedAt)
    );

    res.json({
      success: true,
      series,
    });
  } catch (error) {
    console.error("GET /api/unlocked-series error:", error);
    res.status(500).json({
      error: error.message || "Failed to fetch unlocked series",
    });
  }
});

app.get("/api/unlocked-chapters/:novelId", async (req, res) => {
  try {
    const user = await requireSessionUser(req, res);
    if (!user) return;

    const { novelId } = req.params;

    if (!isUuid(novelId)) {
      return res.status(400).json({ error: "Invalid novelId" });
    }

    const userIds = await getLinkedUserIds(user);

    const { data, error } = await supabase
      .from("unlocked_chapters")
      .select("chapter_id, chapter_number")
      .in("user_id", userIds)
      .eq("novel_id", novelId);

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      unlockedChapters: data || [],
    });
  } catch (error) {
    console.error("GET /api/unlocked-chapters/:novelId error:", error);
    res.status(500).json({
      error: error.message || "Failed to fetch unlocked chapters",
    });
  }
});

app.post("/api/paypal/create-order", async (req, res) => {
  try {
    const user = await requireSessionUser(req, res);
    if (!user) return;

    const { packKey, slug, novelId, chapterNumber } = req.body || {};

    const pack = PACKS[packKey];
    if (!pack) {
      return res.status(400).json({ error: "Invalid packKey" });
    }

    const resolvedNovelId = await resolveNovelIdFromBody({ slug, novelId });
    const accessToken = await getAccessToken();

    const customData = {
      userId: user.id,
      packKey,
      slug: slug || null,
      novelId: resolvedNovelId || null,
      chapterNumber: chapterNumber ? Number(chapterNumber) : null,
    };

    const response = await fetch(`${PAYPAL_BASE}/v2/checkout/orders`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        intent: "CAPTURE",
        application_context: {
          return_url: `${CLIENT_URL}/paypal-success`,
          cancel_url: `${CLIENT_URL}/paypal-cancel`,
          user_action: "PAY_NOW",
        },
        purchase_units: [
          {
            description:
              packKey === "svip_7day"
                ? "7 Day SVIP Membership"
                : `${pack.coins} Coins Pack`,
            custom_id: JSON.stringify(customData),
            amount: {
              currency_code: "USD",
              value: pack.amount,
            },
          },
        ],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    const approveUrl = data.links?.find((link) => link.rel === "approve")?.href;

    const { error: purchaseError } = await supabase.from("purchases").insert({
      user_id: user.id,
      paypal_order_id: data.id,
      coins: pack.coins,
      amount: pack.amount,
      pack_key: packKey,
      status: "pending",
      slug: slug || null,
      novel_id: resolvedNovelId || null,
      chapter_number: chapterNumber ? Number(chapterNumber) : null,
    });

    if (purchaseError) {
      throw purchaseError;
    }

    res.json({
      id: data.id,
      approveUrl,
    });
  } catch (error) {
    console.error("create-order error:", error);
    res.status(500).json({ error: error.message || "Failed to create order" });
  }
});

app.post("/api/paypal/capture-order", async (req, res) => {
  try {
    const sessionUser = await requireSessionUser(req, res);
    if (!sessionUser) return;

    const sessionRow = await getSessionRowFromCookie(req);

    const { orderID } = req.body || {};

    if (!orderID) {
      return res.status(400).json({ error: "Missing orderID" });
    }

    const { data: purchase, error: purchaseError } = await supabase
      .from("purchases")
      .select("*")
      .eq("paypal_order_id", orderID)
      .maybeSingle();

    if (purchaseError) {
      throw purchaseError;
    }

    if (!purchase) {
      return res.status(404).json({ error: "Purchase record not found" });
    }

    console.log("capture debug", {
      orderID,
      sessionUserId: sessionUser?.id,
      purchaseUserId: purchase?.user_id,
      purchaseStatus: purchase?.status,
    });

    const captureUserId = purchase.user_id || sessionUser.id;

    if (sessionRow && captureUserId && sessionUser.id !== captureUserId) {
      const { error: relinkSessionError } = await supabase
        .from("sessions")
        .update({
          user_id: captureUserId,
          is_guest: false,
          expires_at: new Date(
            Date.now() + 1000 * 60 * 60 * 24 * 30
          ).toISOString(),
        })
        .eq("id", sessionRow.id);

      if (relinkSessionError) {
        console.error(
          "capture-order session relink error:",
          relinkSessionError
        );
        return res
          .status(500)
          .json({ error: "Failed to relink session after PayPal return" });
      }
    }

    if (purchase.status === "completed") {
      const { data: freshUser } = await supabase
        .from("users")
        .select("*")
        .eq("id", captureUserId)
        .maybeSingle();

      return res.json({
        success: true,
        alreadyProcessed: true,
        addCoins: 0,
        user: freshUser ? serializeUser(freshUser) : serializeUser(sessionUser),
        redirectTo: buildPurchaseRedirect(purchase),
        purchaseContext: buildPurchaseContext(purchase),
      });
    }

    const accessToken = await getAccessToken();

    const response = await fetch(
      `${PAYPAL_BASE}/v2/checkout/orders/${orderID}/capture`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    const { data: user, error: userError } = await supabase
      .from("users")
      .select("id, coins, vip_expiry, unlocked, auto_unlock, auth_user_id, email")
      .eq("id", captureUserId)
      .maybeSingle();

    if (userError) {
      console.error("capture-order user lookup db error:", userError);
      return res.status(500).json({ error: "User lookup failed" });
    }

    if (!user) {
      console.error("capture-order missing user row:", {
        captureUserId,
        sessionUserId: sessionUser?.id,
        purchaseUserId: purchase?.user_id,
        orderID,
      });
      return res.status(404).json({ error: "User not found" });
    }

    let updatedCoins = Number(user.coins || 0);
    let updatedVipExpiry = user.vip_expiry || null;

    if (purchase.pack_key === "svip_7day") {
      const vipDays = Number(PACKS.svip_7day.vipDays || 7);
      const now = new Date();
      const currentVip = user.vip_expiry ? new Date(user.vip_expiry) : null;

      let newExpiry;

      if (currentVip && currentVip > now) {
        newExpiry = new Date(
          currentVip.getTime() + vipDays * 24 * 60 * 60 * 1000
        );
      } else {
        newExpiry = new Date(
          now.getTime() + vipDays * 24 * 60 * 60 * 1000
        );
      }

      updatedVipExpiry = newExpiry.toISOString();
    } else {
      updatedCoins = Number(user.coins || 0) + Number(purchase.coins || 0);
    }

    const { data: updatedUser, error: updateUserError } = await supabase
      .from("users")
      .update({
        coins: updatedCoins,
        vip_expiry: updatedVipExpiry,
        updated_at: new Date().toISOString(),
      })
      .eq("id", captureUserId)
      .select()
      .single();

    if (updateUserError || !updatedUser) {
      throw updateUserError || new Error("Failed to update user after capture");
    }

    if (purchase.pack_key !== "svip_7day" && Number(purchase.coins || 0) > 0) {
      const { error: ledgerError } = await supabase
        .from("coin_transactions")
        .insert({
          user_id: captureUserId,
          type: "purchase",
          amount: Number(purchase.coins || 0),
          balance_after: Number(updatedUser.coins || 0),
          novel_id: purchase.novel_id || null,
          note: `${purchase.pack_key || "coin_pack"} purchase`,
        });

      if (ledgerError) {
        console.error("coin ledger purchase insert error:", ledgerError);
      }
    }

    const { error: updatePurchaseError } = await supabase
      .from("purchases")
      .update({ status: "completed" })
      .eq("paypal_order_id", orderID);

    if (updatePurchaseError) {
      throw updatePurchaseError;
    }

    res.json({
      success: true,
      addCoins: Number(purchase.coins || 0),
      vipActivated: purchase.pack_key === "svip_7day",
      user: serializeUser(updatedUser),
      redirectTo: buildPurchaseRedirect(purchase),
      purchaseContext: buildPurchaseContext(purchase),
      capture: data,
    });
  } catch (error) {
    console.error("capture-order error:", error);
    res.status(500).json({ error: error.message || "Failed to capture order" });
  }
});

app.post("/api/unlock-chapter", async (req, res) => {
  try {
    const user = await requireSessionUser(req, res);
    if (!user) return;

    const { slug, novelId, chapterNumber } = req.body || {};
    const numericChapterNumber = Number(chapterNumber);

    if (!numericChapterNumber || Number.isNaN(numericChapterNumber)) {
      return res.status(400).json({ error: "Invalid chapterNumber" });
    }

    const resolvedNovelId = await resolveNovelIdFromBody({ slug, novelId });

    if (!resolvedNovelId) {
      return res.status(400).json({ error: "Missing or invalid novelId/slug" });
    }

    const { data: chapter, error: chapterError } = await supabase
      .from("chapters")
      .select("id, chapter_number, coin_price, is_free, novel_id")
      .eq("novel_id", resolvedNovelId)
      .eq("chapter_number", numericChapterNumber)
      .single();

    if (chapterError || !chapter) {
      return res.status(404).json({ error: "Chapter not found" });
    }

    const currentCoins = Number(user.coins || 0);

    if (isVipActive(user)) {
      return res.json({
        success: true,
        alreadyUnlocked: true,
        coins: currentCoins,
        vip_expiry: user.vip_expiry,
      });
    }

    if (chapter.is_free) {
      return res.json({
        success: true,
        alreadyUnlocked: true,
        coins: currentCoins,
        vip_expiry: user.vip_expiry,
      });
    }

    const userIds = await getLinkedUserIds(user);

    const { data: existingUnlockedRow, error: existingUnlockedError } =
      await supabase
        .from("unlocked_chapters")
        .select("id")
        .in("user_id", userIds)
        .eq("novel_id", resolvedNovelId)
        .eq("chapter_id", chapter.id)
        .maybeSingle();

    if (existingUnlockedError) {
      throw existingUnlockedError;
    }

    if (existingUnlockedRow) {
      return res.json({
        success: true,
        alreadyUnlocked: true,
        coins: currentCoins,
        vip_expiry: user.vip_expiry,
      });
    }

    const unlockPrice = Number(chapter.coin_price || 0);

    if (currentCoins < unlockPrice) {
      return res.status(400).json({
        success: false,
        error: "Not enough coins",
        coins: currentCoins,
        required: unlockPrice,
      });
    }

    const updatedCoins = currentCoins - unlockPrice;

    const { data: updatedUser, error: updateError } = await supabase
      .from("users")
      .update({
        coins: updatedCoins,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id)
      .select()
      .single();

    if (updateError || !updatedUser) {
      throw updateError || new Error("Failed to unlock chapter");
    }

    const { error: unlockedInsertError } = await supabase
      .from("unlocked_chapters")
      .upsert(
        {
          user_id: user.id,
          novel_id: resolvedNovelId,
          chapter_id: chapter.id,
          chapter_number: numericChapterNumber,
          unlocked_at: new Date().toISOString(),
        },
        {
          onConflict: "user_id,chapter_id",
        }
      );

    if (unlockedInsertError) {
      console.error(
        "unlocked_chapters insert error:",
        unlockedInsertError
      );
    }

    const { error: ledgerError } = await supabase
      .from("coin_transactions")
      .insert({
        user_id: user.id,
        type: "unlock",
        amount: -unlockPrice,
        balance_after: Number(updatedUser.coins || 0),
        novel_id: resolvedNovelId,
        chapter_id: chapter.id,
        note: `Unlocked chapter ${numericChapterNumber}`,
      });

    if (ledgerError) {
      console.error("coin ledger unlock insert error:", ledgerError);
    }

    res.json({
      success: true,
      coins: Number(updatedUser.coins || 0),
      unlocked: [],
      vip_expiry: updatedUser.vip_expiry,
    });
  } catch (error) {
    console.error("unlock-chapter error:", error);
    res.status(500).json({ error: error.message || "Failed to unlock chapter" });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});