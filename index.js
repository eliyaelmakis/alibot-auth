const express = require("express");
const axios = require("axios");
const crypto = require("crypto");

const app = express();

// פרטי האפליקציה שלך
const APP_KEY = "516788";
const APP_SECRET = "WixDkQ3wFt24CJrIFKLXUYDh4vb7d20X";
const REDIRECT_URI = "https://alibot-auth.onrender.com/callback";

function generateSignature(params, appSecret) {
  // מיון לפי מפתח בסדר עולה
  const sortedKeys = Object.keys(params).sort();
  let baseString = appSecret;

  for (const key of sortedKeys) {
    baseString += key + params[key];
  }

  baseString += appSecret;

  // SHA256 hash → אותיות גדולות
  return crypto
    .createHash("sha256")
    .update(baseString)
    .digest("hex")
    .toUpperCase();
}

app.get("/", (req, res) => {
  res.send("🚀 AliBot Auth Server is Running");
});

app.get("/callback", async (req, res) => {
  const { code } = req.query;

  if (!code) {
    return res.status(400).send("❌ לא התקבל קוד מההרשאה");
  }

  const timestamp = Date.now().toString();
  const uuid = crypto.randomUUID(); // או סתם מזהה רנדומלי

  // הפרמטרים הדרושים לחתימה
  const params = {
    app_key: APP_KEY,
    code: code,
    sign_method: "sha256",
    timestamp: timestamp,
    uuid: uuid,
  };

  // יצירת חתימה
  const sign = generateSignature(params, APP_SECRET);

  // הוספת החתימה לפרמטרים
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
    const errData = error.response?.data || error.message;
    console.error("❌ Token request failed:", errData);
    res
      .status(500)
      .send(
        `<pre>❌ Token request failed:\n${JSON.stringify(
          errData,
          null,
          2
        )}</pre>`
      );
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🔉 Server running on port ${PORT}`));
