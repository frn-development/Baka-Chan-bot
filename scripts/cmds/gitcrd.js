const axios = require('axios');
const fs = require('fs');
const path = require('path');

module.exports = {
  config: {
    name: "githubcrd",
    version: "1.0",
    author: "Farhan",
    role: 0,
    countDown: 5,
    shortDescription: "Generate a GitHub profile card",
    longDescription: "Uses the sus-apis GitHub-card API to generate a styled card image of a GitHub profile.",
    category: "utility",
    guide: {
      en: "{p}githubcrd <username>"
    }
  },

  onStart: async function({ api, event, message }) {
    const { threadID, senderID, args } = event;
    if (!args || args.length == 0) {
      return message.reply("⚠️ You must provide a GitHub username.\nUsage: {p}githubcrd <username>");
    }
    const username = args[0].trim();

    // Send a wait message
    const waitMsg = await message.reply(`🔍 Fetching GitHub card for **${username}**, please wait...`);

    try {
      // Call the API
      const apiUrl = `https://sus-apis.onrender.com/api/github-card?username=${encodeURIComponent(username)}`;
      const res = await axios.get(apiUrl, { responseType: 'arraybuffer' });

      // If API returns image data directly
      const buffer = Buffer.from(res.data, 'binary');

      // Save temporarily
      const cacheDir = path.join(__dirname, '..', 'cache');
      if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);
      const imagePath = path.join(cacheDir, `github_card_${username}_${Date.now()}.png`);
      fs.writeFileSync(imagePath, buffer);

      // Send it
      await message.reply({
        body: `📢 GitHub card for ${username}:`,
        attachment: fs.createReadStream(imagePath)
      });

      // Clean up
      fs.unlinkSync(imagePath);
      if (waitMsg?.messageID) api.unsendMessage(waitMsg.messageID);

    } catch (error) {
      console.error("Error in githubcrd command:", error);
      message.reply("❌ Failed to generate the GitHub card. Maybe the username is invalid or the API is down.");
      if (waitMsg?.messageID) api.unsendMessage(waitMsg.messageID);
    }
  }
};
