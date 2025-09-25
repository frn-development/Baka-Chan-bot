module.exports = {
  config: {
    name: "antiout",
    version: "1.1",
    author: "frn",
    countDown: 5,
    role: 1,
    shortDescription: "Enable or disable antiout",
    longDescription: "Prevent members from leaving the group. If enabled, users who leave will be automatically added back.",
    category: "boxchat",
    guide: "{pn} [on | off]",
    envConfig: {
      deltaNext: 5
    }
  },

  onStart: async function({ message, event, threadsData, args }) {
    let antiout = await threadsData.get(event.threadID, "settings.antiout");
    if (antiout === undefined) {
      await threadsData.set(event.threadID, true, "settings.antiout");
      antiout = true;
    }

    if (!["on", "off"].includes(args[0])) {
      return message.reply("❗ Please use: on | off");
    }

    await threadsData.set(event.threadID, args[0] === "on", "settings.antiout");
    return message.reply(
      args[0] === "on"
        ? "✅ Antiout is now ON. Nobody can escape 😼"
        : "❌ Antiout is now OFF. Members are free to leave 🙁"
    );
  },

  onEvent: async function({ api, event, threadsData }) {
    const antiout = await threadsData.get(event.threadID, "settings.antiout");

    if (antiout && event.logMessageData && event.logMessageData.leftParticipantFbId) {
      const userId = event.logMessageData.leftParticipantFbId;

      // Check if user is still in the chat
      const threadInfo = await api.getThreadInfo(event.threadID);
      const userIndex = threadInfo.participantIDs.indexOf(userId);

      if (userIndex === -1) {
        try {
          await api.addUserToGroup(userId, event.threadID);
          console.log(`🔄 User ${userId} was added back to the chat.`);
        } catch (e) {
          console.log(`⚠️ Failed to add user ${userId} back: ${e.message}`);
        }
      }
    }
  }
};
                            
