const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "terabox",
    aliases: ["tb"],
    version: "1.0",
    author: "Farhan",
    countDown: 5,
    role: 0,
    shortDescription: {
      en: "Download files from Terabox link"
    },
    longDescription: {
      en: "Use Terabox Downloader API to fetch and send files directly through the bot."
    },
    category: "media",
    guide: {
      en: "{pn} <terabox_url>"
    }
  },

  onStart: async function ({ api, event, args }) {
    try {
      if (args.length === 0) {
        return api.sendMessage("⚠ | Please provide a Terabox link.\nExample: terabox <url>", event.threadID, event.messageID);
      }

      const url = args.join(" ");
      const apiUrl = `https://nexalo-api.vercel.app/api/terabox-downloader?url=${encodeURIComponent(url)}`;

      api.sendMessage("⏳ | Fetching download link, please wait...", event.threadID, event.messageID);

      const res = await axios.get(apiUrl);
      if (!res.data || !res.data.data || !res.data.data.downloadUrl) {
        return api.sendMessage("❌ | Failed to fetch Terabox download link.", event.threadID, event.messageID);
      }

      const { fileName, downloadUrl } = res.data.data;

      // temp file path
      const filePath = path.join(__dirname, `${fileName || "terabox_file"}.mp4`);

      const writer = fs.createWriteStream(filePath);
      const response = await axios({
        url: downloadUrl,
        method: "GET",
        responseType: "stream"
      });
      response.data.pipe(writer);

      writer.on("finish", () => {
        api.sendMessage(
          {
            body: `✅ | File downloaded from Terabox:\n📂 ${fileName || "Unknown file"}`,
            attachment: fs.createReadStream(filePath)
          },
          event.threadID,
          () => fs.unlinkSync(filePath) // remove after sending
        );
      });

      writer.on("error", () => {
        api.sendMessage("❌ | Error downloading file.", event.threadID, event.messageID);
      });

    } catch (err) {
      console.error(err);
      api.sendMessage("⚠ | An error occurred while processing the request.", event.threadID, event.messageID);
    }
  }
};
