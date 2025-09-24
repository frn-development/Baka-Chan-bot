const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "banana",
    version: "1.0",
    author: "Farhan",
    countDown: 5,
    role: 0,
    shortDescription: { en: "🍌 Edit image with Banana AI" },
    longDescription: { en: "Use Gemini Nano Banana API to edit images with fun prompts 🍌✨" },
    category: "fan",
    guide: { en: "{p}banana [prompt] (reply to image)" }
  },

  onStart: async function ({ api, event, args, message }) {
    const prompt = args.join(" ").trim();
    const repliedImage = event.messageReply?.attachments?.[0];

    if (!prompt || !repliedImage || repliedImage.type !== "photo") {
      return message.reply("⚠️ | Please reply to an image and type a prompt. Example:\n!banana make it banana cyberpunk 🍌");
    }

    const imgPath = path.join(__dirname, "cache", `${Date.now()}_banana.jpg`);
    const waitMsg = await message.reply(`🍌✨ Banana AI is cooking your image with:\n"${prompt}"\n\nPlease wait... 🚀`);

    try {
      const imgURL = repliedImage.url;
      const apiURL = `https://nexalo-api.vercel.app/api/ai-canvas?url=${encodeURIComponent(imgURL)}&prompt=${encodeURIComponent(prompt)}`;

      const res = await axios.get(apiURL, { responseType: "arraybuffer" });

      await fs.ensureDir(path.dirname(imgPath));
      await fs.writeFile(imgPath, Buffer.from(res.data, "binary"));

      await message.reply({
        body: `✅ | Done! Your Banana AI edit is ready 🍌\nPrompt: "${prompt}"`,
        attachment: fs.createReadStream(imgPath)
      });

    } catch (err) {
      console.error("BANANA Error:", err);
      message.reply("❌ | Banana AI failed to edit your image. Maybe too many bananas? 🍌😂");
    } finally {
      await fs.remove(imgPath);
      api.unsendMessage(waitMsg.messageID);
    }
  }
};
