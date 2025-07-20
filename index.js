const express = require("express");
const axios = require("axios");

const app = express();

app.get("/", (req, res) => {
  res.send("🚀 AliBot Auth Server is Running");
});

app.get("/callback", async (req, res) => {
  const { code } = req.query;

  if (!code) {
    return res.status(400).send("❌ Missing authorization code");
  }

  const params = new URLSearchParams();
  params.append("grant_type", "authorization_code");
  params.append("client_id", "516788");
  params.append("client_secret", "WixDkQ3wFt24CJrIFKLXUYDh4vb7d20X");
  params.append("code", code);
  params.append("redirect_uri", "https://alibot-auth.onrender.com/callback");

  try {
    const response = await axios.post(
      "https://api-sg.aliexpress.com/oauth/token",
      params,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    res.send(`<pre>${JSON.stringify(response.data, null, 2)}</pre>`);
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
