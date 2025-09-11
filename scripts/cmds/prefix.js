const config = require('../../config/config.json');
const { connect } = require('../../includes/database');

module.exports = {
    name: "prefix",
    version: "1.0.0",
    author: "frnwot",
    description: "Shows bot info and a demo video when the prefix is sent.",
    adminOnly: false,
    commandCategory: "utility",
    guide: "Send the bot's prefix (e.g., .) to see bot info and a demo video.",
    cooldowns: 5,
    usePrefix: false, 

    async execute({ api, event, args }) {
        if (!event || !event.threadID || !event.messageID) {
            console.error("Invalid event object in prefix command");
            return api.sendMessage(`${config.bot.botName}: ❌ Invalid event data.`, event.threadID);
        }

        const db = await connect();
        const usersCollection = db.collection('users');
        const totalMembers = await usersCollection.countDocuments({ ban: { $ne: true } });

        const ownerInfo = await new Promise((resolve) => api.getUserInfo(config.bot.ownerUid, (err, info) => resolve(err ? {} : info)));
        const ownerName = ownerInfo[config.bot.ownerUid]?.name || "Unknown";

        // Bot info message
        const message = [
            `╔═━─[ ${config.bot.botName} INFO ]─━═╗`,
            `┃ 🎗️ Bot Name: ${config.bot.botName}`,
            `┃ 👨‍👩‍👧‍👦 Total Members: ${totalMembers}`,
            `┃ 👑 Owner: ${ownerName}`,
            `┃ ℹ️  Prefix: ${config.bot.prefix}`,
            `╚═━──────────────────────────────━═╝`
        ].join('\n');

        // Direct video link (e.g., from Google Drive or a CDN)
        const videoUrl = "https://drive.www-hardik-live.workers.dev/0:"; // Your direct video URL

        // Send the bot info message first
        api.sendMessage(message, event.threadID, (err) => {
            if (err) {
                console.error("Failed to send bot info message:", err);
                return;
            }

            // Then send the video attachment
            global.utils.getStreamFromURL(videoUrl)
                .then(stream => {
                    api.sendMessage({
                        body: "Here's a demo video showcasing the bot:",
                        attachment: stream
                    }, event.threadID);
                })
                .catch(error => {
                    console.error("Failed to fetch video stream:", error);
                    // Fallback: Send the video URL as a link if attachment fails
                    api.sendMessage(`Here's a demo video showcasing the bot:\n${videoUrl}`, event.threadID);
                });
        });
    }
};
