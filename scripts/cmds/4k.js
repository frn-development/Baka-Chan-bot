const fs = require('fs');
const path = require('path');
const axios = require('axios');

module.exports = {
    config: {
        name: '4k',
        version: '1.1',
        role: 0,
        author: "frnwot",
        countDown: 5,
        prefix: true,
        groupAdminOnly: false,
        description: 'Enhances image quality to 4K resolution. Reply to an image to enhance it.',
        category: 'image',
        guide: {
            en: '   {pn}4k [reply to an image] or {pn}4k [/@mention|uid]'
        },
    },
    onStart: async ({ api, event }) => {
        const { senderID, mentions, messageReply } = event;
        let imageUrl;
        let targetIDForFilename = senderID;

        if (messageReply && messageReply.attachments && messageReply.attachments.length > 0 && ['photo', 'sticker'].includes(messageReply.attachments[0].type)) {
            imageUrl = messageReply.attachments[0].url;
            targetIDForFilename = messageReply.senderID;
        } else {
            let targetID = senderID;
            if (Object.keys(mentions).length > 0) {
                targetID = Object.keys(mentions)[0];
            } else if (event.body.split(' ').length > 1) {
                const uid = event.body.split(' ')[1].replace(/[^0-9]/g, '');
                if (uid.length === 15 || uid.length === 16) targetID = uid;
            }
            targetIDForFilename = targetID;
            imageUrl = `https://graph.facebook.com/${targetID}/picture?width=512&height=512&access_token=6628568379|c1e620fa708a1d5696fb991c1bde5662`;
        }

        if (!imageUrl) {
            return api.sendMessage("Please reply to an image or mention a user to enhance their profile picture.", event.threadID);
        }

        const apiUrl = `https://hridoy-apis.vercel.app/tools/remini?url=${encodeURIComponent(imageUrl)}&apikey=hridoyXQC`;

        try {
            api.sendMessage("✅ | Enhancing image to 4K, please wait...", event.threadID);
            console.log(`[API Request] Sending to: ${apiUrl}`);
            const response = await axios.get(apiUrl);
            console.log(`[API Response] Status: ${response.status}, Status Text: ${response.statusText}`);

            if (response.data && response.data.status && response.data.result) {
                const enhancedImageResponse = await axios.get(response.data.result, { responseType: 'arraybuffer' });
                
                const cacheDir = path.join(__dirname, 'cache');
                if (!fs.existsSync(cacheDir)) {
                    fs.mkdirSync(cacheDir);
                }
                const imagePath = path.join(cacheDir, `4k_${targetIDForFilename}_${Date.now()}.png`);
                fs.writeFileSync(imagePath, Buffer.from(enhancedImageResponse.data, 'binary'));

                api.sendMessage({
                    attachment: fs.createReadStream(imagePath)
                }, event.threadID, () => fs.unlinkSync(imagePath));
            } else {
                api.sendMessage("Failed to enhance the image. The API may be down or the image format is not supported.", event.threadID);
            }

        } catch (error) {
            console.error("Error generating or sending 4K image:", error);
            api.sendMessage("Sorry, an error occurred while processing the image. Please try again later.", event.threadID);
        }
    }
};
