const axios = require("axios");
const fs = require("fs");
const path = require("path");

// GitHub public folder
const repoFolder = "https://github.com/Gtajisan/voice-bot/tree/main/public";
const downloadBase = "https://github.com/Gtajisan/voice-bot/raw/main/public/";

module.exports = {
  config: {
    name: "voice",
    version: "2.0",
    author: "Farhan",
    countDown: 5,
    role: 0,
    description: { en: "List and play stored voice mp3 files" },
    category: "media",
    guide: { en: "{pn} voice" }
  },

  onStart: async ({ api, event, commandName }) => {
    try {
      // Fetch HTML page of repo folder
      const { data } = await axios.get(repoFolder);

      // Extract all .mp3 filenames
      const regex = /title="([^"]+\.mp3)"/g;
      let voices = [];
      let match;
      while ((match = regex.exec(data)) !== null) {
        voices.push(match[1]);
      }

      if (voices.length === 0) {
        return api.sendMessage("❌ No MP3 voices found.", event.threadID, event.messageID);
      }

      // Build list message
      let msg = "🎵 Voice List:\n\n";
      voices.forEach((v, i) => {
        msg += `${i + 1}. ${v}\n`;
      });
      msg += "\n💡 Reply with a number to get that voice.";

      // Send list and save reply context
      api.sendMessage(msg, event.threadID, (err, info) => {
        if (err) return;
        global.GoatBot.onReply.set(info.messageID, {
          commandName,
          author: event.senderID,
          voices
        });
      }, event.messageID);

    } catch (err) {
      console.error(err);
      api.sendMessage("❌ Failed to fetch voices.", event.threadID, event.messageID);
    }
  },

  onReply: async ({ api, event, Reply }) => {
    try {
      // Only the original user can reply
      if (event.senderID !== Reply.author) return;

      const choice = parseInt(event.body.trim());
      if (isNaN(choice) || choice < 1 || choice > Reply.voices.length) {
        return api.sendMessage("❌ Invalid number.", event.threadID, event.messageID);
      }

      const fileName = Reply.voices[choice - 1];
      const fileUrl = downloadBase + encodeURIComponent(fileName);
      const filePath = path.join(__dirname, "cache", fileName);

      fs.mkdirSync(path.join(__dirname, "cache"), { recursive: true });

      // Download the mp3
      const res = await axios.get(fileUrl, { responseType: "arraybuffer" });
      fs.writeFileSync(filePath, Buffer.from(res.data));

      // Send mp3
      await api.sendMessage(
        { attachment: fs.createReadStream(filePath) },
        event.threadID,
        () => fs.unlinkSync(filePath),
        event.messageID
      );

    } catch (err) {
      console.error(err);
      api.sendMessage("❌ Error sending voice.", event.threadID, event.messageID);
    }
  }
};
