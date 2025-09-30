const axios = require("axios");
const fs = require("fs");
const path = require("path");

const voiceRepoPage = "https://github.com/Gtajisan/voice-bot/tree/main/public";
const voiceRawBase = "https://raw.githubusercontent.com/Gtajisan/voice-bot/main/public/";

let cachedVoices = [];
let lastMessageID = null;

module.exports = {
  config: {
    name: "voice",
    aliases: [],
    version: "2.0",
    author: "Farhan",
    role: 0,
    shortDescription: "List and play voices",
    longDescription: "Fetch .mp3 files from GitHub repo and send them when replied",
    category: "fun",
    guide: "{pn} voice",
  },

  onStart: async function ({ message }) {
    try {
      // Old fetching system: scrape HTML for mp3 links
      const { data } = await axios.get(voiceRepoPage);
      const regex = /title="([^"]+\.mp3)"/g;

      cachedVoices = [];
      let match;
      while ((match = regex.exec(data)) !== null) {
        cachedVoices.push(match[1]);
      }

      if (cachedVoices.length === 0) {
        return message.reply("❌ No MP3 voices found in repo.");
      }

      // build list
      let list = "🎵 Voice List:\n\n";
      cachedVoices.forEach((file, idx) => {
        list += `${idx + 1}. ${file}\n`;
      });
      list += "\n💡 Reply with a number to get that voice.";

      const sent = await message.reply(list);
      lastMessageID = sent.messageID;
    } catch (err) {
      console.error(err);
      message.reply("❌ Failed to fetch voices (old system).");
    }
  },

  onReply: async function ({ message, Reply }) {
    if (Reply.messageID !== lastMessageID) return;

    const choice = parseInt(message.body.trim());
    if (isNaN(choice) || choice < 1 || choice > cachedVoices.length) {
      return message.reply("❌ Invalid number. Try again.");
    }

    const fileName = cachedVoices[choice - 1];
    const fileUrl = `${voiceRawBase}${encodeURIComponent(fileName)}`;
    const filePath = path.join(__dirname, "tmp", fileName);

    try {
      // download mp3
      const res = await axios.get(fileUrl, { responseType: "arraybuffer" });
      fs.writeFileSync(filePath, Buffer.from(res.data));

      await message.reply({
        attachment: fs.createReadStream(filePath),
      });

      fs.unlinkSync(filePath);
    } catch (err) {
      console.error(err);
      message.reply("❌ Error sending voice.");
    }
  },
};
