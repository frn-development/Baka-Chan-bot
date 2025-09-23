const fs = require("fs-extra");
const { getTime } = global.utils;

module.exports = {
  config: {
    name: "logsbot",
    isBot: true,
    version: "2.1",
    author: "NTKhang | Fixed by Farhan",
    envConfig: { allow: true },
    category: "events"
  },

  langs: { /* same as before */ },

  onStart: async ({ usersData, threadsData, event, api, getLang }) => {
    const { author, threadID, logMessageType, logMessageData } = event;
    const botID = api.getCurrentUserID();
    const { config } = global.GoatBot;

    const isAdded = logMessageType === "log:subscribe" &&
      logMessageData.addedParticipants.some(p => p.userFbId == botID);

    const isKicked = logMessageType === "log:unsubscribe" &&
      logMessageData.leftParticipantFbId == botID;

    if (!isAdded && !isKicked) return;
    if (author == botID) return;

    let msg = getLang("title");
    let threadName, memberCount, authorName;

    try { authorName = await usersData.getName(author); } catch { authorName = "Unknown"; }

    if (isAdded) {
      const info = await api.getThreadInfo(threadID);
      threadName = info.threadName || "Unnamed Group";
      memberCount = info.participantIDs?.length || "N/A";
      msg += getLang("added", authorName);
    }

    if (isKicked) {
      const data = await threadsData.get(threadID);
      threadName = data?.threadName || "Unnamed Group";
      memberCount = data?.members?.length || "N/A";
      msg += getLang("kicked", authorName);
    }

    const time = getTime("DD/MM/YYYY HH:mm:ss");
    msg += getLang("footer", author, threadName, threadID, time, memberCount);

    const form = { body: msg };

    // Attach log.mp4
    try {
      const mp4Path = `${__dirname}/assets/log.mp4`;
      if (fs.existsSync(mp4Path)) {
        form.attachment = fs.createReadStream(mp4Path);
      }
    } catch {}

    for (const adminID of config.adminBot) {
      api.sendMessage(form, adminID);
    }
  }
};
