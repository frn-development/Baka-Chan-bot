const fs = require("fs");
const path = require("path");
const { getTime } = global.utils;

if (!global.temp.welcomeEvent) global.temp.welcomeEvent = {};

module.exports = {
  config: {
    name: "welcome",
    version: "2.2",
    author: "NTKhang | Fixed by Farhan",
    category: "events"
  },

  onStart: async ({ threadsData, message, event }) => {
    if (event.logMessageType !== "log:subscribe") return;

    const { threadID } = event;
    const hours = getTime("HH");
    const dataAdded = event.logMessageData.addedParticipants;
    const threadData = await threadsData.get(threadID);

    const names = dataAdded.map(u => u.fullName).join(", ");
    const session = hours <= 10 ? "morning" : hours <= 12 ? "noon" : hours <= 18 ? "afternoon" : "evening";

    const text = `Hello ${names}, welcome to ${threadData.threadName}! Have a nice ${session} 😊`;

    // Send the specific welcome.mp4 from assets folder
    const videoPath = path.join(__dirname, "../../assets/welcome.mp4");

    return message.reply({
      body: text,
      attachment: fs.createReadStream(videoPath)
    });
  }
};
