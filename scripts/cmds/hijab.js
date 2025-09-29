const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "hijab",
    aliases: ["hjb"],
    version: "1.0",
    author: "Farhan",
    countDown: 5,
    role: 0,
    shortDescription: "Generate hijab AI image",
    longDescription: "Use the AI API to create a custom hijab image from given image URL.",
    category: "fun",
    guide: {
      en: "{pn} <image_url>"
    }
  },

  onStart: async function ({ api, event, args, message }) {
    const url = args[0];
    if (!url) {
      return message.reply("⚠️ Please provide an image URL.\nExample: hijab https://example.com/photo.jpg");
    }

    const apiUrl = `https://hridoy-apis.vercel.app/ai-image/custom?url=${encodeURIComponent(url)}&apikey=hridoyXQC`;

    try {
      const response = await axios({
        url: apiUrl,
        method: "GET",
        responseType: "arraybuffer"
      });

      const imgPath = path.join(__dirname, "cache", `hijab_${Date.now()}.jpg`);
      fs.writeFileSync(imgPath, response.data);

      return message.reply({
        body: "✨ Here’s your AI Hijab image!",
        attachment: fs.createReadStream(imgPath)
      }, () => {
        fs.unlinkSync(imgPath);
      });
    } catch (error) {
      console.error(error);
      return message.reply("❌ Failed to generate hijab image. Please try again.");
    }
  }
};
