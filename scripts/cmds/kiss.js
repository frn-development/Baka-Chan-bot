const axios = require('axios');
const fs = require('fs');
const path = require('path');
module.exports = {
    config: {
        name: "kiss",
        aliases: [],
        author: "Farhan",
        countDown: 2,
        role: 0,
        description: "Generates a kiss image with command user and mentioned/replied user's avatars.",
        category: "fun",
        guide: {
            en: "   {pn} @username or reply to a message: Generate a kiss image with the mentioned or replied user."
        }
    },

    onStart: async ({ event, api }) => {
        try {
            const chatId = event.threadID;
            const userId = event.senderID;
            const messageId = event.messageID;

            const commandUserInfo = await api.getUserInfo(userId);
            const commandUsername = commandUserInfo[userId]?.name || 'User';
            const commandUserAvatar = `https://graph.facebook.com/${userId}/picture?width=512&height=512&access_token=6628568379|c1e620fa708a1d5696fb991c1bde5662`;

            let targetUserId;
            if (event.messageReply) {
                targetUserId = event.messageReply.senderID;
            } else if (event.mentions && Object.keys(event.mentions).length > 0) {
                targetUserId = Object.keys(event.mentions)[0];
            } else {
                return api.sendMessage('Please mention a user using @username or reply to a message.', chatId, messageId);
            }

            if (targetUserId === userId) {
                return api.sendMessage('You cannot kiss yourself!', chatId, messageId);
            }

            const targetUserInfo = await api.getUserInfo(targetUserId);
            const targetUsername = targetUserInfo[targetUserId]?.name || 'User';
            const targetUserAvatar = `https://graph.facebook.com/${targetUserId}/picture?width=512&height=512&access_token=6628568379|c1e620fa708a1d5696fb991c1bde5662`;

          
            const genderApiBase = 'https://hridoy-apis.vercel.app/tools/gender-predict';
            const [commandGenderRes, targetGenderRes] = await Promise.all([
                axios.get(`${genderApiBase}?name=${encodeURIComponent(commandUsername)}&apikey=hridoyXQC`),
                axios.get(`${genderApiBase}?name=${encodeURIComponent(targetUsername)}&apikey=hridoyXQC`)
            ]);

            const commandGender = commandGenderRes.data?.gender || 'unknown';
            const targetGender = targetGenderRes.data?.gender || 'unknown';

     
            let avatar1, avatar2;
            if (commandGender === 'female' || (commandGender === 'unknown' && targetGender === 'male')) {
                avatar1 = commandUserAvatar;
                avatar2 = targetUserAvatar;
            } else {
                avatar1 = targetUserAvatar;
                avatar2 = commandUserAvatar;
            }

            const apiUrl = `https://hridoy-apis.vercel.app/canvas/kiss?avatar1=${encodeURIComponent(avatar1)}&avatar2=${encodeURIComponent(avatar2)}&apikey=hridoyXQC`;
            const tempDir = path.join(__dirname, '..', '..', 'temp');
            const tempFilePath = path.join(tempDir, `${userId}_${Date.now()}.png`);

            if (!fs.existsSync(tempDir)) {
                fs.mkdirSync(tempDir);
            }

            try {
                const response = await axios.get(apiUrl, { responseType: 'arraybuffer' });
                if (response.status !== 200) {
                    throw new Error('Failed to generate kiss image');
                }
                fs.writeFileSync(tempFilePath, Buffer.from(response.data, 'binary'));
            } catch (err) {
                log('error', `Failed to fetch or save kiss image: ${err.message}`);
                return api.sendMessage('Could not generate the kiss image. Please try again later.', chatId, messageId);
            }

            const caption = `A kiss between ${commandUsername} and ${targetUsername} 😘`;
            try {
                api.sendMessage({
                    body: caption,
                    mentions: [
                        { tag: commandUsername, id: userId },
                        { tag: targetUsername, id: targetUserId }
                    ],
                    attachment: fs.createReadStream(tempFilePath)
                }, chatId, () => {
                    try {
                        fs.unlinkSync(tempFilePath);
                    } catch (err) {
                        log('error', `Could not delete temp file: ${err.message}`);
                    }
                });
            } catch (err) {
                log('error', `Error sending message: ${err.message}`);
                try {
                    fs.unlinkSync(tempFilePath);
                } catch (e) {}
                return api.sendMessage('Something went wrong while sending the image.', chatId, messageId);
            }

            log('info', `Kiss command executed by ${userId} in thread ${chatId} with target ${targetUserId}`);
        } catch (error) {
            log('error', `Kiss command error: ${error && error.message ? error.message : error}`);
            if (event && event.threadID)
                api.sendMessage('Something went wrong. Please try again.', event.threadID);
        }
    }
};

process.on('unhandledRejection', (reason, promise) => {
    log('error', 'Unhandled Promise Rejection: ' + (reason && reason.message ? reason.message : reason));
});
