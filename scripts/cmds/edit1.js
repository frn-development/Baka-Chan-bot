const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
  name: "edit",
  aliases: ["edit1", "imageedit", "aiEdit"],
  Auth: 0,
  Owner: "farhan",
  Info: "🎨 Edit an image using a prompt",
  Class: "media",
  How: "edit <prompt> (reply to an image)"
};

module.exports.onType = async function ({ event, args, sh }) {
  try {
    const prompt = args.join(" ");
    const repliedImage = event.messageReply?.attachments?.[0];

    if (!prompt || !repliedImage || repliedImage.type !== "photo") {
      return sh.reply("⚠️ You must reply to an image and provide a prompt.\nExample: edit Make it anime style");
    }

    const imgPath = path.join(__dirname, "cache", `${Date.now()}_edit.jpg`);
    await sh.reply(`⌛ Editing your image...\n🎨 Prompt: "${prompt}"`);

    try {
      const imgURL = repliedImage.url;
      const apiUrl = `https://edit-and-gen.onrender.com/gen?prompt=${encodeURIComponent(prompt)}&image=${encodeURIComponent(imgURL)}`;

      // Download edited image
      const res = await axios.get(apiUrl, { responseType: "arraybuffer" });
      await fs.ensureDir(path.dirname(imgPath));
      await fs.writeFile(imgPath, Buffer.from(res.data, "binary"));

      // Send result
      await sh.reply({
        body: `┌─❖
│ ✅ Image edited successfully!
│ 🎨 Prompt: ${prompt}
│ 🤖 Bot: baka-chan
└───────────────❖`,
        attachment: fs.createReadStream(imgPath)
      });

    } catch (err) {
      console.error("edit1 error:", err.message);
      await sh.reply("❌ Failed to edit the image. Please try again.");
    } finally {
      await fs.remove(imgPath);
    }

  } catch (err) {
    console.error("edit1 onType error:", err.message);
    await sh.reply("⚠️ An unexpected error occurred.");
  }
};
