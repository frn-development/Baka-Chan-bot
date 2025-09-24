const fs = require('fs');
const path = require('path');
const axios = require('axios');

const userDBPath = path.join(__dirname, '..', '..', 'database', 'users.json');

function readDB(filePath) {
    try {
        const data = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        if (error.code === 'ENOENT') return {};
        console.error(`Error reading database at ${filePath}:`, error);
        return {};
    }
}

function calculateRequiredXP(level) {
    return 5 * (level ** 2) + 50 * level + 100;
}

module.exports = {
    config: {
        name: 'rank1',
        version: '1.0',
        author: 'Farhan',
        countDown: 5,
        prefix: true,
        groupAdminOnly: false,
        description: 'Get your or another user\'s rank card, or see the top 10 users.',
        category: 'level',
        guide: {
            en: '{pn}\n{pn} [@mention|uid]\n{pn} top'
        },
    },

    onStart: async ({ api, event, args }) => {
        const { senderID, mentions } = event;
        const userDB = readDB(userDBPath);
        const sortedUsers = Object.values(userDB).sort((a, b) => b.rank - a.rank);

        // Top 10 leaderboard
        if (args[0] === 'top') {
            const topUsers = sortedUsers.slice(0, 10);
            let message = '🏆 Top 10 Users by Level:\n';
            for (let i = 0; i < topUsers.length; i++) {
                const user = topUsers[i];
                message += `${i + 1}. ${user.name}: Level ${user.rank}\n`;
            }

            const userRank = sortedUsers.findIndex(u => u.userID === senderID) + 1;
            if (userRank > 0) message += `\nYour Rank: ${userRank}`;

            return api.sendMessage(message, event.threadID);
        }

        // Determine target user
        let targetID;
        if (Object.keys(mentions).length > 0) targetID = Object.keys(mentions)[0];
        else if (args.length > 0) targetID = args[0];
        else targetID = senderID;

        if (!userDB[targetID]) return api.sendMessage("❌ This user does not have an account.", event.threadID);

        const userData = userDB[targetID];
        const level = userData.rank || 1;
        const currentXP = userData.xp || 0;
        const requiredXP = calculateRequiredXP(level);
        const name = userData.name || 'Unknown User';
        const avatarUrl = `https://graph.facebook.com/${targetID}/picture?width=512&height=512&access_token=6628568379|c1e620fa708a1d5696fb991c1bde5662`;

        const rankIndex = sortedUsers.findIndex(user => user.userID === targetID);
        const rank = rankIndex >= 0 ? rankIndex + 1 : 9999;
        const style = Math.floor(Math.random() * 5) + 1;

        const apiUrl = `https://hridoy-apis.vercel.app/canvas/rank-card-v2?avatarImgURL=${encodeURIComponent(avatarUrl)}&nickname=${encodeURIComponent(name)}&currentLvl=${level}&currentRank=${rank}&currentXP=${currentXP}&requiredXP=${requiredXP}&userStatus=online&style=${style}&apikey=hridoyXQC`;

        try {
            console.log(`[API Request] Sending to: ${apiUrl}`);
            const response = await axios.get(apiUrl, { responseType: 'arraybuffer' });
            console.log(`[API Response] Status: ${response.status}, Status Text: ${response.statusText}`);

            const cacheDir = path.join(__dirname, 'cache');
            if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });

            const filePath = path.join(cacheDir, `rank1_${targetID}_${Date.now()}.png`);
            fs.writeFileSync(filePath, Buffer.from(response.data, 'binary'));

            api.sendMessage({
                body: `📊 Rank Card for @${name}`,
                mentions: [{ tag: `@${name}`, id: targetID }],
                attachment: fs.createReadStream(filePath)
            }, event.threadID, () => fs.unlinkSync(filePath));

        } catch (err) {
            console.error("Error generating or sending rank card:", err);
            api.sendMessage("❌ Failed to generate the rank card.", event.threadID);
        }
    },
};
  
