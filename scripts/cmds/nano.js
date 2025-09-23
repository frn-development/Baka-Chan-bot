const fs = require('fs');
const path = require('path');
const axios = require('axios');

module.exports = {
    config: {
        name: 'nano',
        version: '1.1',
        author: 'Farhan',
        countDown: 10,
        prefix: true,
        groupAdminOnly: false,
        description: 'Edit or enhance any photo using Gemini Nano Banana API.',
        category: 'fun',
        guide: {
            en: '{pn}nano [prompt] | reply to an image or provide image URL'
        },
    },
    onStart: async ({ api, event, args }) => {
        const { senderID, messageReply } = event;
        let imageUrl = null;
        const prompt = args.join(" ");

        // 1️⃣ Case: Reply to a Messenger image
        if (messageReply && messageReply.attachments?.[0]?.url) {
            imageUrl = messageReply.attachments[0].url;
        }

        // 2️⃣ Case: Direct image URL in command
        else if (args.length > 0 && args[0].startsWith("http")) {
            imageUrl = args[0];
        }

        if (!imageUrl) return api.sendMessage('❌ | Reply to an image or provide an image URL', event.threadID);
        if (!prompt) return api.sendMessage('❌ | Provide a prompt', event.threadID);

        const cacheDir = path.join(__dirname, 'cache');
        if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);

        const imagePath = path.join(cacheDir, `nano_${senderID}_${Date.now()}.png`);
        api.sendMessage('⏳ | Processing your image...', event.threadID);

        try {
            // Call Gemini Nano Banana API
            const apiUrl = `https://nexalo-api.vercel.app/api/ai-canvas?url=${encodeURIComponent(imageUrl)}&prompt=${encodeURIComponent(prompt)}`;
            const res = await axios.get(apiUrl);

            const editedImageUrl = res.data?.data?.imageResponseVo?.urls?.[0];
            if (!editedImageUrl) return api.sendMessage('❌ | Nano API returned invalid data. Try again later.', event.threadID);

            // Download edited image
            const imageResponse = await axios.get(editedImageUrl, { responseType: 'arraybuffer' });
            fs.writeFileSync(imagePath, Buffer.from(imageResponse.data, 'binary'));

            // Send back edited image
            await api.sendMessage({
                body: `✅ | Edited image ready! 🍌✨`,
                attachment: fs.createReadStream(imagePath)
            }, event.threadID, () => fs.unlinkSync(imagePath));

        } catch (error) {
            console.error('Nano API error:', error.message || error);
            api.sendMessage('❌ | Failed to process image. Try again later.', event.threadID);
        }
    },
};
