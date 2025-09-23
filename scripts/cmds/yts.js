const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "yts",
    version: "1.0",
    author: "Farhan",
    role: 0,
    countDown: 5,
    shortDescription: "Search YouTube videos",
    longDescription: "Search YouTube using sus-apis and get the top result with thumbnail & link.",
    category: "search",
    guide: {
      en: "{p}ytb1 <video title>"
    }
  },

  onStart: async function ({ api, event, args, message }) {
    if (!args[0]) {
      return message.reply("⚠️ Please provide a video title.\nExample: {p}ytb1 star boy");
    }

    const query = args.join(" ");
    const wait = await message.reply(`🔍 Searching YouTube for: **${query}** ...`);

    try {
      const url = `https://sus-apis.onrender.com/api/youtube-search?title=${encodeURIComponent(query)}`;
      const res = await axios.get(url);
      const data = res.data;

      if (!data || !data.result || data.result.length === 0) {
        return message.reply("❌ No results found!");
      }

      const video = data.result[0]; // first result
      let text = `🎬 **YouTube Search Result**\n\n`;
      text += `📌 Title: ${video.title || "N/A"}\n`;
      if (video.channelName) text += `👤 Channel: ${video.channelName}\n`;
      if (video.published) text += `🗓️ Published: ${video.published}\n`;
      if (video.views) text += `👁️ Views: ${video.views}\n`;
      text += `🔗 Link: ${video.url || `https://youtube.com/watch?v=${video.videoId}`}\n`;

      // Fetch thumbnail if available
      if (video.thumbnail) {
        const thumbPath = path.join(__dirname, "cache", `ytb_${Date.now()}.jpg`);
        const img = await axios.get(video.thumbnail, { responseType: "arraybuffer" });
        fs.writeFileSync(thumbPath, Buffer.from(img.data, "binary"));

        await message.reply({
          body: text,
          attachment: fs.createReadStream(thumbPath)
        });

        fs.unlinkSync(thumbPath); // cleanup
      } else {
        await message.reply(text);
      }

    } catch (e) {
      console.error(e);
      message.reply("⚠️ Error fetching data. The API might be down.");
    } finally {
      if (wait?.messageID) api.unsendMessage(wait.messageID);
    }
  }
};
        
