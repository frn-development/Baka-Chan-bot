const fs = require("fs");
const path = require("path");
const axios = require("axios");

const CACHE_DIR = path.join(__dirname, "cache");
if (!fs.existsSync(CACHE_DIR)) fs.mkdirSync(CACHE_DIR);

const AI_MODELS = ["Fantasy", "Flux Beta", "Flux V3", "Pollinations", "Weigen"];
const API_URL = "https://aima-zero.vercel.app/api";

module.exports = {
  config: {
    name: "ai",
    version: "2.0",
    author: "Farhan & Hridoy",
    countDown: 8,
    prefix: true,
    groupAdminOnly: false,
    description: "Generate AI images from text using aima-zero API",
    category: "media",
    commands: ["gen", "imagine", "create"],
    guide: {
      en: "{pn} <prompt> | Example: {pn} a futuristic city at sunset"
    }
  },

  langs: {
    vi: {
      missingPrompt: "Vui lòng nhập mô tả cho ảnh bạn muốn tạo",
      error: "Đã xảy ra lỗi khi tạo hình ảnh",
      processing: "Đang tạo hình ảnh cho bạn..."
    },
    en: {
      missingPrompt: "Please provide a prompt to generate the image",
      error: "An error occurred while generating the image",
      processing: "Generating your image 🎨"
    }
  },

  onStart: async ({ api, event, args, getLang }) => {
    if (!args[0]) return api.sendMessage(getLang("missingPrompt"), event.threadID);

    const prompt = args.join(" ");
    const imagePath = path.join(CACHE_DIR, `gen_${event.senderID}_${Date.now()}.png`);
    let msgSend;

    try {
      // Notify user
      msgSend = await api.sendMessage(getLang("processing"), event.threadID);

      // Call AI API
      const response = await axios.get(`${API_URL}?prompt=${encodeURIComponent(prompt)}`, { responseType: "json" });

      if (!response.data?.status || !response.data?.result) {
        await api.sendMessage(getLang("error"), event.threadID);
        if (msgSend) await api.unsendMessage(msgSend.messageID);
        return;
      }

      // Download the generated image
      const imageResponse = await axios.get(response.data.result, { responseType: "arraybuffer" });
      fs.writeFileSync(imagePath, Buffer.from(imageResponse.data, "binary"));

      // Send the image
      await api.sendMessage(
        {
          body: `✨ Image generated for prompt: "${prompt}"\n🌐 Model: ${response.data.model || "Unknown"}\n💡 Available Models: ${AI_MODELS.join(", ")}`,
          attachment: fs.createReadStream(imagePath)
        },
        event.threadID
      );

      // Cleanup
      if (msgSend) await api.unsendMessage(msgSend.messageID);
      fs.unlinkSync(imagePath);

    } catch (error) {
      console.error("Error generating AI image:", error);
      await api.sendMessage(getLang("error"), event.threadID);
      if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
      if (msgSend) await api.unsendMessage(msgSend.messageID);
    }
  }
};
