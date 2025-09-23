const fs = require("fs");
const path = require("path");
const { getTime } = global.utils;

module.exports = {
  config: {
    name: "logsbot",
    isBot: true,
    version: "2.2",
    author: "NTKhang | Fixed by Farhan",
    category: "events"
  },

  onStart: async ({ usersData, threadsData, event, message, api }) => {
    const botID = api.getCurrentUserID(); // ✅ use the passed api

    if (event.author == botID) return;

    const isAdded = event.logMessageType == "log:subscribe" && event.logMessageData.addedParticipants.some(p => p.userFbId == botID);
    const isKicked = event.logMessageType == "log:unsubscribe" && event.logMessageData.leftParticipantFbId == botID;
    if (!isAdded && !isKicked) return;

    const authorName = await usersData.getName(event.author);
    const threadID = event.threadID;
    const threadData = await threadsData.get(threadID);
    const threadName = threadData?.threadName || "Unknown";

    const text = isAdded
      ? `✅ Bot added to group ${threadName} by ${authorName}`
      : `❌ Bot was kicked from group ${threadName} by ${authorName}`;

    // Send the specific log.mp4 from assets folder
    const videoPath = path.join(__dirname, "../../assets/log.mp4");

    return message.reply({
      body: text,
      attachment: fs.createReadStream(videoPath)
    });
  }
};
