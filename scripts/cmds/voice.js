const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

// Save lists per thread for reply system
const voiceLists = {};

module.exports = {
  config: {
    name: "voice",
    aliases: ["voices"],
    version: "1.0",
    author: "Farhan",
    prefix: true,
    description: "List and send voices (MP3) from GitHub repo.",
    category: "media",
    guide: {
      en: "{pn}voice → list all voices\n{pn}voice <number> → send voice\nReply with number after list too."
    }
  },

  onStart: async ({ api, event, args }) => {
    const threadID = event.threadID;
    const messageID = event.messageID;

    try {
      // Fetch contents of public folder
      const repoUrl = "https://api.github.com/repos/Gtajisan/voice-bot/contents/public";
      const res = await axios.get(repoUrl);
      const mp3Files = res.data.filter(f => f.name.endsWith(".mp3"));

      if (!mp3Files.length) {
        return api.sendMessage("❌ No mp3 files found.", threadID, messageID);
      }

      // Build list
      const fileList = mp3Files.map((f, i) => ({
        name: f.name,
        url: f.download_url
      }));

      // Save to memory for reply system
      voiceLists[threadID] = fileList;

      // If no number → show list
      if (!args[0]) {
        let listText = "🎵 Voice List:\n\n";
        fileList.forEach((f, i) => listText += `${i + 1}. ${f.name}\n`);
        listText += "\n💡 Reply with a number to get that voice.";
        return api.sendMessage(listText, threadID, messageID);
      }

      // If number given
      const index = parseInt(args[0]) - 1;
      if (isNaN(index) || index < 0 || index >= fileList.length) {
        return api.sendMessage("❌ Invalid number.", threadID, messageID);
      }

      return await sendVoice(api, event, fileList[index]);

    } catch (err) {
      console.error("[voice] Fetch error:", err);
      api.sendMessage("❌ Error fetching voices.", threadID, messageID);
    }
  },

  // Reply handler (when you reply with just "1")
  onReply: async ({ api, event }) => {
    const fileList = voiceLists[event.threadID];
    if (!fileList) return;

    const num = parseInt(event.body.trim());
    if (isNaN(num) || num < 1 || num > fileList.length) return;

    return await sendVoice(api, event, fileList[num - 1]);
  }
};

// Helper to download + send
async function sendVoice(api, event, file) {
  const threadID = event.threadID;
  const messageID = event.messageID;

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
