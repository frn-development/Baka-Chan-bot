import fs from "fs";
import path from "path";
import axios from "axios";

const config = {
  name: "avatars",
  version: "2.0",
  author: "Farhan",
  role: 0,
  countDown: 10,
  shortDescription: "Generates an anime-style avatar with text",
  longDescription: "Generates an anime-style avatar using your Messenger profile picture or a mentioned user with custom text.",
  category: "fun",
  guide: {
    en: "{p}avatars <text> [reply to photo or @mention]"
  }
};

async function onCall({ api, event, args }) {
  const { senderID, mentions, messageReply } = event;
  let targetID = senderID;
  let text = args.join(" ").trim();

  // Check if user mentioned someone
  if (mentions && Object.keys(mentions).length > 0) {
    targetID = Object.keys(mentions)[0];
    const mentionText = mentions[targetID];
    text = text.replace(mentionText, "").trim();
  }

  if (!text) return message.reply("⚠️ Please provide text for the avatar.\nUsage: avatars <text> [@mention or reply]");

  // Fetch user info for topText
  let topText = "Unknown";
  try {
    const userInfo = await api.getUserInfo(targetID);
    topText = encodeURIComponent(userInfo[targetID]?.name || "Unknown");
  } catch (e) {
    console.error("Error fetching user info:", e);
  }

  // Determine the image URL: either replied photo or user avatar
  let imageUrl;
  if (messageReply && messageReply.attachments?.length > 0) {
    const attachment = messageReply.attachments[0];
    if (attachment.type === "photo") imageUrl = attachment.url || attachment.previewUrl || attachment.mediaUrl;
  }

  // Fallback: use Facebook profile picture
  if (!imageUrl) {
    imageUrl = `https://graph.facebook.com/${targetID}/picture?width=500&height=500&access_token=6628568379|c1e620fa708a1d5696fb991c1bde5662`;
  }

  const waitMsg = await message.reply("🎨 Generating your anime avatar, please wait...");

  try {
    const apiUrl = `https://sus-apis.onrender.com/api/anime-text?text=${encodeURIComponent(text)}&topText=${topText}&url=${encodeURIComponent(imageUrl)}`;
    const response = await axios.get(apiUrl, { responseType: "arraybuffer" });

    // Save image temporarily
    const cacheDir = path.join(__dirname, "cache");
    if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);

    const filePath = path.join(cacheDir, `avatar_${targetID}_${Date.now()}.png`);
    fs.writeFileSync(filePath, Buffer.from(response.data, "binary"));

    // Send avatar
    await message.reply({
      body: "🖼️ Here’s your anime avatar!",
      attachment: fs.createReadStream(filePath)
    });

    fs.unlinkSync(filePath); // cleanup
  } catch (err) {
    console.error("Error generating avatar:", err);
    message.reply("❌ Failed to generate the avatar image. Make sure the URL or replied photo is valid.");
  } finally {
    if (waitMsg?.messageID) message.unsend(waitMsg.messageID);
  }
}

export default {
  config,
  onCall
};
    
