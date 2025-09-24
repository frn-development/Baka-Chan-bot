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
        description: 'Put user\'s avatar under a jail bars overlay effect.',
        category: 'fun',
        guide: {
            en: '{pn} [reply/tag user]',
        }
    },

    onStart: async function ({ api, event, args }) {
        try {
            const mention = Object.keys(event.mentions)[0] || event.senderID;
            const userAvatar = await api.getUserInfo(mention)
                .then(info => info[mention]?.thumbSrc || `https://graph.facebook.com/${mention}/picture?width=512&height=512`);

            const url = `https://sus-apis.onrender.com/api/jail?image=${encodeURIComponent(userAvatar)}`;

            const response = await axios.get(url, { responseType: 'arraybuffer' });
            const imgPath = path.join(__dirname, 'cache', `jail_${mention}.png`);
            fs.writeFileSync(imgPath, Buffer.from(response.data, 'binary'));

            api.sendMessage(
                {
                    body: "🚔 Justice has been served! You're in jail now. 🏛️",
                    attachment: fs.createReadStream(imgPath),
                },
                event.threadID,
                () => fs.unlinkSync(imgPath),
                event.messageID
            );
        } catch (err) {
            api.sendMessage(`❌ Error: ${err.message}`, event.threadID, event.messageID);
        }
    }
};
