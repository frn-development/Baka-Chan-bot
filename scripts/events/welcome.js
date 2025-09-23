const { getTime, drive } = global.utils;
if (!global.temp.welcomeEvent) global.temp.welcomeEvent = {};

module.exports = {
  config: {
    name: "welcome",
    version: "2.0",
    author: "Farhan & NTKhang",
    category: "events",
    description: "Custom welcome message with media support (image, audio, video)"
  },

  langs: {
    vi: {
      session1: "sáng",
      session2: "trưa",
      session3: "chiều",
      session4: "tối",
      welcomeMessage: "Cảm ơn bạn đã mời tôi vào nhóm!\nPrefix bot: %1\nĐể xem danh sách lệnh hãy nhập: %1help",
      multiple1: "bạn",
      multiple2: "các bạn",
      defaultWelcomeMessage: "Xin chào {userName}.\nChào mừng {multiple} đến với {boxName}.\nChúc {multiple} có buổi {session} vui vẻ!"
    },
    en: {
      session1: "morning",
      session2: "noon",
      session3: "afternoon",
      session4: "evening",
      welcomeMessage: "Thank you for inviting me to the group!\nBot prefix: %1\nTo view the list of commands, please enter: %1help",
      multiple1: "you",
      multiple2: "you guys",
      defaultWelcomeMessage: `Hello {userName} 👋\nWelcome {multiple} to **{boxName}** 🎉\nHave a great {session}!`
    }
  },

  onStart: async ({ threadsData, message, event, api, getLang }) => {
    if (event.logMessageType !== "log:subscribe") return;

    return async function () {
      const hours = getTime("HH");
      const { threadID } = event;
      const { nickNameBot } = global.GoatBot.config;
      const prefix = global.utils.getPrefix(threadID);
      const dataAddedParticipants = event.logMessageData.addedParticipants;

      // If the new member is the bot
      if (dataAddedParticipants.some((item) => item.userFbId == api.getCurrentUserID())) {
        if (nickNameBot) api.changeNickname(nickNameBot, threadID, api.getCurrentUserID());
        return message.send(getLang("welcomeMessage", prefix));
      }

      // Temp storage setup
      if (!global.temp.welcomeEvent[threadID])
        global.temp.welcomeEvent[threadID] = { joinTimeout: null, dataAddedParticipants: [] };

      global.temp.welcomeEvent[threadID].dataAddedParticipants.push(...dataAddedParticipants);
      clearTimeout(global.temp.welcomeEvent[threadID].joinTimeout);

      global.temp.welcomeEvent[threadID].joinTimeout = setTimeout(async function () {
        const threadData = await threadsData.get(threadID);
        if (threadData.settings.sendWelcomeMessage === false) return;

        const newMembers = global.temp.welcomeEvent[threadID].dataAddedParticipants;
        const bannedList = threadData.data.banned_ban || [];
        const threadName = threadData.threadName;

        const userName = [];
        const mentions = [];
        let multiple = newMembers.length > 1;

        for (const user of newMembers) {
          if (bannedList.some((item) => item.id == user.userFbId)) continue;
          userName.push(user.fullName);
          mentions.push({ tag: user.fullName, id: user.userFbId });
        }

        if (userName.length === 0) return;

        let { welcomeMessage = getLang("defaultWelcomeMessage") } = threadData.data;
        const form = {
          mentions: welcomeMessage.match(/\{userNameTag\}/g) ? mentions : null
        };

        // Replace placeholders
        welcomeMessage = welcomeMessage
          .replace(/\{userName\}|\{userNameTag\}/g, userName.join(", "))
          .replace(/\{boxName\}|\{threadName\}/g, threadName)
          .replace(/\{multiple\}/g, multiple ? getLang("multiple2") : getLang("multiple1"))
          .replace(
            /\{session\}/g,
            hours <= 10
              ? getLang("session1")
              : hours <= 12
              ? getLang("session2")
              : hours <= 18
              ? getLang("session3")
              : getLang("session4")
          );

        form.body = welcomeMessage;

        // === Attachments handling ===
        const attachments = [];
        if (threadData.data.welcomeAttachment) {
          const files = threadData.data.welcomeAttachment;
          const driveFiles = files.map((file) => drive.getFile(file, "stream"));
          const results = await Promise.allSettled(driveFiles);
          results.forEach((r) => r.status === "fulfilled" && attachments.push(r.value));
        }

        // === Default MP4 option (if no custom attachment set) ===
        if (attachments.length === 0) {
          try {
            const defaultVideo = drive.getFile("/assets/welcome.mp4", "stream");
            attachments.push(await defaultVideo);
          } catch (e) {
            console.warn("[welcome] No default /assets/welcome.mp4 found");
          }
        }

        if (attachments.length > 0) form.attachment = attachments;

        await message.send(form);
        delete global.temp.welcomeEvent[threadID];
      }, 1500);
    };
  }
};
