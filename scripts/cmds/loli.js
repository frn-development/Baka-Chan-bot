import axios from "axios";
import fs from "fs-extra";
import path from "path";

const config = {
  name: "loli",
  aliases: ["animegirl", "randomloli"],
  version: "2.2",
  author: "Farhan & Hridoy",
  role: 0,
  countDown: 10,
  shortDescription: "Get a random loli image",
  longDescription: "Fetches and sends a random loli image from the new API.",
  category: "random",
  guide: "{p}loli"
};

async function onCall({ message }) {
  try {
    const apiUrl = "https://sus-apis.onrender.com/api/loli";
    console.log(`[API Request] Sending to: ${apiUrl}`);

    const response = await axios.get(apiUrl, { responseType: "arraybuffer" });
    console.log(`[API Response] Status: ${response.status}, Status Text: ${response.statusText}`);

    if (response.status !== 200 || !response.data || response.data.byteLength < 1000) {
      throw new Error("Invalid image response from API");
    }

    // Ensure cache directory exists
    const cacheDir = path.join(__dirname, "cache");
    await fs.ensureDir(cacheDir);

    // Save image temporarily
    const imgPath = path.join(cacheDir, `loli_${Date.now()}.png`);
    await fs.writeFile(imgPath, Buffer.from(response.data));

    // Send image
    await message.reply({
      body: "🖼️ Random Loli Image",
      attachment: fs.createReadStream(imgPath)
    });

    // Cleanup
    await fs.unlink(imgPath);

  } catch (error) {
    console.error("Error in loli command:", error);
    message.reply("❌ Failed to fetch the loli image.");
  }
}

export default {
  config,
  onCall
};
