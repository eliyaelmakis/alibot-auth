const express = require("express");
const axios = require("axios");
const app = express();

app.get("/", (req, res) => {
  res.send("🚀 AliBot Auth Server is Running");
});

// זה הנתיב שה-redirect_uri מפנה אליו עם הקוד
app.get("/callback", async (req, res) => {
  const { code } = req.query;
  console.log("📥 קיבלתי קוד:", code);

  // מבצע קריאה ל־API כדי לקבל access_token
  try {
    const tokenResponse = await axios.post(
      "https://api-sg.aliexpress.com/oauth/token",
      null,
      {
        params: {
          grant_type: "authorization_code",
          client_id: "516788",
          client_secret: "WixDkQ3wFt24CJrIFKLXUYDh4vb7d20X",
          code,
          redirect_uri: "https://lovable-telegram-bot.onrender.com/callback",
        },
      }
    );

    const data = tokenResponse.data;
    console.log("✅ Access Token:", data.access_token);
    res.send(`<pre>✅ Access Token:\n${JSON.stringify(data, null, 2)}</pre>`);
  } catch (err) {
    console.error("❌ שגיאה בקבלת טוקן:", err.response?.data || err.message);
    res.send("❌ שגיאה בקבלת טוקן");
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🔉 Server running on port ${PORT}`));
