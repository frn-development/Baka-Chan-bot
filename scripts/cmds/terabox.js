const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "terabox",
    aliases: ["tb"],
    version: "3.1",
    author: "Farhan",
    countDown: 5,
    role: 0,
    shortDescription: {
      en: "Download video directly from Terabox"
    },
    longDescription: {
      en: "Fetch and send video file directly using Terabox Downloader API."
    },
    category: "media",
    guide: {
      en: "{pn} <terabox_url>"
    }
  },

  onStart: async function ({ api, event, args }) {
    try {
      if (args.length === 0) {
        return api.sendMessage(
          "⚠ | Please provide a Terabox link.\nExample: terabox <url>",
          event.threadID,
          event.messageID
        );
      }

      const url = args.join(" ");
      const apiUrl = `https://nexalo-api.vercel.app/api/terabox-downloader?url=${encodeURIComponent(url)}`;

      api.sendMessage("⏳ | Fetching file, please wait...", event.threadID, event.messageID);

      const res = await axios.get(apiUrl);
      const data = res.data;

      if (!data.success || !data.downloadUrl) {
        return api.sendMessage("❌ | Failed to fetch Terabox file.", event.threadID, event.messageID);
      }

      const { title, size, mimetype, downloadUrl, platform } = data;

      // Convert size
      const sizeMB = (parseInt(size) / (1024 * 1024)).toFixed(2);
      const sizeGB = (parseInt(size) / (1024 * 1024 * 1024)).toFixed(2);
      const readableSize = sizeGB >= 1 ? `${sizeGB} GB` : `${sizeMB} MB`;

      // If file <= 25MB, send directly
      if (parseInt(size) <= 25 * 1024 * 1024) {
        const safeFileName = title || "terabox_file";
        const filePath = path.join(__dirname, safeFileName);

        const writer = fs.createWriteStream(filePath);
        const response = await axios({
          url: downloadUrl,
          method: "GET",
          responseType: "stream",
          maxRedirects: 5
        });

        response.data.pipe(writer);

        writer.on("finish", () => {
          api.sendMessage(
            {
              body: `✅ File from ${platform}\n📂 ${title}\n📦 ${readableSize}\n📄 ${mimetype}`,
              attachment: fs.createReadStream(filePath)
            },
            event.threadID,
            () => fs.unlinkSync(filePath)
          );
        });

        writer.on("error", () => {
          api.sendMessage("❌ | Error downloading file.", event.threadID, event.messageID);
        });
      } else {
        // Too big for Messenger → only send info + link
        api.sendMessage(
          `⚠ | File too large for Messenger.\n\n✅ File from ${platform}\n📂 ${title}\n📦 ${readableSize}\n📄 ${mimetype}\n🔗 Download: ${downloadUrl}`,
          event.threadID,
          event.messageID
        );
      }
    } catch (err) {
      console.error("Terabox Error:", err.message);
      api.sendMessage("⚠ | An error occurred while processing the request.", event.threadID, event.messageID);
    }
  }
};
