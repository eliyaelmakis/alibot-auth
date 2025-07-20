const express = require("express");
const axios = require("axios");
const crypto = require("crypto");

const app = express();

const APP_KEY = "516788";
const APP_SECRET = "WixDkQ3wFt24CJrIFKLXUYDh4vb7d20X";
const REDIRECT_URI = "https://alibot-auth.onrender.com/callback";

// פונקציה לחישוב חתימה
function generateSignature(params, appSecret) {
  const sortedParams = Object.entries(params)
    .filter(([_, v]) => v !== undefined && v !== null && v !== "")
    .sort(([a], [b]) => a.localeCompare(b));

  let baseString = appSecret;
  for (const [key, value] of sortedParams) {
    baseString += key + value;
  }
  baseString += appSecret;

  console.log("🔐 Signing base string:", baseString);

  return crypto
    .createHash("sha256")
    .update(baseString)
    .digest("hex")
    .toUpperCase();
}

// טיימסטמפ בפורמט AliExpress (מילישניות)
function getAliExpressTimestamp() {
  return Date.now().toString();
}

app.get("/", (req, res) => {
  res.send("🚀 AliBot Auth Server is Running");
});

app.get("/callback", async (req, res) => {
  const { code } = req.query;

  if (!code) {
    return res.status(400).send("❌ לא התקבל קוד מההרשאה");
  }

  const timestamp = getAliExpressTimestamp();

  const params = {
    app_key: APP_KEY,
    code: code,
    timestamp: timestamp,
    sign_method: "sha256",
  };

  const sign = generateSignature(params, APP_SECRET);

  const requestBody = {
    ...params,
    sign,
  };

  try {
    const response = await axios.post(
      "https://api-sg.aliexpress.com/rest/auth/token/create",
      requestBody,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    res.send(
      `<pre>✅ Access Token Response:\n${JSON.stringify(
        response.data,
        null,
        2
      )}</pre>`
    );
  } catch (error) {
    const err = error.response?.data || error.message;
    console.error("❌ Token request failed:", err);
    res
      .status(500)
      .send(
        `<pre>❌ Token request failed:\n${JSON.stringify(err, null, 2)}</pre>`
      );
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🟢 Server running on port ${PORT}`));
