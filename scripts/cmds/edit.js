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
    if (!imageUrl || !prompt) {
      return message.reply(
        `📸 𝗘𝗗𝗜𝗧•\n` +
        `━━━━━━━━━━━━━━━━━━━━━━\n` +
        `⛔️ You must provide both a prompt and an image!\n\n` +
        `✨ Example:\n` +
        `▶️ edit add cute girlfriend |\n\n` +
        `🖼️ Or reply to an image:\n` +
        `▶️ edit add cute girlfriend`
      );
    }

    imageUrl = imageUrl.replace(/\s/g, "");
    if (!/^https?:\/\//.test(imageUrl)) {
      return message.reply(
        `⚠️ Invalid image URL! Must start with http:// or https://`
      );
    }

    // Build API URL
    const apiUrl = `${global.imranapi.imran}/api/editimg?prompt=${encodeURIComponent(
      prompt
    )}&image=${encodeURIComponent(imageUrl)}`;

    // React with waiting emoji
    message.reaction("⏳", event.messageID);

    try {
      // Prepare temp cache
      const cacheDir = path.join(__dirname, "cache");
      if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);
      const tempPath = path.join(cacheDir, `edited_${event.senderID}.jpg`);

      const response = await axios({
        method: "GET",
        url: apiUrl,
        responseType: "stream"
      });

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
