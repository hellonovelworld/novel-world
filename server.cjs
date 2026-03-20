require("dotenv").config();
const express = require("express");
const cors = require("cors");
const crypto = require("crypto");
const { createClient } = require("@supabase/supabase-js");

const app = express();

const allowedOrigins = [
  "http://localhost:5173",
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
  })
);

app.use(express.json());

const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET;
const PAYPAL_BASE =
  process.env.PAYPAL_ENV === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
  throw new Error("Missing PAYPAL_CLIENT_ID or PAYPAL_CLIENT_SECRET in .env");
}

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env");
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

const CHAPTER_PRICES = {
  4: 449,
  5: 508,
  6: 563,
  7: 508,
  8: 521,
  9: 540,
  10: 563,
};

function isUuid(value) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value || ""
  );
}

function normalizeUnlocked(value) {
  if (Array.isArray(value)) return value;
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
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
    throw new Error(data.error_description || "Failed to get PayPal access token");
  }

  return data.access_token;
}

app.get("/", (req, res) => {
  res.send("Novel World backend is running");
});

app.get("/health", (req, res) => {
  res.json({ ok: true });
});

/**
 * Create or fetch a user safely.
 * Frontend can call this on first load.
 */
app.post("/api/user/init", async (req, res) => {
  try {
    let { userId } = req.body || {};

    if (!isUuid(userId)) {
      userId = crypto.randomUUID();
    }

    const { data: existingUser, error: findError } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .maybeSingle();

    if (findError) {
      throw findError;
    }

    if (!existingUser) {
      const { error: insertError } = await supabase.from("users").insert({
        id: userId,
        coins: 0,
        vip_expiry: null,
      });

      if (insertError) {
        throw insertError;
      }
    }

    const { data: user, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();

    if (userError) {
      throw userError;
    }

    res.json({
      success: true,
      userId,
      user: {
        id: user.id,
        coins: Number(user.coins || 0),
        vip_expiry: user.vip_expiry,
        unlocked: Array.isArray(user.unlocked) ? user.unlocked : [],
      },
    });
  } catch (error) {
    console.error("user/init error:", error);
    res.status(500).json({ error: error.message || "Failed to init user" });
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
      user: {
        id: user.id,
        coins: Number(user.coins || 0),
        vip_expiry: user.vip_expiry,
        unlocked: Array.isArray(user.unlocked) ? user.unlocked : [],
      },
    });
  } catch (error) {
    console.error("user/data error:", error);
    res.status(500).json({ error: error.message || "Failed to load user" });
  }
});

/**
 * Secure PayPal order creation.
 * Frontend sends only: userId + packKey
 * Backend decides coins and amount.
 */
