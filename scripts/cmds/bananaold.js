const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

async function getSafeUsername(api, userID) {
  try {
    const userInfo = await api.getUserInfo(userID);
    return (userInfo[userID]?.name || "user").replace(/[^a-zA-Z0-9]/g, "_");
  } catch {
    return "user";
  }
}

module.exports = {
  config: {
    name: "nanobanana",
    aliases: ["nb", "neno"],
    version: "1.0",
    author: "Farhan ",
    countDown: 10,
    role: 0,
    shortDescription: "Generate banana-themed images with NanoBanana API",
    longDescription: "Creates fun, banana-inspired AI images from your prompt.",
    category: "image",
    guide: "{pn} <prompt> [seed=123]\nExample: {pn} funny goat eating banana seed=456"
  },

  onStart: async function ({ api, event, args, message }) {
    const fullInput = args.join(" ").trim();
    if (!fullInput) {
      return message.reply("❌ Please provide a prompt.\nExample: nanobanana funny goat eating banana seed=456");
    }

    // Parse prompt and optional seed
    let prompt = fullInput;
    let seed = Math.floor(Math.random() * 1000000); // Default random seed
    const seedMatch = fullInput.match(/seed=(\d+)/i);
    if (seedMatch) {
      seed = parseInt(seedMatch[1], 10);
      prompt = fullInput.replace(/seed=\d+/i, "").trim();
    }

    if (!prompt) {
      return message.reply("❌ Prompt is required.");
    }

    const username = await getSafeUsername(api, event.senderID);
    const waitMsg = await message.reply("🍌 Generating your NanoBanana image... Please wait ⏳");

    try {
      await fs.ensureDir(path.join(__dirname, "cache"));

      const apiRes = await axios.get("https://dev.oculux.xyz/api/nanobanana", {
        params: { prompt: encodeURIComponent(prompt), seed: seed.toString() },
        timeout: 30000,
        responseType: "arraybuffer" // Assume binary image response; change to 'json' if it returns {image: base64}
      });

      const imgPath = path.join(__dirname, `cache/nb_${username}_${seed}.png`);
      await fs.writeFile(imgPath, apiRes.data);

      await message.reply({
        body: `🍌 Neno Banana generated!\nPrompt: ${prompt}\nSeed: ${seed}`,
        attachment: fs.createReadStream(imgPath)
      }, waitMsg.messageID);

      // Clean up after 30 seconds
      setTimeout(() => fs.existsSync(imgPath) && fs.unlinkSync(imgPath), 30000);

    } catch (err) {
      console.error("NanoBanana Error:", err.message);
      message.reply("❌ Failed to generate image. Check the API or try again.", waitMsg.messageID);
    }
  }
};
