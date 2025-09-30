const axios = require("axios");
const fs = require("fs");
const path = require("path");

const repoPage = "https://github.com/Gtajisan/voice-bot/tree/main/public";
const downloadBase = "https://github.com/Gtajisan/voice-bot/raw/main/public/";

module.exports = {
  config: {
    name: "voice",
    version: "1.3",
    author: "Farhan",
    countDown: 5,
    role: 0,
    description: { en: "List and play stored voice mp3 files" },
    category: "media",
    guide: { en: "{pn} voice" }
  },

  onStart: async ({ api, event, commandName }) => {
    try {
      // Fetch HTML page of repo
      const { data } = await axios.get(repoPage);
      const regex = /title="([^"]+\.mp3)"/g;

      let voices = [];
      let match;
      while ((match = regex.exec(data)) !== null) {
        voices.push(match[1]);
      }

      if (voices.length === 0) {
        return api.sendMessage("❌ No MP3 voices found.", event.threadID, event.messageID);
      }

      let msg = "🎵 Voice List:\n\n";
      voices.forEach((v, i) => {
        msg += `${i + 1}. ${v}\n`;
      });
      msg += "\n💡 Reply with a number to get that voice.";

      api.sendMessage(msg, event.threadID, (err, info) => {
        if (err) return;
        global.GoatBot.onReply.set(info.messageID, {
          commandName,
          author: event.senderID,
          voices
        });
      }, event.messageID);

    } catch (e) {
      console.error(e);
      return api.sendMessage("❌ Failed to fetch voices.", event.threadID, event.messageID);
    }
  },

  onReply: async ({ api, event, Reply }) => {
    try {
      if (event.senderID !== Reply.author) return;
      const choice = parseInt(event.body.trim());

      if (isNaN(choice) || choice < 1 || choice > Reply.voices.length) {
        return api.sendMessage("❌ Invalid number.", event.threadID, event.messageID);
      }

      const fileName = Reply.voices[choice - 1];
      const url = downloadBase + encodeURIComponent(fileName);
      const filePath = path.join(__dirname, "cache", fileName);

      fs.mkdirSync(path.join(__dirname, "cache"), { recursive: true });

      // Download file
      const res = await axios.get(url, { responseType: "arraybuffer" });
      fs.writeFileSync(filePath, Buffer.from(res.data));

      await api.sendMessage(
        { attachment: fs.createReadStream(filePath) },
        event.threadID,
        () => fs.unlinkSync(filePath),
        event.messageID
      );

    } catch (e) {
      console.error(e);
      api.sendMessage("❌ Error sending voice.", event.threadID, event.messageID);
    }
  }
};
