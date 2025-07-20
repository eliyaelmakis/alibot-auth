const express = require("express");
const axios = require("axios");
const qs = require("querystring"); // חשוב

const app = express();

app.get("/", (req, res) => {
  res.send("🚀 AliBot Auth Server is Running");
});

// Callback route שמקבל את ה-code ומבקש access_token
app.get("/callback", async (req, res) => {
  const { code } = req.query;

  if (!code) {
    return res.send("❌ לא התקבל קוד מההרשאה");
  }

  const data = {
    grant_type: "authorization_code",
    client_id: "516788",
    client_secret: "WixDkQ3wFt24CJrIFKLXUYDh4vb7d20X",
    code,
    redirect_uri: "https://alibot-auth.onrender.com/callback",
  };

  try {
    const tokenResponse = await axios.post(
      "https://api-sg.aliexpress.com/oauth/token",
      qs.stringify(data),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    const tokenData = tokenResponse.data;
    console.log("✅ Access Token:", tokenData.access_token);
    res.send(`<pre>✅ Token:\n${JSON.stringify(tokenData, null, 2)}</pre>`);
  } catch (err) {
    const errorData = err.response?.data || err.message;
    console.error("❌ Token request failed:", errorData);
    res.send(
      `<pre>❌ Token request failed:\n${JSON.stringify(
        errorData,
        null,
        2
      )}</pre>`
    );
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🔉 Server running on port ${PORT}`));
