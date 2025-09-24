const fs = require('fs');
const path = require('path');
const axios = require('axios');

module.exports = {
    config: {
        name: 'welcome1',
        version: '1.0',
        author: 'Farhan',
        countDown: 10,
        prefix: true,
        groupAdminOnly: false,
        description: 'Generate a high-quality Discord-style welcome banner.',
        category: 'fun',
        guide: {
            en: '{pn}welcome1 [text1] | [text2] | [memberCount] [@mention or reply]'
        },
    },

    onStart: async ({ api, event, args }) => {
        try {
            const { senderID, mentions, messageReply } = event;
            let targetID = senderID;

            // Determine target user
            if (mentions && Object.keys(mentions).length > 0) {
                targetID = Object.keys(mentions)[0];
            } else if (messageReply && messageReply.senderID) {
                targetID = messageReply.senderID;
            }

            const userInfo = await api.getUserInfo(targetID);
            const userName = encodeURIComponent(userInfo[targetID]?.name || 'Someone');

            // Parse args: text1 | text2 | memberCount
            const input = args.join(' ').split('|').map(s => s.trim());
            const text1 = encodeURIComponent(input[0] || 'New Member');
            const text2 = encodeURIComponent(input[1] || 'Welcome to our group');
            const memberCount = encodeURIComponent(input[2] || '1,234');

            const imageUrl = `https://graph.facebook.com/${targetID}/picture?width=512&height=512`;

            const apiUrl = `https://sus-apis.onrender.com/api/welcome-card-v2?image=${encodeURIComponent(imageUrl)}&name=${userName}&text1=${text1}&text2=${text2}&memberCount=${memberCount}`;

            console.log(`[API Request] Sending to: ${apiUrl}`);
            const response = await axios.get(apiUrl, { responseType: 'arraybuffer' });
            console.log(`[API Response] Status: ${response.status}, Status Text: ${response.statusText}`);

            // Save image temporarily
            const cacheDir = path.join(__dirname, 'cache');
            if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });

            const filePath = path.join(cacheDir, `welcome1_${targetID}_${Date.now()}.png`);
            fs.writeFileSync(filePath, Buffer.from(response.data, 'binary'));

            // Send image
            api.sendMessage({
                body: `🎉 Welcome Card for @${userInfo[targetID]?.name || 'Someone'}`,
                mentions: [{ tag: `@${userInfo[targetID]?.name || 'Someone'}`, id: targetID }],
                attachment: fs.createReadStream(filePath)
            }, event.threadID, () => fs.unlinkSync(filePath));

        } catch (err) {
            console.error("Error generating welcome card:", err);
            api.sendMessage("❌ Failed to generate the welcome card. Make sure the inputs are valid.", event.threadID);
        }
    },
};
          
