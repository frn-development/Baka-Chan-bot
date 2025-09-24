const fs = require('fs');
const path = require('path');
const axios = require('axios');

module.exports = {
    config: {
        name: 'chillguy',
        version: '1.0',
        author: 'Farhan',
        countDown: 10,
        prefix: true,
        groupAdminOnly: false,
        description: 'Generate a chill guy meme with custom text.',
        category: 'fun',
        guide: {
            en: '   {pn} [your text here]\n\nExample: {pn} I\'m just a chill guy who doesn\'t really care about anything'
        },
    },

    onStart: async ({ api, event, args }) => {
        const text = args.join(" ");
        if (!text) {
            return api.sendMessage("⚠️ Please provide some text.\nExample: chillguy I\'m just a chill guy who doesn\'t really care about anything", event.threadID);
        }

        const apiUrl = `https://sus-apis.onrender.com/api/chill-guy?text=${encodeURIComponent(text)}`;

        try {
            console.log(`[API Request] Sending to: ${apiUrl}`);
            const response = await axios.get(apiUrl, { responseType: 'arraybuffer' });
            console.log(`[API Response] Status: ${response.status}, Status Text: ${response.statusText}`);

            const cacheDir = path.join(__dirname, 'cache');
            if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);

            const imagePath = path.join(cacheDir, `chillguy_${Date.now()}.jpg`);
            fs.writeFileSync(imagePath, Buffer.from(response.data, 'binary'));

            api.sendMessage({
                body: `😎 Chill Guy: "${text}"`,
                attachment: fs.createReadStream(imagePath)
            }, event.threadID, () => fs.unlinkSync(imagePath));

        } catch (error) {
            console.error("Error generating chill guy image:", error);
            api.sendMessage("❌ Sorry, I couldn't generate the chill guy meme right now.", event.threadID);
        }
    },
};
