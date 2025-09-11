const config = require('../../config/config.json');
const fs = require('fs').promises;
const path = require('path');

module.exports = {
    name: "admin",
    version: "1.0.0",
    author: "frnwot",
    description: "Manages the bot admin list (admin only).",
    adminOnly: true,
    commandCategory: "box chat",
    guide: "Use {pn}admin to see admin list, {pn}admin add @user to add, or {pn}admin remove @user to remove.",
    cooldowns: 5,
    usePrefix: true,

    async execute({ api, event, args }) {
        if (!event || !event.threadID || !event.messageID) {
            console.error("Invalid event object in admin command");
            return api.sendMessage(`${config.bot.botName}: ❌ Invalid event data.`, event.threadID);
        }

        if (args.length === 0) {
            const adminUids = config.bot.adminUids;
            if (adminUids.length === 0) {
                return api.sendMessage(`${config.bot.botName}: No admins found.`, event.threadID);
            }

            const adminInfo = await new Promise((resolve) => api.getUserInfo(adminUids, (err, info) => resolve(err ? {} : info)));
            const adminList = adminUids.map(uid => {
                const adminName = adminInfo[uid]?.name || uid;
                return `- ${adminName} (ID: ${uid})`;
            });

            const message = [
                `╔═━─[ ${config.bot.botName} ADMIN LIST ]─━═╗`,
                `┃ ${adminList.join('\n┃ ')}`,
                `╚═━──────────────────────────────━═╝`
            ].join('\n');

            return api.sendMessage(message, event.threadID);
        }

        if (!event.mentions || Object.keys(event.mentions).length === 0) {
            return api.sendMessage(`${config.bot.botName}: ⚠️ Please mention a user to add or remove as admin.`, event.threadID);
        }

        const targetUid = Object.keys(event.mentions)[0];
        const targetName = event.mentions[targetUid].replace(/@/g, '');
        const isAdd = args[0].toLowerCase() === "add";
        const isRemove = args[0].toLowerCase() === "remove";

        if (!isAdd && !isRemove) {
            return api.sendMessage(`${config.bot.botName}: ⚠️ Invalid action. Use "add" or "remove". ${this.guide}`, event.threadID);
        }

        let adminUids = config.bot.adminUids;
        const configPath = path.join(__dirname, '../../config/config.json');

        if (isAdd) {
            if (adminUids.includes(targetUid)) {
                return api.sendMessage(`${config.bot.botName}: ⚠️ ${targetName} is already an admin.`, event.threadID);
            }
            adminUids.push(targetUid);
        } else if (isRemove) {
            if (!adminUids.includes(targetUid)) {
                return api.sendMessage(`${config.bot.botName}: ⚠️ ${targetName} is not an admin.`, event.threadID);
            }
            if (targetUid === config.bot.ownerUid) {
                return api.sendMessage(`${config.bot.botName}: ⚠️ Cannot remove the bot owner from admin list.`, event.threadID);
            }
            adminUids = adminUids.filter(uid => uid !== targetUid);
        }

        config.bot.adminUids = adminUids;
        await fs.writeFile(configPath, JSON.stringify(config, null, 2));

        const action = isAdd ? "added as admin" : "removed from admin list";
        logger.info(`${targetName} (ID: ${targetUid}) ${action}`);
        api.sendMessage(`${config.bot.botName}: ✅ ${targetName} has been ${action}.`, event.threadID);
    }
};					return message.reply(getLang("missingIdRemove"));
			}
			case "list":
			case "-l": {
				const getNames = await Promise.all(config.adminBot.map(uid => usersData.getName(uid).then(name => ({ uid, name }))));
				return message.reply(getLang("listAdmin", getNames.map(({ uid, name }) => `• ${name} (${uid})`).join("\n")));
			}
			default:
				return message.SyntaxError();
		}
	}
};
