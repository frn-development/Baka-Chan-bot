const fs = require('fs');
const path = require('path');
const axios = require('axios');

module.exports = {
    config: {
        name: 'foggymoon',
        version: '1.0',
        author: 'Farhan',
        countDown: 10,
        prefix: true,
        groupAdminOnly: false,
        description: 'Apply a Foggy Moonlight effect to a user\'s avatar.',
        category: 'fun',
        guide: {
            en: '{pn}foggymoon [@mention|uid|reply]'
        },
    },

    onStart: async ({ api, event }) => {
        try {
            const { senderID, mentions, messageReply } = event;
            let targetID = senderID;

            // Determine target user
            if (mentions && Object.keys(mentions).length > 0) {
                targetID = Object.keys(mentions)[0];
            } else if (messageReply && messageReply.senderID) {
                targetID = messageReply.senderID;
            } else if (event.body.split(' ').length > 1) {
                const uid = event.body.split(' ')[1].replace(/[^0-9]/g, '');
                if (uid.length === 15 || uid.length === 16) targetID = uid;
            }

            // Get user info
            const userInfo = await api.getUserInfo(targetID);
            const name = userInfo[targetID]?.name || 'Someone';

            // Avatar URL
            const imageUrl = `https://graph.facebook.com/${targetID}/picture?width=512&height=512&access_token=6628568379|c1e620fa708a1d5696fb991c1bde5662`;

            // API URL
            const apiUrl = `https://sus-apis.onrender.com/api/foggy-moonlight?image=${encodeURIComponent(imageUrl)}`;

            console.log(`[API Request] Sending to: ${apiUrl}`);
            const response = await axios.get(apiUrl, { responseType: 'arraybuffer' });
            console.log(`[API Response] Status: ${response.status}, Status Text: ${response.statusText}`);

            // Save image temporarily
            const cacheDir = path.join(__dirname, 'cache');
            if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });

            const filePath = path.join(cacheDir, `foggymoon_${targetID}_${Date.now()}.png`);
            fs.writeFileSync(filePath, Buffer.from(response.data, 'binary'));

            // Send image
            api.sendMessage({
                body: `🌙 Foggy Moonlight effect applied to @${name}`,
                mentions: [{ tag: `@${name}`, id: targetID }],
                attachment: fs.createReadStream(filePath)
            }, event.threadID, () => fs.unlinkSync(filePath));

        } catch (err) {
            console.error("Error generating or sending foggy moonlight image:", err);
            api.sendMessage("❌ Failed to generate the Foggy Moonlight effect.", event.threadID);
        }
    },
};
