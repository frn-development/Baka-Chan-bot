const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

const API_KEY = "2dd135a221496942fe64385de8c7e8fb"; // Put your Convertio API key here

module.exports = {
  config: {
    name: "convert",
    aliases: ["toaudio", "video2mp3", "mp3", "extractaudio"], // 👈 Added aliases
    Auth: 0,
    Owner: "Hina",
    Info: "🎥 Convert video to audio (mp3) using Convertio",
    Class: "✧༺Tools_Menu༻✧",
    How: "Reply to a video with: convert (or use any alias)"
  },

  onType: async function ({ event, sh }) {
    try {
      if (!event.messageReply || !event.messageReply.attachments?.length) {
        return sh.reply("⚠️ You need to reply to a video so I can convert it to audio.");
      }

      const file = event.messageReply.attachments[0];
      if (file.type !== "video") {
        return sh.reply("❌ You must reply to a *video*, not something else.");
      }

      const videoUrl = file.url;
      await sh.reply("⏳ Uploading video and converting to audio...");

      // 1) Upload video to Convertio
      const upload = await axios.post("https://api.convertio.co/convert", {
        apikey: API_KEY,
        input: "url",
        file: videoUrl,
        outputformat: "mp3"
      });

      if (!upload.data || upload.data.code !== 200) {
        return sh.reply("❌ Failed to upload file.");
      }

      const id = upload.data.data.id;

      // 2) Check conversion status
      let done = false, downloadUrl = null;
      for (let i = 0; i < 20; i++) { // up to 20 tries
        await new Promise(r => setTimeout(r, 5000)); // wait 5s
        const status = await axios.get(`https://api.convertio.co/convert/${id}/status`);

        if (status.data.data.step === "finish") {
          done = true;
          downloadUrl = status.data.data.output.url;
          break;
        }
      }

      if (!done || !downloadUrl) {
        return sh.reply("❌ Conversion failed or took too long.");
      }

      // 3) Download audio
      const audioPath = path.join(__dirname, "cache", `${Date.now()}.mp3`);
      const res = await axios.get(downloadUrl, { responseType: "arraybuffer" });
      await fs.outputFile(audioPath, res.data);

      // 4) Send audio
      await sh.reply({
        body: "✅ Video has been converted to audio (mp3):",
        attachment: fs.createReadStream(audioPath)
      });

      // Remove temp file
      setTimeout(() => fs.remove(audioPath), 10000);

    } catch (err) {
      console.error("convert error:", err.message);
      sh.reply("❌ An error occurred during conversion.");
    }
  }
};
        
