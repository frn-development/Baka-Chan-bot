const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports.config = {
  name: "logo",
  aliases: ["logogen", "makeLogo"],
  Auth: 0,
  Owner: "Hina",
  Info: "🎨 Generate a logo using AI (no API key required)",
  Class: "✧༺Tools_Menu༻✧",
  How: "logo <description | name>"
};

module.exports.onType = async function ({ args, sh }) {
  try {
    if (!args[0]) {
      return sh.reply("⚠️ You must provide a description for the logo.\nExample: logo Hina Bot | modern | blue and black | robot icon");
    }

    const prompt = args.join(" ");
    await sh.reply("⏳ Generating your logo...");

    // Pollinations API (open, no key required)
    const url = `https://image.pollinations.ai/prompt/${encodeURIComponent("Logo design, vector, minimal, clean, " + prompt)}`;

    // Download image
    const tempPath = path.join(__dirname, `logo_${Date.now()}.png`);
    const response = await axios.get(url, { responseType: "arraybuffer" });
    fs.writeFileSync(tempPath, response.data);

    // Send result
    await sh.reply({
      body: `✅ Logo generated based on your description:\n"${prompt}"`,
      attachment: fs.createReadStream(tempPath)
    });

    // Delete temp file after sending
    setTimeout(() => {
      if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
    }, 10000);

  } catch (err) {
    console.error("logo error:", err.message);
    sh.reply("❌ An error occurred while generating the logo.");
  }
};
      
