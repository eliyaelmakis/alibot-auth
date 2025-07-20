const express = require("express");
const axios = require("axios");
const crypto = require("crypto");
const qs = require("qs"); // נדרש לשליחת body בפורמט x-www-form-urlencoded

const app = express();
const PORT = process.env.PORT || 3000;

// ✨ הגדרות
const APP_KEY = "516788";
const APP_SECRET = "WixDkQ3wFt24CJrIFKLXUYDh4vb7d20X";
const API_PATH = "/auth/token/create";

// 🧠 פונקציה לחתימה לפי אלגוריתם AliExpress
function generateAliExpressSignature(params, apiPath, appSecret) {
  const sortedKeys = Object.keys(params).sort();

  let baseString = apiPath;
  for (const key of sortedKeys) {
    const value = params[key];
    if (value !== undefined && value !== null && value !== "") {
      baseString += key + value;
    }
  }

  console.log("🔐 Signing base string:", baseString);

  const hmac = crypto.createHmac("sha256", appSecret);
  hmac.update(baseString, "utf8");
  return hmac.digest("hex").toUpperCase();
}

// 📥 מסלול ה-callback לקבלת ה-code מהאישור
app.get("/callback", async (req, res) => {
  const code = req.query.code;
  if (!code) return res.status(400).send("❌ Missing code");

  const timestamp = Date.now().toString();

  const params = {
    app_key: APP_KEY,
    code,
    timestamp,
    sign_method: "sha256",
  };

  const sign = generateAliExpressSignature(params, API_PATH, APP_SECRET);
  const requestBody = { ...params, sign };

  console.log("📦 Params:", requestBody);

  try {
    const response = await axios.post(
      "https://api-sg.aliexpress.com/rest/auth/token/create",
      qs.stringify(requestBody),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    console.log("✅ Access Token Response:\n", response.data);
    res.send(`<pre>${JSON.stringify(response.data, null, 2)}</pre>`);
  } catch (error) {
    console.error("❌ Error:", error.response?.data || error.message);
    res
      .status(500)
      .send(
        `<pre>${JSON.stringify(
          error.response?.data || error.message,
          null,
          2
        )}</pre>`
      );
  }
});

app.get("/", (req, res) => {
  res.send("🚀 AliBot Auth Server is Running");
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
