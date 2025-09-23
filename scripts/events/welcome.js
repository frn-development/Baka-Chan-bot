const fs = require("fs");
const path = require("path");
const { getTime } = global.utils;

if (!global.temp.welcomeEvent) global.temp.welcomeEvent = {};

module.exports = {
  config: { name: "welcome", version: "2.2", category: "events", author: "Farhan" },

  onStart: async ({ threadsData, message, event, api, getLang }) => {
    if (event.logMessageType !== "log:subscribe") return;

    const { threadID } = event;
    const hours = getTime("HH");
    const dataAdded = event.logMessageData.addedParticipants;
    const threadData = await threadsData.get(threadID);

    const names = dataAdded.map(u => u.fullName).join(", ");
    const session = hours <= 10 ? "morning" : hours <= 12 ? "noon" : hours <= 18 ? "afternoon" : "evening";

    let welcomeMessage = `Hello ${names}, welcome to ${threadData.threadName}! Have a nice ${session} 😊`;

    const mp4Path = path.join(__dirname, "../../Baka-chan-1/assets/welcome.mp4");
    const form = { body: welcomeMessage };
    if (fs.existsSync(mp4Path)) form.attachment = fs.createReadStream(mp4Path);

    message.send(form);
  }
};
