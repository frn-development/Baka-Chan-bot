const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "edit",
    version: "1.0",
    author: "basednexo_here",
    countDown: 5,
    role: 0,
    shortDescription: { en: "Enhance or modify an image using AI" },
    longDescription: { en: "Reply to any image with a prompt and let AI transform it according to your description." },
    category: "image",
    guide: { en: "{p}edit [your description] (reply to image)" }
  },

  onStart: async function ({ api, event, args, message }) {
    const prompt = args.join(" ").trim();
    const repliedImage = event.messageReply?.attachments?.[0];

    // Validation
    if (!prompt || !repliedImage || repliedImage.type !== "photo") {
      return message.reply("⚠️ | Please reply to an image and provide a description to edit it.");
    }

    const imgPath = path.join(__dirname, "cache", `${Date.now()}_edited.jpg`);
    const waitMsg = await message.reply(`🎨 AI is processing your image with the prompt:\n"${prompt}"\nPlease wait a moment...`);

    try {
      const imgURL = repliedImage.url;
      const apiURL = `https://edit-and-gen.onrender.com/gen?prompt=${encodeURIComponent(prompt)}&image=${encodeURIComponent(imgURL)}`;

      const response = await axios.get(apiURL, { responseType: "arraybuffer" });

      await fs.ensureDir(path.dirname(imgPath));
      await fs.writeFile(imgPath, Buffer.from(response.data, "binary"));

      await message.reply({
        body: `✅ | Your image has been edited successfully!\nPrompt: "${prompt}"`,
        attachment: fs.createReadStream(imgPath)
      });

    } catch (err) {
      console.error("EDITIMG Error:", err);
      message.reply("❌ | Oops! Something went wrong while editing the image. Try again later.");
    } finally {
      await fs.remove(imgPath);
      api.unsendMessage(waitMsg.messageID);
    }
  }
};
