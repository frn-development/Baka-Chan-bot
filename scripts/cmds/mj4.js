const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

async function downloadImage(url, filePath) {
  const resp = await axios.get(url, { responseType: "arraybuffer" });
  await fs.writeFile(filePath, resp.data);
}

module.exports = {
  config: {
    name: "mj4",
    aliases: ["mj-4", "mj4cmd"],
    version: "1.0",
    author: "Farhan",
    role: 0,
    shortDescription: "Generate image via mj-4 API",
    category: "IMAGE",
    guide: "{pn} <prompt> — e.g. mj4 a futuristic city skyline"
  },

  onStart: async function ({ api, event, args }) {
    const prompt = args.join(" ").trim();
    if (!prompt) {
      return api.sendMessage(
        "❌ Please provide a prompt.\nExample: mj4 a beautiful sunset over mountains",
        event.threadID,
        event.messageID
      );
    }

    const waitMsg = await api.sendMessage("🎨 Generating image via mj-4…", event.threadID, event.messageID);

    try {
      const resp = await axios.get("https://dev.oculux.xyz/api/mj-4", {
        params: { prompt },
        timeout: 60000
      });

      const data = resp.data;

      // **Adjust this part based on the actual JSON response**
      // Common keys might be: data.url, data.image_url, data.result, data.output, data.images[0]
      let imgUrl = data.image_url || data.url || data.result || data.output;
      if (!imgUrl && Array.isArray(data.images) && data.images.length > 0) {
        imgUrl = data.images[0];
      }

      if (!imgUrl) {
        return api.sendMessage(
          "❌ Failed: no image URL found in mj-4 API response",
          event.threadID,
          waitMsg.messageID
        );
      }

      const fileName = `mj4_${Date.now()}.jpg`;
      const dir = path.join(__dirname, "cache");
      await fs.ensureDir(dir);
      const filePath = path.join(dir, fileName);

      await downloadImage(imgUrl, filePath);

      api.sendMessage(
        { body: "✅ Done!", attachment: fs.createReadStream(filePath) },
        event.threadID,
        () => {
          if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        },
        waitMsg.messageID
      );
    } catch (err) {
      console.error("mj-4 API error:", err.response?.data || err.message);
      api.sendMessage("❌ Error generating image via mj-4 API", event.threadID, waitMsg.messageID);
    }
  }
};
