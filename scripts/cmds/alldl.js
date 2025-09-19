const axios = require("axios");
const fs = require("fs-extra");

const baseApiUrl = async () => {
  const base = await axios.get(
    `https://raw.githubusercontent.com/Mostakim0978/D1PT0/refs/heads/main/baseApiUrl.json`
  );
  return base.data.api;
};

module.exports = {
  config: {
    name: "alldl",
    version: "1.0.5",
    author: "based",
    countDown: 2,
    role: 0,
    description: {
      en: "Download video from TikTok, Facebook, Instagram, YouTube, Imgur, and more.",
    },
    category: "MEDIA",
    guide: {
      en: "[video_link]",
    },
  },

  onStart: async function ({ api, args, event }) {
    const dipto = event.messageReply?.body || args[0];

    if (!dipto) {
      return api.setMessageReaction("❌", event.messageID, () => {}, true);
    }

    try {
      api.setMessageReaction("⏳", event.messageID, () => {}, true);

      // Call API
      const { data } = await axios.get(
        `${await baseApiUrl()}/alldl?url=${encodeURIComponent(dipto)}`
      );

      if (!data || !data.result) {
        api.setMessageReaction("❎", event.messageID, () => {}, true);
        return api.sendMessage(
          "⚠️ Could not fetch a valid download link. Please try another URL.",
          event.threadID,
          event.messageID
        );
      }

      // Ensure cache directory exists
      const cacheDir = __dirname + "/cache";
      if (!fs.existsSync(cacheDir)) {
        fs.mkdirSync(cacheDir, { recursive: true });
      }

      // Save video/photo
      const filePath = `${cacheDir}/download.mp4`;
      const fileBuffer = (
        await axios.get(data.result, { responseType: "arraybuffer" })
      ).data;
      fs.writeFileSync(filePath, Buffer.from(fileBuffer));

      // Shorten URL if utils exists
      let shortUrl = data.result;
      if (global.utils && global.utils.shortenURL) {
        try {
          shortUrl = await global.utils.shortenURL(data.result);
        } catch (e) {
          shortUrl = data.result; // fallback
        }
      }

      // Success Reaction + Send File
      api.setMessageReaction("✅", event.messageID, () => {}, true);
      api.sendMessage(
        {
          body: `${data.cp || "✅ Download Complete"}\nLink: ${shortUrl}`,
          attachment: fs.createReadStream(filePath),
        },
        event.threadID,
        () => fs.unlinkSync(filePath),
        event.messageID
      );

      // Imgur Direct Download
      if (dipto.startsWith("https://i.imgur.com")) {
        const diptoExt = dipto.substring(dipto.lastIndexOf("."));
        const imgBuffer = (
          await axios.get(dipto, { responseType: "arraybuffer" })
        ).data;

        const filename = `${cacheDir}/dipto${diptoExt}`;
        fs.writeFileSync(filename, Buffer.from(imgBuffer));

        api.sendMessage(
          {
            body: `✅ | Downloaded from Imgur`,
            attachment: fs.createReadStream(filename),
          },
          event.threadID,
          () => fs.unlinkSync(filename),
          event.messageID
        );
      }
    } catch (error) {
      api.setMessageReaction("❎", event.messageID, () => {}, true);
      api.sendMessage(
        `❌ Error: ${error.message}`,
        event.threadID,
        event.messageID
      );
    }
  },
};
                           
