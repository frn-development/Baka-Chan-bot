const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports.config = {
  name: "edit",
  version: "1.1",
  permission: 0,
  credits: "Khan Rahul RK",
  description: "AI image editing using a prompt + image or attachment",
  prefix: true,
  category: "image",
  usages: "editimg [prompt] + reply image or link",
  cooldowns: 5,
  dependencies: { axios: "" }
};

module.exports.run = async ({ api, event, args }) => {
  try {
    // Get attachment from reply or link
    let imageUrl = event.messageReply?.attachments?.[0]?.url || null;
    const prompt = args.join(" ").split("|")[0]?.trim();

    // If URL provided after pipe
    if (!imageUrl && args.length > 1) {
      imageUrl = args.join(" ").split("|")[1]?.trim();
    }

    // Check if both prompt and image are provided
    if (!imageUrl || !prompt) {
      return api.sendMessage(
        `📸 𝗘𝗗𝗜𝗧•\n` +
        `━━━━━━━━━━━━━━━━━━━━━━\n` +
        `⛔️ You must provide both a prompt and an image!\n\n` +
        `✨ Example:\n` +
        `▶️ edit your prompt|\n\n` +
        `🖼️ Or reply to an image:\n` +
        `▶️ edit add what you want,
        event.threadID,
        event.messageID
      );
    }

    imageUrl = imageUrl.replace(/\s/g, "");
    if (!/^https?:\/\//.test(imageUrl)) {
      return api.sendMessage(
        `⚠️ Invalid image URL!\n🔗 Must start with http:// or https://`,
        event.threadID,
        event.messageID
      );
    }

    // Build API URL
    const apiUrl = `${global.imranapi.imran}/api/editimg?prompt=${encodeURIComponent(
      prompt
    )}&image=${encodeURIComponent(imageUrl)}`;

    // Send waiting message
    const waitMsg = await api.sendMessage("⏳ Please wait, editing image...", event.threadID);

    // Prepare temporary file path
    const cacheDir = path.join(__dirname, "cache");
    if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);
    const tempPath = path.join(cacheDir, `edited_${event.senderID}.jpg`);

    // Fetch edited image
    const response = await axios({
      method: "GET",
      url: apiUrl,
      responseType: "stream"
    });

    const writer = fs.createWriteStream(tempPath);
    response.data.pipe(writer);

    writer.on("finish", () => {
      api.sendMessage(
        {
          body: `🔍 Prompt: "${prompt}"\n🖼️ AI image is ready! ✨`,
          attachment: fs.createReadStream(tempPath)
        },
        event.threadID,
        () => {
          fs.unlinkSync(tempPath); // delete temp file
          api.unsendMessage(waitMsg.messageID); // remove waiting message
        },
        event.messageID
      );
    });

    writer.on("error", (err) => {
      console.error(err);
      api.sendMessage(
        "❌ Failed to save the image file.",
        event.threadID,
        event.messageID
      );
    });
  } catch (error) {
    console.error(error);
    api.sendMessage(
      "❌ Failed to generate image. Please try again later.",
      event.threadID,
      event.messageID
    );
  }
};
