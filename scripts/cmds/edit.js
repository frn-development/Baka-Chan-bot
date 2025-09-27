const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "edit",
    version: "1.3",
    author: "abdus sobhan",
    countDown: 5,
    role: 0,
    shortDescription: { en: "Edit image using prompt" },
    longDescription: { en: "Reply to an image with your prompt to edit it using AI." },
    category: "AI-IMAGE",
    guide: { en: "{p}edit [prompt] (reply to image)" }
  },

  onStart: async function ({ api, event, args, message }) {
    const prompt = args.join(" ");
    const repliedImage = event.messageReply?.attachments?.[0];

    if (!prompt || !repliedImage || repliedImage.type !== "photo") {
      return message.reply("⚠️ | Please reply to a photo with your prompt to edit it.");
    }

    const imgPath = path.join(__dirname, "cache", `${Date.now()}_edit.jpg`);
    const waitMsg = await message.reply(
      `⌛ Processing your request...\n🎨 Prompt: "${prompt}"\n\nPlease wait...`
    );

    try {
      const imgURL = repliedImage.url;
      const apiUrl = `https://edit-and-gen.onrender.com/gen?prompt=${encodeURIComponent(prompt)}&image=${encodeURIComponent(imgURL)}`;

      // Fetch edited image
      const res = await axios.get(apiUrl, { responseType: "arraybuffer" });

      await fs.ensureDir(path.dirname(imgPath));
      await fs.writeFile(imgPath, Buffer.from(res.data, "binary"));

      await message.reply({
        body:
`┌─❖
│ ✅ Image Edited Successfully!
│ 🎨 Prompt: ${prompt}
│ 🤖 Bot: baka-cha 
│ 👤 Author: based u
└───────────────❖`,
        attachment: fs.createReadStream(imgPath)
      });

    } catch (err) {
      console.error("EDIT Error:", err);
      message.reply("❌ | Failed to edit image. Please try again later.");
    } finally {
      await fs.remove(imgPath);
      api.unsendMessage(waitMsg.messageID);
    }
  }
};
