const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "sigma",
    aliases: ["sigmaimg", "profile"],
    version: "2.1",
    author: "Farhan",
    countDown: 5,
    role: 0,
    shortDescription: "Generate Sigma profile image",
    longDescription: "Creates a Sigma-themed profile image using UID (auto-detect from tag, reply, or self).",
    category: "fun",
    guide: {
      en: "{p}{n} [@tag | reply | blank]",
    },
  },

  onStart: async function ({ message, event }) {
    try {
      let uid;

      // ✅ If user replies to someone
      if (event.messageReply) {
        uid = event.messageReply.senderID;
      }
      // ✅ If user tags someone
      else if (Object.keys(event.mentions).length > 0) {
        uid = Object.keys(event.mentions)[0];
      }
      // ✅ Default: use sender’s own UID
      else {
        uid = event.senderID;
      }

      const apiUrl = `https://neokex-apis.onrender.com/generate_profile_image?uid=${uid}`;
      const filePath = path.join(__dirname, "sigma.png");

      const response = await axios({
        url: apiUrl,
        method: "GET",
        responseType: "stream",
      });

      const writer = fs.createWriteStream(filePath);
      response.data.pipe(writer);

      writer.on("finish", () => {
        message.reply({
          body: `🔥 Sigma Profile Image for @${uid}`,
          mentions: [{ id: uid, tag: "user" }],
          attachment: fs.createReadStream(filePath),
        });
      });

      writer.on("error", () => {
        message.reply("❌ Failed to generate image. Try again later.");
      });
    } catch (error) {
      console.error(error);
      message.reply("🚨 API error, please try again later.");
    }
  },
};
      
