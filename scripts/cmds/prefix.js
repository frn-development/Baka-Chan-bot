const fs = require("fs");
const path = require("path");
const { utils } = global;

module.exports = {
  config: {
    name: "prefix",
    version: "2.3",
    author: "Farhan (frnwot) ✦ styled",
    countDown: 5,
    role: 0,
    description: "Check or change the bot's prefix in this chat or system-wide",
    category: "config",
    guide: {
      en:
        "{pn} <new prefix> - change prefix in this chat\n" +
        "  Example: {pn} #\n\n" +
        "{pn} <new prefix> -g - change system-wide prefix (bot admin only)\n" +
        "  Example: {pn} # -g\n\n" +
        "{pn} reset - reset prefix in this chat to default"
    }
  },

  langs: {
    en: {
      reset: "🔄 Your prefix has been reset to default: %1",
      onlyAdmin: "⚠️ Only admin can change system bot prefix",
      confirmGlobal: "🛡️ React to confirm changing system-wide prefix",
      confirmThisThread: "💬 React to confirm changing prefix in this chat",
      successGlobal: "✅ Changed system bot prefix to: %1",
      successThisThread: "✅ Changed prefix in your chat to: %1",
      myPrefix:
`✦━━━━『 BOT PREFIX 』━━━━✦

🌐 System prefix: %1
💬 Your chat prefix: %2

📌 Tip: Try "%2help" to see all commands ✦

✦━━━━『 ROLES INFO 』━━━━✦
0 ✦ All Users
   ↳ Anyone can use these commands.
1 ✦ Group Admins
   ↳ Only chat/group admins can use.
2 ✦ Bot Admins
   ↳ Only global bot owners/maintainers.
3 ✦ Super Admins
   ↳ Highest privilege. Full unrestricted access.`
    }
  },

  onStart: async function ({ message, role, args, commandName, event, threadsData, getLang }) {
    if (!args[0]) return message.SyntaxError();

    if (args[0].toLowerCase() === "reset") {
      await threadsData.set(event.threadID, null, "data.prefix");
      return message.reply(getLang("reset", global.GoatBot.config.prefix));
    }

    const newPrefix = args[0];
    const formSet = { commandName, author: event.senderID, newPrefix };

    if (args[1] === "-g") {
      if (role < 2) return message.reply(getLang("onlyAdmin"));
      formSet.setGlobal = true;
    } else formSet.setGlobal = false;

    return message.reply(
      formSet.setGlobal ? getLang("confirmGlobal") : getLang("confirmThisThread"),
      (err, info) => {
        formSet.messageID = info.messageID;
        global.GoatBot.onReaction.set(info.messageID, formSet);
      }
    );
  },

  onReaction: async function ({ message, threadsData, event, Reaction, getLang }) {
    const { author, newPrefix, setGlobal } = Reaction;
    if (event.userID !== author) return;

    if (setGlobal) {
      global.GoatBot.config.prefix = newPrefix;
      fs.writeFileSync(global.client.dirConfig, JSON.stringify(global.GoatBot.config, null, 2));
      return message.reply(getLang("successGlobal", newPrefix));
    } else {
      await threadsData.set(event.threadID, newPrefix, "data.prefix");
      return message.reply(getLang("successThisThread", newPrefix));
    }
  },

  onChat: async function ({ event, message, getLang }) {
    if (event.body && event.body.toLowerCase() === "prefix") {
      const sysPrefix = global.GoatBot.config.prefix;
      const threadPrefix = utils.getPrefix(event.threadID);

      const logo = `
✦━━━━━━━━━━━━✦
   🤖 𝘽𝙊𝙏 𝙇𝙊𝙂𝙊
✦━━━━━━━━━━━━✦`;

      const text = `${logo}\n\n${getLang("myPrefix", sysPrefix, threadPrefix)}`;

      // Send the specific video2.mp4 from assets folder
      const videoPath = path.join(__dirname, "../../assets/video2.mp4");

      return message.reply({
        body: text,
        attachment: fs.createReadStream(videoPath)
      });
    }
  }
};
