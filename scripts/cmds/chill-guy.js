const config = require('../../config/config.json');
const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');
const crypto = require('crypto');
const logger = require('../../includes/logger');

module.exports = {
    name: "chill-guy",
    version: "1.0.0",
    author: "frnwot",
    description: "Generate a Chill Guy meme image with your text.",
    adminOnly: false,
    commandCategory: "Fun",
    guide: "Use {pn}chill-guy <your text> to generate a Chill Guy meme image.\nExample: {pn}chill-guy I'm just a chill guy who doesn't really care about anything",
    cooldowns: 5,
    usePrefix: true,

    async execute({ api, event, args }) {
        const threadID = event.threadID;
        const messageID = event.messageID;
        const senderID = event.senderID;

        let tempPath = null;

        try {
            if (!event || !threadID || !messageID) {
                logger.error("Invalid event object in chill-guy command", { event });
                return api.sendMessage(`${config.bot.botName}: ❌ Invalid event data.`, threadID);
            }

            const text = args.join(' ').trim();
            if (!text) {
                logger.warn("No text provided in chill-guy command");
                api.setMessageReaction("❌", messageID, () => {}, true);
                return api.sendMessage(
                    `${config.bot.botName}: ❌ Please provide the text for the meme.\nExample: {pn}chill-guy I'm just a chill guy who doesn't really care about anything`,
                    threadID,
                    messageID
                );
            }

        
            const progressMsgID = await new Promise((resolve) => {
                api.sendMessage(`${config.bot.botName}: 🖼️ Generating Chill Guy image...`, threadID, (err, info) => {
                    if (err) resolve(null);
                    else resolve(info.messageID);
                });
            });

    
            const apiUrl = `https://sus-apis.onrender.com/api/chill-guy?text=${encodeURIComponent(text)}`;
            logger.info(`Calling Chill Guy meme API: ${apiUrl}`);

          
            const tempDir = path.join(__dirname, '..', '..', 'temp');
            if (!fs.existsSync(tempDir)) {
                fs.mkdirSync(tempDir, { recursive: true });
            }
            const fileName = `chillguy_${crypto.randomBytes(8).toString('hex')}.png`;
            tempPath = path.join(tempDir, fileName);


            const response = await axios.get(apiUrl, { responseType: 'stream', timeout: 20000 });
            if (!response || !response.data || response.status !== 200) {
                throw new Error("Failed to generate the Chill Guy meme image.");
            }
            const writer = fs.createWriteStream(tempPath);
            response.data.pipe(writer);

            await new Promise((resolve, reject) => {
                writer.on('finish', resolve);
                writer.on('error', reject);
            });

  
            const imgMsg = {
                body: `${config.bot.botName}: 🧊 Here is your Chill Guy meme image!`,
                attachment: fs.createReadStream(tempPath)
            };

            await new Promise((resolve, reject) => {
                api.sendMessage(imgMsg, threadID, async (err) => {
                    if (err) return reject(err);
                    api.setMessageReaction("🧊", messageID, () => {}, true);
                    if (progressMsgID) {
                        await api.unsendMessage(progressMsgID);
                    }
                    resolve();
                }, messageID);
            });

            logger.info(`Chill Guy meme image sent to ${senderID}`);
           
            if (tempPath && fs.existsSync(tempPath)) {
                fs.unlinkSync(tempPath);
            }
        } catch (err) {
            logger.error(`Error in chill-guy command: ${err.message}`, { stack: err.stack });
            api.setMessageReaction("❌", messageID, () => {}, true);
            await api.sendMessage(
                `${config.bot.botName}: ⚠️ Error: ${err.message}`,
                event.threadID,
                event.messageID
            );
            if (tempPath && fs.existsSync(tempPath)) {
                fs.unlinkSync(tempPath);
            }
        }
    }
};
