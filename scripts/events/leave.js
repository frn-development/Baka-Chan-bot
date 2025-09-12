const config = require('../../config/config.json');
const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const logger = require('../../includes/logger');

const GRAPH_API_BASE = 'https://graph.facebook.com';
const FB_HARDCODED_TOKEN = '6628568379|c1e620fa708a1d5696fb991c1bde5662';
const GOODBYE_API_URL = 'https://nexalo-api.vercel.app/api/goodbye-card';

function getProfilePictureURL(userID, size = [512, 512]) {
    const [height, width] = size;
    return `${GRAPH_API_BASE}/${userID}/picture?width=${width}&height=${height}&access_token=${FB_HARDCODED_TOKEN}`;
}

const shortQuotes = [
    "Farewell, dear friend!",
    "Wishing you the best!",
    "Goodbye, take care!",
    "Until we meet again!",
    "Safe travels, friend!",
    "Best of luck always!",
    "See you soon, pal!",
    "Keep shining, star!"
];

module.exports = {
    name: "leave",
    async handle({ api, event }) {
        if (event.logMessageType !== "log:unsubscribe") return;

        const threadID = event.threadID;
        const leftUserID = event.logMessageData.leftParticipantFbId;

        try {
            const userInfo = await new Promise((resolve, reject) => {
                api.getUserInfo([leftUserID], (err, info) => {
                    if (err) reject(err);
                    else resolve(info);
                });
            });
            const userName = userInfo[leftUserID]?.name || "Unknown User";

            const profilePicUrl = getProfilePictureURL(leftUserID);
            const randomQuote = shortQuotes[Math.floor(Math.random() * shortQuotes.length)];
            const apiUrl = `${GOODBYE_API_URL}?image=${encodeURIComponent(profilePicUrl)}&username=${encodeURIComponent(userName)}&text=${encodeURIComponent(randomQuote)}`;

            const tempDir = path.join(__dirname, '../../temp');
            await fs.ensureDir(tempDir);
            const fileName = `goodbye_${Date.now()}_${leftUserID}.png`;
            const filePath = path.join(tempDir, fileName);

            const response = await axios.get(apiUrl, { responseType: 'arraybuffer', timeout: 10000 });
            await fs.writeFile(filePath, response.data);

            const stats = await fs.stat(filePath);
            if (stats.size === 0) throw new Error("Downloaded goodbye image is empty");

            const msg = {
                body: `${config.bot.botName}: 👋 ${userName} has left the group.`,
                attachment: fs.createReadStream(filePath)
            };

            await new Promise((resolve, reject) => {
                api.sendMessage(msg, threadID, (err) => {
                    if (err) reject(err);
                    else resolve();
                });
            });

            await fs.unlink(filePath);
            logger.info(`Sent goodbye message for ${userName} (ID: ${leftUserID}) in thread ${threadID}`);
        } catch (error) {
            logger.error(`Failed to send goodbye message in thread ${threadID}: ${error.message}`);
            api.sendMessage(`${config.bot.botName}: ⚠️ Failed to send goodbye message.`, threadID);

            const tempDir = path.join(__dirname, '../../temp');
            const fileName = `goodbye_${Date.now()}_${leftUserID}.png`;
            const filePath = path.join(tempDir, fileName);
            if (await fs.exists(filePath)) {
                await fs.unlink(filePath);
            }
        }
    }
};
