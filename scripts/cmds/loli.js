const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "loli",
    aliases: ["animegirl", "randomloli"],
    version: "2.0",
    author: "Farhan & Hridoy",
    countDown: 10,
    role: 0,
    shortDescription: "Get a random loli image",
    longDescription: "Fetches and sends a random loli image from the API.",
    category: "random",
    guide: "{pn}"
  },

  onStart: async function ({ message }) {
    try {
      const apiUrl = "https://hridoy-apis.vercel.app/random/loli?apikey=hridoyXQC";
      console.log(`[API Request] Sending to: ${apiUrl}`);

      const response = await axios.get(apiUrl, { responseType: "arraybuffer" });
      console.log(`[API Response] Status: ${response.status}, Status Text: ${response.statusText}`);

      if (response.status !== 200 || !response.data || response.data.byteLength < 1000) {
        throw new Error("Invalid image response from API");
      }

      const cacheDir = path.join(__dirname, "cache");
      await fs.ensureDir(cacheDir);
      const imgPath = path.join(cacheDir, `loli_${Date.now()}.png`);
      await fs.writeFile(imgPath, Buffer.from(response.data));

      await message.reply({
        body: "🖼️ Random Loli Image",
        attachment: fs.createReadStream(imgPath)
      });

      await fs.unlink(imgPath);
    } catch (error) {
      console.error("Error in loli command:", error);
      message.reply("❌ Failed to fetch the loli image.");
    }
  }
};
          
