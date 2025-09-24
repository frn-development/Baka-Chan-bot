const fs = require("fs");
const path = require("path");
const axios = require("axios");

module.exports = {
    config: {
        name: "bna",
        version: "1.0",
        author: "Farhan",
        countDown: 10,
        role: 0,
        shortDescription: "AI image editor 🍌",
        longDescription: "Edit any image with AI using Gemini Nano Banana API 🍌✨",
        category: "fan",
        guide: {
            en: "{pn} [prompt] + reply with image or use image URL"
        }
    },

    onStart: async function ({ message, event, args }) {
        const prompt = args.join(" ");
        if (!prompt) return message.reply("⚠️ Please provide a prompt.\nExample: !banana make it cyberpunk");

        let imageUrl;

        // Case 1: User replied to a message with an image
        if (event.messageReply && event.messageReply.attachments && event.messageReply.attachments[0]) {
            const attachment = event.messageReply.attachments[0];
            if (attachment.type === "photo") {
                imageUrl = attachment.url;
            }
        }

        // Case 2: User gave an image URL in args
        if (!imageUrl) {
            const urlMatch = prompt.match(/https?:\/\/\S+/);
            if (urlMatch) {
                imageUrl = urlMatch[0];
            }
        }

        if (!imageUrl) return message.reply("⚠️ Please reply to an image or provide an image URL.");

        const finalPrompt = prompt.replace(imageUrl, "").trim();
        const apiUrl = `https://nexalo-api.vercel.app/api/ai-canvas?url=${encodeURIComponent(imageUrl)}&prompt=${encodeURIComponent(finalPrompt)}`;

        message.reply("🍌✨ Editing your image... please wait!");

        try {
            const res = await axios.get(apiUrl, { responseType: "arraybuffer" });
            const imgPath = path.join(__dirname, "cache", `banana_${Date.now()}.png`);
            fs.writeFileSync(imgPath, Buffer.from(res.data, "binary"));

            await message.reply({
                body: `🍌 Done!\n🎨 Prompt: ${finalPrompt}`,
                attachment: fs.createReadStream(imgPath)
            });

            fs.unlinkSync(imgPath);
        } catch (e) {
            console.error(e);
            message.reply("❌ Failed to edit image. Try again later.");
        }
    }
};
            
