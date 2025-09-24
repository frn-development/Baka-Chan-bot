const fs = require('fs');
const path = require('path');
const axios = require('axios');

module.exports = {
    config: {
        name: 'avatars',
        version: '2.0',
        author: 'Farhan',
        countDown: 10,
        prefix: true,
        groupAdminOnly: false,
        description: 'Generates an anime-style avatar with custom text.',
        category: 'fun',
        guide: {
            en: '{pn}avatars <text> [reply to photo or @mention]'
        },
    },

    onStart: async ({ api, event, args, message }) => {
        try {
            const { senderID, mentions, messageReply } = event;
            let targetID = senderID;
            let text = args.join(" ").trim();

            // If user mentioned someone, set targetID and remove mention from text
            if (mentions && Object.keys(mentions).length > 0) {
                targetID = Object.keys(mentions)[0];
                const mentionText = mentions[targetID];
                text = text.replace(mentionText, "").trim();
            }

            if (!text) {
                return message.reply("⚠️ Please provide text for the avatar.\nUsage: avatars <text> [@mention or reply]");
            }

            // Fetch user name for topText
            let topText = "Unknown";
            try {
                const userInfo = await api.getUserInfo(targetID);
                topText = encodeURIComponent(userInfo[targetID]?.name || "Unknown");
            } catch (e) {
                console.error("Error fetching user info:", e);
            }

            // Determine image URL: reply photo > user avatar
            let imageUrl;
            if (messageReply && messageReply.attachments?.length > 0) {
                const attachment = messageReply.attachments[0];
                if (attachment.type === "photo") {
                    imageUrl = attachment.url || attachment.previewUrl || attachment.mediaUrl;
                }
            }

            if (!imageUrl) {
                imageUrl = `https://graph.facebook.com/${targetID}/picture?width=512&height=512&access_token=6628568379|c1e620fa708a1d5696fb991c1bde5662`;
            }

            const apiUrl = `https://sus-apis.onrender.com/api/anime-text?text=${encodeURIComponent(text)}&topText=${topText}&url=${encodeURIComponent(imageUrl)}`;

            console.log(`[API Request] Sending to: ${apiUrl}`);
            const response = await axios.get(apiUrl, { responseType: 'arraybuffer' });
            console.log(`[API Response] Status: ${response.status}, Status Text: ${response.statusText}`);

            // Save image temporarily
            const cacheDir = path.join(__dirname, 'cache');
            if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });

            const filePath = path.join(cacheDir, `avatar_${targetID}_${Date.now()}.png`);
            fs.writeFileSync(filePath, Buffer.from(response.data, 'binary'));

            // Send the avatar
            api.sendMessage({
                body: "🖼️ Here’s your anime avatar!",
                attachment: fs.createReadStream(filePath)
            }, event.threadID, () => fs.unlinkSync(filePath));

        } catch (err) {
            console.error("Error generating anime avatar:", err);
            api.sendMessage("❌ Failed to generate the avatar. Make sure the replied photo or mentioned user is valid.", event.threadID);
        }
    },
};
