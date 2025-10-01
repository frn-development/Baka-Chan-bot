const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "edt",
    aliases: ["edit1", "imageedit", "aiEdit"],
    version: "1.2",
    author: "Farhan",
    countDown: 5,
    role: 0,
    shortDescription: { en: "Edit an image using a prompt" },
    longDescription: { en: "Reply to an image with your prompt to edit it using AI." },
    category: "AI-IMAGE",
    guide: { en: "{p}edt [prompt] (reply to image)" }
  },

  onStart: async function ({ api, event, args, message }) {
    const prompt = args.join(" ");
    const repliedImage = event.messageReply?.attachments?.[0];

    if (!prompt || !repliedImage || repliedImage.type !== "photo") {
      return message.reply(
`⚠️ | Please reply to a photo with your prompt.
Example: 
edt make it anime style`
      );
    }

    const imgPath = path.join(__dirname, "cache", `${Date.now()}_edt.jpg`);
    const waitMsg = await message.reply(
`┌─❖
│ ⌛ Processing Image...
│ 🎨 Prompt: "${prompt}"
│ 🔹 Please wait while 𝗕𝗮𝗸𝗮-𝗖𝗵𝗮𝗻 works its magic!
└───────────────❖`
    );

    try {
      const imgURL = repliedImage.url;
      const apiUrl = `https://edit-and-gen.onrender.com/gen?prompt=${encodeURIComponent(prompt)}&image=${encodeURIComponent(imgURL)}`;

      const res = await axios.get(apiUrl, { responseType: "arraybuffer" });

      await fs.ensureDir(path.dirname(imgPath));
      await fs.writeFile(imgPath, Buffer.from(res.data, "binary"));

      await message.reply({
        body:
`┌─❖
│ ✅ Image Edited Successfully!
│ 🎨 Prompt: ${prompt}
│ ✨ Enjoy your AI-edited image!
│ 🤖 Bot: 𝗕𝗮𝗸𝗮-𝗖𝗵𝗮𝗻
└───────────────❖`,
        attachment: fs.createReadStream(imgPath)
      });

    } catch (err) {
      console.error("EDT Error:", err);
      message.reply(
`┌─❖
│ ❌ Failed to edit image
│ ⚠️ Something went wrong with the API
│ 🤖 Bot: 𝗕𝗮𝗸𝗮-𝗖𝗵𝗮𝗻
└───────────────❖`
      );
    } finally {
      await fs.remove(imgPath);
      try { await api.unsendMessage(waitMsg.messageID); } catch(e) {}
    }
  }
};
