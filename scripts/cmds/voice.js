const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

// Cache voice lists per thread for reply
const voiceLists = {};

module.exports = {
  config: {
    name: "voice",
    aliases: ["voices"],
    version: "1.2",
    author: "Farhan",
    prefix: true,
    description: "List mp3 files and send them only by reply with a number.",
    category: "media",
    guide: {
      en: "{pn}voice → list voices\nReply with a number → get that voice"
    }
  },

  onStart: async ({ api, event }) => {
    const threadID = event.threadID;
    const messageID = event.messageID;

    try {
      // Fetch mp3 list from GitHub API
      const repoUrl = "https://api.github.com/repos/Gtajisan/voice-bot/contents/public";
      const res = await axios.get(repoUrl);
      const mp3Files = res.data.filter(f => f.name.endsWith(".mp3"));

      if (!mp3Files.length) {
        return api.sendMessage("❌ No mp3 files found.", threadID, messageID);
      }

      const fileList = mp3Files.map(f => ({
        name: f.name,
        url: f.download_url
      }));

      // Save list in memory with the message ID
      voiceLists[threadID] = { files: fileList };

      // Build list message
      let listText = "🎵 Voice List:\n\n";
      fileList.forEach((f, i) => {
        listText += `${i + 1}. ${f.name}\n`;
      });
      listText += "\n💡 Reply with a number to get that voice.";

      // Send list
      api.sendMessage(listText, threadID, (err, info) => {
        if (!err) {
          voiceLists[threadID].messageID = info.messageID;
        }
      }, messageID);

    } catch (err) {
      console.error("[voice] Fetch error:", err);
      return api.sendMessage("❌ Error fetching voices.", threadID, messageID);
    }
  },

  onReply: async ({ api, event }) => {
    const threadID = event.threadID;
    const messageID = event.messageID;
    const replyMsgID = event.messageReply?.messageID;

    const threadData = voiceLists[threadID];
    if (!threadData || replyMsgID !== threadData.messageID) return;

    const num = parseInt(event.body.trim());
    if (isNaN(num) || num < 1 || num > threadData.files.length) return;

    const file = threadData.files[num - 1];

    try {
      const tempPath = path.join(__dirname, `voice_${Date.now()}.mp3`);
      const mp3Res = await axios.get(file.url, { responseType: "arraybuffer" });
      await fs.writeFile(tempPath, Buffer.from(mp3Res.data));

      await new Promise((resolve, reject) => {
        api.sendMessage({
          body: `🎤 ${file.name}`,
          attachment: fs.createReadStream(tempPath)
        }, threadID, (err) => {
          fs.unlink(tempPath).catch(() => {});
          if (err) reject(err);
          else resolve();
        }, messageID);
      });
    } catch (err) {
      console.error("[voice] Send error:", err);
      api.sendMessage("❌ Failed to send voice.", threadID, messageID);
    }
  }
};
