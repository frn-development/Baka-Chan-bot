const fs = require('fs');
const path = require('path');
const axios = require('axios');

module.exports = {
    config: {
        name: 'jail',
        version: '1.0',
        author: 'Farhan',
        countDown: 10,
        prefix: true,
        groupAdminOnly: false,
        description: 'Puts a jail filter over a user’s avatar or image.',
        category: 'fun',
        guide: {
            en: '{pn}jail (your own profile)\n{pn}jail @someone\n{pn}jail <uid>\nReply to an image with {pn}jail'
        },
    },

    onStart: async ({ api, event, args }) => {
        const { senderID, mentions, messageReply } = event;

        let targetID = senderID;
        let imageUrl = null;
        let targetIDForFilename = senderID;

      
        if (messageReply && messageReply.attachments && messageReply.attachments.length > 0 && ['photo', 'sticker'].includes(messageReply.attachments[0].type)) {
            imageUrl = messageReply.attachments[0].url;
            targetIDForFilename = messageReply.senderID;
        } else {
          
            if (Object.keys(mentions).length > 0) {
                targetID = Object.keys(mentions)[0];
            } else if (args.length > 0 && args[0].match(/^\d+$/)) {
                targetID = args[0].replace(/[^0-9]/g, '');
            }
            targetIDForFilename = targetID;

          
            imageUrl = `https://graph.facebook.com/${targetID}/picture?width=512&height=512&access_token=6628568379|c1e620fa708a1d5696fb991c1bde5662`;
        }

        const apiUrl = `https://sus-apis-2.onrender.com/api/jail?image=${encodeURIComponent(imageUrl)}`;

        try {
            api.sendMessage("🚔 Generating jail image, please wait...", event.threadID);
            const response = await axios.get(apiUrl, { responseType: 'arraybuffer' });

            const cacheDir = path.join(__dirname, 'cache');
            if (!fs.existsSync(cacheDir)) {
                fs.mkdirSync(cacheDir);
            }
            const imagePath = path.join(cacheDir, `jail_${targetIDForFilename}_${Date.now()}.png`);
            fs.writeFileSync(imagePath, Buffer.from(response.data, 'binary'));

            api.sendMessage({
                attachment: fs.createReadStream(imagePath)
            }, event.threadID, () => fs.unlinkSync(imagePath));
        } catch (error) {
            console.error("Error generating or sending jail image:", error);
            api.sendMessage("❌ Sorry, couldn't generate the jail image right now.", event.threadID);
        }
    }
};
