const fs = require('fs');
const path = require('path');
const axios = require('axios');

module.exports = {
    config: {
        name: 'cryvsok',
        version: '1.0',
        author: 'Farhan',
        countDown: 10,
        prefix: true,
        groupAdminOnly: false,
        description: 'Generate a Crying vs Okay Emoji meme comparing two situations.',
        category: 'fun',
        guide: {
            en: '   {pn} [text1 | text2]\n\nExample: {pn} When you have to wake up early | When you remember it\'s weekend'
        },
    },

    onStart: async ({ api, event, args }) => {
        const input = args.join(" ").split("|");
        if (input.length < 2) {
            return api.sendMessage(
                "⚠️ Please provide two texts separated by `|`.\nExample: cryvsok When you have to wake up early | When you remember it's weekend",
                event.threadID
            );
        }

        const text1 = input[0].trim();
        const text2 = input[1].trim();
        const apiUrl = `https://sus-apis.onrender.com/api/crying-vs-okay-emoji?text1=${encodeURIComponent(text1)}&text2=${encodeURIComponent(text2)}`;

        try {
            console.log(`[API Request] Sending to: ${apiUrl}`);
            const response = await axios.get(apiUrl, { responseType: 'arraybuffer' });
            console.log(`[API Response] Status: ${response.status}, Status Text: ${response.statusText}`);

            const cacheDir = path.join(__dirname, 'cache');
            if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);

            const imagePath = path.join(cacheDir, `cryvsok_${Date.now()}.jpg`);
            fs.writeFileSync(imagePath, Buffer.from(response.data, 'binary'));

            api.sendMessage({
                body: `😭 vs 😐 Meme\nTop: "${text1}"\nBottom: "${text2}"`,
                attachment: fs.createReadStream(imagePath)
            }, event.threadID, () => fs.unlinkSync(imagePath));

        } catch (error) {
            console.error("Error generating Crying vs Okay meme:", error);
            api.sendMessage("❌ Sorry, I couldn't generate the Crying vs Okay meme right now.", event.threadID);
        }
    },
};
                                                                                                          
