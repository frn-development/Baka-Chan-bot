import axios from "axios";
import fs from "fs";
import path from "path";

const config = {
  name: "artify",
  version: "1.1",
  author: "Farhan",
  role: 0,
  countDown: 10,
  shortDescription: "Transform an image into an artistic painting",
  longDescription: "Transforms any image or replied photo into an artistic oil painting effect with enhanced colors and smooth textures.",
  category: "fun",
  guide: {
    en: "{p}artify <image_url> OR reply to a photo with {p}artify"
  }
};

async function onCall({ api, event, message, args }) {
  let imageUrl;

  // Case 1: user provides an URL
  if (args[0]) {
    imageUrl = args[0];
  } 
  // Case 2: user replies to a photo
  else if (event.messageReply && event.messageReply.attachments?.length > 0) {
    const attachment = event.messageReply.attachments[0];
    if (attachment.type === "photo") {
      imageUrl = attachment.url || attachment.previewUrl || attachment.mediaUrl;
    }
  }

  if (!imageUrl) {
    return message.reply("⚠️ Please provide an image URL or reply to a photo with this command.\nUsage: artify <image_url>");
  }

  const waitMsg = await message.reply("🎨 Transforming your image, please wait...");

  try {
    const apiUrl = `https://sus-apis.onrender.com/api/image-artify?url=${encodeURIComponent(imageUrl)}`;
    const res = await axios.get(apiUrl, { responseType: "arraybuffer" });

    // Save the transformed image temporarily
    const cacheDir = path.join(__dirname, "cache");
    if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);

    const filePath = path.join(cacheDir, `artify_${Date.now()}.png`);
    fs.writeFileSync(filePath, Buffer.from(res.data, "binary"));

    // Send image
    await message.reply({
      body: "🖼️ Here is your artistic image!",
      attachment: fs.createReadStream(filePath)
    });

    fs.unlinkSync(filePath); // cleanup

  } catch (err) {
    console.error("Error in artify command:", err);
    message.reply("❌ Failed to transform the image. Make sure the URL or replied photo is valid and try again.");
  } finally {
    if (waitMsg?.messageID) message.unsend(waitMsg.messageID);
  }
}

export default {
  config,
  onCall
};
