const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "remini",
    version: "1.0",
    author: "Farhan",
    countDown: 10,
    role: 0,
    shortDescription: { en: "Enhance image using Remini API" },
    longDescription: { en: "Enhance a given image or replied image using Remini API" },
    category: "ai",
    guide: { en: "{pn} [reply to an image] or {pn} <image_url>" }
  },

  onStart: async function ({ message, args, event }) {
    try {
      let imageUrl;

      // Case 1: user replies to a photo
      if (event.type === "message_reply" && event.messageReply?.attachments?.[0]?.url) {
        imageUrl = event.messageReply.attachments[0].url;
      } 
      // Case 2: user passes an image link as arg
      else if (args[0]) {
        imageUrl = args[0];
      }

      if (!imageUrl) {
        return message.reply("⚠️ Please reply to an image or provide an image URL.");
      }

      // Build API URL
      const apiKey = "hridoyXQC";
      const apiUrl = `https://hridoy-apis.vercel.app/tools/remini?url=${encodeURIComponent(imageUrl)}&apikey=${apiKey}`;

      message.reply("⏳ Enhancing your image, please wait...");

      // Call the API
      const response = await axios.get(apiUrl, { responseType: "arraybuffer" });

      if (!response.data) {
        return message.reply("❌ Failed to enhance the image. Try again later.");
      }

      // Save file temporarily
      const tempPath = path.join(__dirname, "cache", `remini_${Date.now()}.jpg`);
      fs.writeFileSync(tempPath, response.data);

      // Send enhanced image
      await message.reply({
        body: "✨ Here’s your enhanced image!",
        attachment: fs.createReadStream(tempPath)
      });

      // Clean up
      fs.unlinkSync(tempPath);

    } catch (err) {
      console.error(err);
      message.reply("❌ Error: Unable to process the image.");
    }
  }
};
          
