const fs = require('fs');
const path = require('path');
const axios = require('axios');

module.exports = {
    config: {
        name: 'cj',
        version: '1.0',
        author: 'Farhan',
        countDown: 10,
        prefix: true,
        groupAdminOnly: false,
        description: 'Generate CJ reaction meme with custom text.',
        category: 'fun',
        guide: {
            en: '   {pn} [your text here]\n\nExample: {pn} Ah shit, here we go again'
        },
    },

    onStart: async ({ api, event, args }) => {
        const text = args.join(" ");
        if (!text) {
            return api.sendMessage(
                "⚠️ Please provide some text.\nExample: cj Ah shit, here we go again",
                event.threadID
            );
        }

        const apiUrl = `https://sus-apis.onrender.com/api/cj-reaction?text=${encodeURIComponent(text)}`;

        try {
            console.log(`[API Request] Sending to: ${apiUrl}`);
            const response = await axios.get(apiUrl, { responseType: 'arraybuffer' });
            console.log(`[API Response] Status: ${response.status}, Status Text: ${response.statusText}`);

            const cacheDir = path.join(__dirname, 'cache');
            if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);

            const imagePath = path.join(cacheDir, `cj_${Date.now()}.jpg`);
            fs.writeFileSync(imagePath, Buffer.from(response.data, 'binary'));

            api.sendMessage({
                body: `🚶 CJ Meme: "${text}"`,
                attachment: fs.createReadStream(imagePath)
            }, event.threadID, () => fs.unlinkSync(imagePath));

        } catch (error) {
            console.error("Error generating CJ meme:", error);
            api.sendMessage("❌ Sorry, I couldn't generate the CJ meme right now.", event.threadID);
        }
    },
};
          
