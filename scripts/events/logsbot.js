const fs = require("fs-extra");
const { getTime } = global.utils;

module.exports = {
  config: {
    name: "logsbot",
    isBot: true,
    version: "2.0",
    author: "NTKhang | Modified by Farhan",
    envConfig: {
      allow: true
    },
    category: "events"
  },

  langs: {
    vi: {
      title: "====== Nhật ký bot ======",
      added: "\n✅\nSự kiện: Bot được thêm vào nhóm mới\n- Người thêm: %1",
      kicked: "\n❌\nSự kiện: Bot bị kick khỏi nhóm\n- Người kick: %1",
      footer: "\n- User ID: %1\n- Nhóm: %2\n- ID nhóm: %3\n- Thời gian: %4\n- Thành viên hiện tại: %5"
    },
    en: {
      title: "====== Bot Logs ======",
      added: "\n✅\nEvent: Bot has been added to a new group\n- Added by: %1",
      kicked: "\n❌\nEvent: Bot has been kicked from a group\n- Kicked by: %1",
      footer: "\n- User ID: %1\n- Group: %2\n- Group ID: %3\n- Time: %4\n- Current Members: %5"
    }
  },

  onStart: async ({ usersData, threadsData, event, api, getLang }) => {
    const { author, threadID, logMessageType, logMessageData } = event;
    const { config } = global.GoatBot;
    const botID = api.getCurrentUserID();

    // Detect if bot is added or kicked
    const isAdded =
      logMessageType === "log:subscribe" &&
      logMessageData.addedParticipants.some(p => p.userFbId == botID);

    const isKicked =
      logMessageType === "log:unsubscribe" &&
      logMessageData.leftParticipantFbId == botID;

    if (!isAdded && !isKicked) return;

    if (author == botID) return; // ignore if bot itself

    let msg = getLang("title");
    let threadName, memberCount, authorName;

    try {
      authorName = await usersData.getName(author);
    } catch {
      authorName = "Unknown User";
    }

    if (isAdded) {
      const threadInfo = await api.getThreadInfo(threadID);
      threadName = threadInfo.threadName || "Unnamed Group";
      memberCount = threadInfo.participantIDs?.length || "N/A";
      msg += getLang("added", authorName);
    }

    if (isKicked) {
      const threadData = await threadsData.get(threadID);
      threadName = threadData?.threadName || "Unnamed Group";
      memberCount = threadData?.members?.length || "N/A";
      msg += getLang("kicked", authorName);
    }

    const time = getTime("DD/MM/YYYY HH:mm:ss");
    msg += getLang("footer", author, threadName, threadID, time, memberCount);

    // Build log message
    const form = { body: msg };

    // Attach log.mp4 if available
    try {
      const mp4Path = `${__dirname}/assets/log.mp4`;
      if (fs.existsSync(mp4Path)) {
        form.attachment = fs.createReadStream(mp4Path);
      }
    } catch (e) {
      // ignore if no log.mp4
    }

    // Send to all admins
    for (const adminID of config.adminBot) {
      api.sendMessage(form, adminID);
    }
  }
};
