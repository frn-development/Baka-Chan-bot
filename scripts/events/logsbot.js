const fs = require("fs");
const path = require("path");
const { getTime } = global.utils;

module.exports = {
	config: {
		name: "logsbot",
		isBot: true,
		version: "2.3",
		author: "NTKhang | Fixed & Extended by Farhan",
		envConfig: {
			allow: true
		},
		category: "events"
	},

	langs: {
		vi: {
			title: "====== Nhật ký bot ======",
			added: "\n✅\nSự kiện: bot được thêm vào nhóm mới\n- Người thêm: %1",
			kicked: "\n❌\nSự kiện: bot bị kick\n- Người kick: %1",
			footer: "\n- User ID: %1\n- Nhóm: %2\n- ID nhóm: %3\n- Thời gian: %4"
		},
		en: {
			title: "====== Bot logs ======",
			added: "\n✅\nEvent: bot has been added to a new group\n- Added by: %1",
			kicked: "\n❌\nEvent: bot has been kicked\n- Kicked by: %1",
			footer: "\n- User ID: %1\n- Group: %2\n- Group ID: %3\n- Time: %4"
		}
	},

	onStart: async ({ usersData, threadsData, event, api, getLang }) => {
		const botID = api.getCurrentUserID();
		const { author, threadID, logMessageType, logMessageData } = event;

		// Only trigger if bot is added or removed
		const isAdded = logMessageType == "log:subscribe" && logMessageData.addedParticipants.some(item => item.userFbId == botID);
		const isKicked = logMessageType == "log:unsubscribe" && logMessageData.leftParticipantFbId == botID;

		if (!isAdded && !isKicked) return;
		if (author == botID) return;

		let msg = getLang("title");
		let threadName = "Unknown";
		let authorName = await usersData.getName(author);

		if (isAdded) {
			const info = await api.getThreadInfo(threadID);
			threadName = info.threadName || "Unknown";
			msg += getLang("added", authorName);
		}
		else if (isKicked) {
			const threadData = await threadsData.get(threadID);
			threadName = threadData?.threadName || "Unknown";
			msg += getLang("kicked", authorName);
		}

		const time = getTime("DD/MM/YYYY HH:mm:ss");
		msg += getLang("footer", author, threadName, threadID, time);

		// Video path (assets/log.mp4)
		const videoPath = path.join(__dirname, "../../assets/log.mp4");
		const attachment = fs.existsSync(videoPath) ? fs.createReadStream(videoPath) : null;

		// Send log to all admins
		const { config } = global.GoatBot;
		for (const adminID of config.adminBot) {
			api.sendMessage({ body: msg, attachment }, adminID);
		}

		// Also reply in the group itself
		return api.sendMessage({ body: msg, attachment }, threadID);
	}
};
