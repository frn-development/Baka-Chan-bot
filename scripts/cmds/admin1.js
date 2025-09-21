const config = require('../../../config.dev.json'); // Correct path to your config.dev.json
const fs = require('fs').promises;
const path = require('path');
const axios = require('axios');

module.exports = {
    name: "admin1",
    version: "1.0.1",
    author: "frnwot",
    description: "Manages the bot admin list (admin only) with avatar fetch.",
    adminOnly: true,
    commandCategory: "admin",
    guide: "Use {pn}admin1 to see admin list, {pn}admin1 add @user to add, or {pn}admin1 remove @user to remove.",
    cooldowns: 5,
    usePrefix: true,

    async execute({ api, event, args }) {
        if (!event || !event.threadID || !event.messageID) {
            console.error("Invalid event object in admin1 command");
            return api.sendMessage(`${config.nickNameBot}: ❌ Invalid event data.`, event.threadID);
        }

        let adminUids = config.adminBot || [];

        // List admins
        if (!args.length) {
            if (adminUids.length === 0) {
                return api.sendMessage(`${config.nickNameBot}: No admins found.`, event.threadID);
            }

            // Get admin info from Facebook API
            const adminInfo = await new Promise((resolve) =>
                api.getUserInfo(adminUids, (err, info) => resolve(err ? {} : info))
            );

            // Fetch GitHub avatar for your UID
            const adminList = await Promise.all(adminUids.map(async uid => {
                const name = adminInfo[uid]?.name || uid;
                let avatarUrl = '';

                // Fetch GitHub avatar only for your UID
                if(uid === '100094924471568') { // replace with your UID
                    try {
                        const ghResp = await axios.get('https://api.github.com/users/Gtajisan');
                        avatarUrl = ghResp.data.avatar_url;
                    } catch(e) {
                        console.error('Failed to fetch GitHub avatar:', e.message);
                    }
                }

                return { name, uid, avatarUrl };
            }));

            let message = `╔═━─[ ${config.nickNameBot} ADMIN LIST ]─━═╗\n`;
            for(const admin of adminList){
                message += `┃ ${admin.name} (ID: ${admin.uid})\n`;
                if(admin.avatarUrl) message += `┃ Avatar: ${admin.avatarUrl}\n`;
            }
            message += `╚═━──────────────────────────────━═╝`;

            return api.sendMessage(message, event.threadID);
        }

        // Add or remove admin
        if (!event.mentions || Object.keys(event.mentions).length === 0) {
            return api.sendMessage(`${config.nickNameBot}: ⚠️ Please mention a user to add or remove as admin.`, event.threadID);
        }

        const targetUid = Object.keys(event.mentions)[0];
        const targetName = event.mentions[targetUid].replace(/@/g, '');
        const isAdd = args[0].toLowerCase() === "add";
        const isRemove = args[0].toLowerCase() === "remove";

        if (!isAdd && !isRemove) {
            return api.sendMessage(`${config.nickNameBot}: ⚠️ Invalid action. Use "add" or "remove". ${this.guide}`, event.threadID);
        }

        const configPath = path.join(__dirname, '../../../config.dev.json');

        if (isAdd) {
            if (adminUids.includes(targetUid)) {
                return api.sendMessage(`${config.nickNameBot}: ⚠️ ${targetName} is already an admin.`, event.threadID);
            }
            adminUids.push(targetUid);
        } else if (isRemove) {
            if (!adminUids.includes(targetUid)) {
                return api.sendMessage(`${config.nickNameBot}: ⚠️ ${targetName} is not an admin.`, event.threadID);
            }
            if (targetUid === config.facebookAccount.email) { // prevent removing yourself
                return api.sendMessage(`${config.nickNameBot}: ⚠️ Cannot remove the bot owner from admin list.`, event.threadID);
            }
            adminUids = adminUids.filter(uid => uid !== targetUid);
        }

        config.adminBot = adminUids;
        await fs.writeFile(configPath, JSON.stringify(config, null, 2));

        const action = isAdd ? "added as admin" : "removed from admin list";
        console.log(`${targetName} (ID: ${targetUid}) ${action}`);
        api.sendMessage(`${config.nickNameBot}: ✅ ${targetName} has been ${action}.`, event.threadID);
    }
};
