const fs = require('fs');
const path = require('path');
const axios = require('axios');

module.exports = {
    config: {
        name: 'blur',
        version: '1.0',
        author: 'Farhan',
        countDown: 10,
        prefix: true,
        groupAdminOnly: false,
        description: 'Blur an image by replying or mentioning a user.',
        category: 'image',
        guide: {
            en: '   {pn} [reply to image/@mention|uid|reply]'
        },
    },

    onStart: async ({ api, event }) => {
        const { senderID, mentions, messageReply } = event;
        let targetImage = null;

        // If user replies to an image
        if (messageReply && messageReply.attachments && messageReply.attachments[0]?.url) {
            targetImage = messageReply.attachments[0].url;
        }
        // If mention -> fetch FB avatar
        else if (Object.keys(mentions).length > 0) {
            const targetID = Object.keys(mentions)[0];
            targetImage = `https://graph.facebook.com/${targetID}/picture?width=512&height=512&access_token=6628568379|c1e620fa708a1d5696fb991c1bde5662`;
        }
        // Fallback: user’s own avatar
        else {
            targetImage = `https://graph.facebook.com/${senderID}/picture?width=512&height=512&access_token=6628568379|c1e620fa708a1d5696fb991c1bde5662`;
        }

        const apiUrl = `https://sus-apis.onrender.com/api/blur?image=${encodeURIComponent(targetImage)}`;

        try {
            console.log(`[API Request] Sending to: ${apiUrl}`);
            const response = await axios.get(apiUrl, { responseType: 'arraybuffer' });
            console.log(`[API Response] Status: ${response.status}, Status Text: ${response.statusText}`);

            const cacheDir = path.join(__dirname, 'cache');
            if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);

            const imagePath = path.join(cacheDir, `blur_${Date.now()}.jpg`);
            fs.writeFileSync(imagePath, Buffer.from(response.data, 'binary'));

            api.sendMessage({
                body: "✨ Here’s your blurred image!",
                attachment: fs.createReadStream(imagePath)
            }, event.threadID, () => fs.unlinkSync(imagePath));

        } catch (error) {
            console.error("Error generating blur image:", error);
            api.sendMessage("❌ Sorry, I couldn't blur the image right now.", event.threadID);
        }
    },
};
