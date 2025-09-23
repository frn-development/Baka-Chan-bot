const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "aigen",
    version: "1.1",
    author: "Farhan",
    countDown: 10,
    role: 0,
    shortDescription: "Generate AI images from multiple free models",
    longDescription: "Generate AI images using free models: Weigen, Pollinations, Flux V3, Flux Beta, and Fantasy",
    category: "ai",
    guide: {
      en: `
{pn} <model> <prompt>
⚡ Generate an AI image using one of the free models.

📌 Available Models:
- weigen
- pollinations
- flux-v3
- flux-beta
- fantasy

🖼 Example Usage:
{pn} flux-v3 a cyberpunk samurai in neon city
{pn} fantasy dragon flying over a castle
{pn} pollinations cute cat astronaut in space
{pn} flux-beta realistic portrait of a hacker
{pn} weigen anime girl under cherry blossoms`
    }
  },

  onStart: async function ({ message, args }) {
    if (args.length < 2) {
      return message.reply("⚠️ Usage: aigen <model> <prompt>\nType 'help aigen' for more info.");
    }

    const model = args[0].toLowerCase();
    const prompt = args.slice(1).join(" ");
    const baseURL = "https://aima-zero.vercel.app/api";

    const endpoints = {
      "weigen": "/weigen",
      "pollinations": "/pollinations",
      "flux-v3": "/flux-v3",
      "flux-beta": "/flux-beta",
      "fantasy": "/fantasy"
    };

    if (!endpoints[model]) {
      return message.reply("❌ Invalid model. Type 'help aigen' to see valid models.");
    }

    try {
      const url = `${baseURL}${endpoints[model]}?prompt=${encodeURIComponent(prompt)}`;

      message.reply("🎨 Generating your image, please wait...");

      const response = await axios.get(url, { responseType: "arraybuffer" });
      const imgPath = path.join(__dirname, "cache", `aigen_${Date.now()}.png`);
      fs.writeFileSync(imgPath, response.data);

      await message.reply({
        body: `✅ Generated with **${model}**\n📝 Prompt: ${prompt}`,
        attachment: fs.createReadStream(imgPath)
      });

      fs.unlinkSync(imgPath);
    } catch (err) {
      console.error(err);
      return message.reply("❌ Failed to generate image. Please try again later.");
    }
  }
};
