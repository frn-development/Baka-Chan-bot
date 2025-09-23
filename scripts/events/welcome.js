const fs = require("fs-extra");
const { getTime, drive } = global.utils;
if (!global.temp.welcomeEvent) global.temp.welcomeEvent = {};

module.exports = {
  config: {
    name: "welcome",
    version: "2.1",
    author: "NTKhang | Fixed by Farhan",
    category: "events"
  },

  langs: { /* same as before */ },

  onStart: async ({ threadsData, message, event, api, getLang }) => {
    if (event.logMessageType == "log:subscribe") {
      return async function () {
        const hours = getTime("HH");
        const { threadID } = event;
        const prefix = global.utils.getPrefix(threadID);
        const dataAddedParticipants = event.logMessageData.addedParticipants;

        // If bot is added
        if (dataAddedParticipants.some((item) => item.userFbId == api.getCurrentUserID())) {
          const form = {
            body: getLang("welcomeMessage", prefix)
          };

          // Attach welcome.mp4 if available
          try {
            const mp4Path = `${__dirname}/assets/welcome.mp4`;
            if (fs.existsSync(mp4Path)) {
              form.attachment = fs.createReadStream(mp4Path);
            }
          } catch {}

          return message.send(form);
        }

        // Normal new members
        if (!global.temp.welcomeEvent[threadID])
          global.temp.welcomeEvent[threadID] = { joinTimeout: null, dataAddedParticipants: [] };

        global.temp.welcomeEvent[threadID].dataAddedParticipants.push(...dataAddedParticipants);
        clearTimeout(global.temp.welcomeEvent[threadID].joinTimeout);

        global.temp.welcomeEvent[threadID].joinTimeout = setTimeout(async function () {
          const threadData = await threadsData.get(threadID);
          if (threadData.settings.sendWelcomeMessage == false) return;

          const dataAdded = global.temp.welcomeEvent[threadID].dataAddedParticipants;
          const threadName = threadData.threadName;
          const userName = [], mentions = [];
          let multiple = false;

          if (dataAdded.length > 1) multiple = true;

          for (const user of dataAdded) {
            userName.push(user.fullName);
            mentions.push({ tag: user.fullName, id: user.userFbId });
          }

          if (userName.length == 0) return;

          let { welcomeMessage = getLang("defaultWelcomeMessage") } = threadData.data;
          welcomeMessage = welcomeMessage
            .replace(/\{userName\}|\{userNameTag\}/g, userName.join(", "))
            .replace(/\{boxName\}|\{threadName\}/g, threadName)
            .replace(/\{multiple\}/g, multiple ? getLang("multiple2") : getLang("multiple1"))
            .replace(/\{session\}/g,
              hours <= 10 ? getLang("session1") :
              hours <= 12 ? getLang("session2") :
              hours <= 18 ? getLang("session3") : getLang("session4")
            );

          const form = { body: welcomeMessage, mentions };

          // Attachments
          try {
            const mp4Path = `${__dirname}/assets/welcome.mp4`;
            if (fs.existsSync(mp4Path)) {
              form.attachment = fs.createReadStream(mp4Path);
            }
          } catch {}

          await message.send(form);
          delete global.temp.welcomeEvent[threadID];
        }, 1500);
      };
    }
  }
};
