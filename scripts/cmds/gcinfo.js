const fs = require("fs");
const request = require("request");

module.exports.config = {
  name: "gcinfo",
  version: "1.1.0",
  hasPermssion: 1,
  credits: "Farhan",
  description: "Shows detailed group information",
  commandCategory: "box chat",
  usages: "gcinfo",
  cooldowns: 3,
  dependencies: []
};

module.exports.run = async function({ api, event }) {
  let threadInfo = await api.getThreadInfo(event.threadID);
  let memberCount = threadInfo.participantIDs.length;

  let males = 0, females = 0, unknown = 0;
  for (let user of threadInfo.userInfo) {
    if (user.gender === "MALE") males++;
    else if (user.gender === "FEMALE") females++;
    else unknown++;
  }

  let admins = threadInfo.adminIDs.length;
  let messageCount = threadInfo.messageCount || 0;
  let icon = threadInfo.emoji || "None";
  let threadName = threadInfo.threadName || "Unnamed Group";
  let threadID = threadInfo.threadID;
  let approval = threadInfo.approvalMode ? "ON" : "OFF";

  const callback = () => api.sendMessage(
    {
      body: 
`─── Group Information ───
• Name: ${threadName}
• ID: ${threadID}
• Approval Mode: ${approval}
• Emoji: ${icon}

─── Statistics ───
• Total Members: ${memberCount}
• Males: ${males}
• Females: ${females}
• Unknown: ${unknown}
• Admins: ${admins}
• Total Messages: ${messageCount}
──────────────────────`,
      attachment: fs.createReadStream(__dirname + "/cache/group.png")
    },
    event.threadID,
    () => fs.unlinkSync(__dirname + "/cache/group.png"),
    event.messageID
  );

  return request(encodeURI(threadInfo.imageSrc || "https://i.imgur.com/3Q4cYxC.png"))
    .pipe(fs.createWriteStream(__dirname + "/cache/group.png"))
    .on("close", () => callback());
};
        
