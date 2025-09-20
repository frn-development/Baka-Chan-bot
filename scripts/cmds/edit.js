const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "edit",
    author: "frnwot",
    category: "image",
    countDown: 5,
    role: 0,
    guide: { en: "edit <prompt> | reply to image or provide link" }
  },

  onStart: async function({ message, event, args }) {
    const prompt = args.join(" ").split("|")[0]?.trim();
    let imageUrl = event.messageReply?.attachments?.[0]?.url || null;

    // If URL provided after pipe
    if (!imageUrl && args.length > 1) {
      imageUrl = args.join(" ").split("|")[1]?.trim();
    }

    // Validate prompt and image
    if (!prompt) return message.reply("❌ Please provide a prompt!");
    if (!imageUrl) return message.reply("❌ Please reply to an image or provide a link!");

    imageUrl = imageUrl.trim();
    if (!/^https?:\/\//.test(imageUrl)) {
      return message.reply("⚠️ Invalid image URL! Must start with http:// or https://");
    }

    // Build API URL
    if (!global.imranapi?.imran) {
      return message.reply("❌ AI API is not configured. Please set global.imranapi.imran");
    }
    const apiUrl = `${global.imranapi.imran}/api/editimg?prompt=${encodeURIComponent(prompt)}&image=${encodeURIComponent(imageUrl)}`;

    // React with waiting emoji
    message.reaction("⏳", event.messageID);

    try {
      // Prepare temp cache
      const cacheDir = path.join(__dirname, "cache");
      if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);
      const tempPath = path.join(cacheDir, `edited_${event.senderID}.jpg`);

      // Fetch the edited image
      const response = await axios({
        method: "GET",
        url: apiUrl,
        responseType: "stream",
        validateStatus: status => status < 500 // Treat 4xx as errors we can handle
      });

      // Check if response is actually an image
      const contentType = response.headers["content-type"];
      if (!contentType || !contentType.startsWith("image")) {
        return message.reply("❌ Failed to generate image. API did not return an image.");
      }

      // Save image
      const writer = fs.createWriteStream(tempPath);
      response.data.pipe(writer);

      writer.on("finish", async () => {
        await message.reply({
          body: `✅ Image edited successfully!\n🔍 Prompt: "${prompt}"`,
          attachment: fs.createReadStream(tempPath)
        });
        fs.unlinkSync(tempPath); // remove temp file
      });

      writer.on("error", (err) => {
        console.error(err);
        message.reply("❌ Failed to save the image file.");
      });

    } catch (error) {
      console.error(error);
      message.reply("❌ Failed to generate image. Try again later.");
    }
  }
};
