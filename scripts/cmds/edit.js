const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "edit",
    aliases: [],
    version: "1.0.1",
    permission: 0,
    author: "frnwot",
    description: "AI image editing using prompt + image or attachment",
    guide: "[message]",
    prefix: true,
    category: "image",
    role: 0,
    usages: "edit <prompt> | reply image or link",
    cooldowns: 5,
    dependencies: { axios: "" }
  },

  onStart: async ({ api, event, args }) => {
    let imageUrl = event.messageReply?.attachments?.[0]?.url || null;
    const prompt = args.join(" ").split("|")[0]?.trim();

    // URL after pipe
    if (!imageUrl && args.length > 1) {
      imageUrl = args.join(" ").split("|")[1]?.trim();
    }

    if (!imageUrl || !prompt) {
      return api.sendMessage(
        `📸 𝗘𝗗𝗜𝗧•\n━━━━━━━━━━━━━━━━━━━━━━\n` +
        `⛔️ You must provide both a prompt and an image!\n\n` +
        `✨ Example:\n▶️ edit add cute girlfriend |\n\n` +
        `🖼️ Or reply to an image:\n▶️ edit add cute girlfriend`,
        event.threadID,
        event.messageID
      );
    }

    imageUrl = imageUrl.trim();
    if (!/^https?:\/\//.test(imageUrl)) {
      return api.sendMessage(
        `⚠️ Invalid image URL! Must start with http:// or https://`,
        event.threadID,
        event.messageID
      );
    }

    if (!global.imranapi || !global.imranapi.imran) {
      return api.sendMessage(
        "❌ AI API is not configured. Please set `global.imranapi.imran`",
        event.threadID,
        event.messageID
      );
    }

    // Build API URL correctly
    const apiUrl = `${global.imranapi.imran}/api/editimg?prompt=${encodeURIComponent(prompt)}&image=${encodeURIComponent(imageUrl)}`;

    const waitMsg = await api.sendMessage("⏳ Please wait, editing image...", event.threadID);

    try {
      const cacheDir = path.join(__dirname, "cache");
      if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);
      const tempPath = path.join(cacheDir, `edited_${event.senderID}.jpg`);

      const response = await axios.get(apiUrl, { responseType: "stream" });
      const writer = fs.createWriteStream(tempPath);
      response.data.pipe(writer);

      writer.on("finish", async () => {
        await api.sendMessage(
          {
            body: `✅ Image edited successfully!\n🔍 Prompt: "${prompt}"\n\n@Meta AI`,
            attachment: fs.createReadStream(tempPath)
          },
          event.threadID,
          () => {
            fs.unlinkSync(tempPath);
            api.unsendMessage(waitMsg.messageID);
          },
          event.messageID
        );
      });

      writer.on("error", (err) => {
        console.error(err);
        api.sendMessage("❌ Failed to save the image file.", event.threadID, event.messageID);
      });

    } catch (error) {
      console.error(error);
      api.sendMessage(`❌ Failed to generate image. Error: ${error.message}`, event.threadID, event.messageID);
    }
  }
};