app.post("/api/paypal/create-order", async (req, res) => {
  try {
    const { userId, packKey } = req.body || {};

    if (!isUuid(userId)) {
      return res.status(400).json({ error: "Invalid userId" });
    }

    const pack = PACKS[packKey];
    if (!pack) {
      return res.status(400).json({ error: "Invalid packKey" });
    }

    const { data: user, error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("id", userId)
      .single();

    if (userError || !user) {
      return res.status(404).json({ error: "User not found" });
    }

    const accessToken = await getAccessToken();

    const response = await fetch(`${PAYPAL_BASE}/v2/checkout/orders`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        intent: "CAPTURE",
        application_context: {
          return_url: "https://novel-world.com/paypal-success",
          cancel_url: "https://novel-world.com/paypal-cancel",
          user_action: "PAY_NOW",
        },
        purchase_units: [
          {
            description: `${pack.coins} Coins Pack`,
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
      user_id: userId,
      paypal_order_id: data.id,
      coins: pack.coins,
      amount: pack.amount,
      pack_key: packKey,
      status: "pending",
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

/**
 * Secure PayPal capture.
 * Frontend sends only: userId + orderID
 * Backend looks up stored purchase and credits exactly once.
 */
app.post("/api/paypal/capture-order", async (req, res) => {
  try {
    const { userId, orderID } = req.body || {};

    if (!isUuid(userId)) {
      return res.status(400).json({ error: "Invalid userId" });
    }

    if (!orderID) {
      return res.status(400).json({ error: "Missing orderID" });
    }

    const { data: purchase, error: purchaseError } = await supabase
      .from("purchases")
      .select("*")
      .eq("paypal_order_id", orderID)
      .eq("user_id", userId)
      .maybeSingle();

    if (purchaseError) {
      throw purchaseError;
    }

    if (!purchase) {
      return res.status(404).json({ error: "Purchase record not found" });
    }

    if (purchase.status === "completed") {
      return res.json({
        success: true,
        alreadyProcessed: true,
        addCoins: 0,
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
      .select("coins, vip_expiry")
      .eq("id", userId)
      .single();

    if (userError || !user) {
      return res.status(404).json({ error: "User not found" });
    }

    let updatedCoins = Number(user.coins || 0);
    let updatedVipExpiry = user.vip_expiry || null;
    
    // 🧠 CHECK IF SVIP
    if (purchase.pack_key === "svip_7day") {
      const now = new Date();
    
      const currentVip = user.vip_expiry
        ? new Date(user.vip_expiry)
        : null;
    
      let newExpiry;
    
      if (currentVip && currentVip > now) {
        // extend existing VIP
        newExpiry = new Date(
          currentVip.getTime() + 7 * 24 * 60 * 60 * 1000
        );
      } else {
        // start fresh
        newExpiry = new Date(
          now.getTime() + 7 * 24 * 60 * 60 * 1000
        );
      }
    
      updatedVipExpiry = newExpiry.toISOString();
    } else {
      // normal coin pack
      updatedCoins =
        Number(user.coins || 0) + Number(purchase.coins || 0);
    }
    
    const { error: updateUserError } = await supabase
      .from("users")
      .update({
        coins: updatedCoins,
        vip_expiry: updatedVipExpiry,
      })
      .eq("id", userId);

    if (updateUserError) {
      throw updateUserError;
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
      capture: data,
    });
  } catch (error) {
    console.error("capture-order error:", error);
    res.status(500).json({ error: error.message || "Failed to capture order" });
  }
});

/**
 * Secure unlock endpoint.
 * Deducts coins on backend only.
 */
app.post("/api/unlock-chapter", async (req, res) => {
  try {
    const { userId, chapterNumber } = req.body || {};

    if (!isUuid(userId)) {
      return res.status(400).json({ error: "Invalid userId" });
    }

    if (!chapterNumber) {
      return res.status(400).json({ error: "Missing chapterNumber" });
    }

    const { data: user, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();

    if (userError || !user) {
      return res.status(404).json({ error: "User not found" });
    }

    const currentCoins = Number(user.coins || 0);
    const unlockPrice = CHAPTER_PRICES[Number(chapterNumber)];

    if (!unlockPrice) {
      return res.status(400).json({ error: "Invalid chapterNumber" });
    }
    
    const unlocked = normalizeUnlocked(user.unlocked);

    if (unlocked.includes(chapterNumber)) {
      return res.json({
        success: true,
        alreadyUnlocked: true,
        coins: currentCoins,
        unlocked,
      });
    }

    if (currentCoins < unlockPrice) {
      return res.status(400).json({
        success: false,
        error: "Not enough coins",
        coins: currentCoins,
      });
    }

    const updatedUnlocked = [...unlocked, chapterNumber];
    const updatedCoins = currentCoins - unlockPrice;

    const { error: updateError } = await supabase
      .from("users")
      .update({
        coins: updatedCoins,
        unlocked: updatedUnlocked,
      })
      .eq("id", userId);

    if (updateError) {
      throw updateError;
    }

    res.json({
      success: true,
      coins: updatedCoins,
      unlocked: updatedUnlocked,
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
