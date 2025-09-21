const axios = require('axios');
const fs = require('fs');
const fsExtra = require('fs-extra');
const path = require('path');
const config = require('../../config/config.dev.json'); // fixed path

module.exports = {
  config: {
    name: "github",
    version: "1.0.1",
    author: "frnwot",
    description: "Fetches GitHub user details for a given username.",
    category: "media",
    guide: "{pn}github <username>",
    cooldowns: 5,
    prefix: true,
    adminOnly: false,
  },

  langs: {
    en: {
      missingUsername: "⚠️ Please provide a GitHub username. Usage: {pn}github <username>",
      userNotFound: "❌ Failed to fetch GitHub user details. User not found or API error.",
      fetching: "⏳ Fetching GitHub user details..."
    }
  },

  onStart: async ({ api, event, args, getLang }) => {
    if (!args[0]) return api.sendMessage(getLang("missingUsername"), event.threadID);

    const username = args[0];
    const githubApiUrl = `https://api.github.com/users/${username}`;

    const waitMsg = await api.sendMessage(getLang("fetching"), event.threadID);

    try {
      const response = await axios.get(githubApiUrl);
      const userData = response.data;

      if (!userData || !userData.login) {
        await api.unsendMessage(waitMsg.messageID);
        return api.sendMessage(getLang("userNotFound"), event.threadID);
      }

      const profilePicUrl = userData.avatar_url;
      const tempDir = path.join(__dirname, '../../temp');
      await fsExtra.ensureDir(tempDir);
      const tempFilePath = path.join(tempDir, `github_${username}.png`);

      const imageResponse = await axios.get(profilePicUrl, { responseType: 'arraybuffer' });
      await fsExtra.writeFile(tempFilePath, imageResponse.data);

      const userDetails = [
        `╔═━─[ ${config.nickNameBot} GITHUB USER ]─━═╗`,
        `┃ Username: ${userData.login}`,
        `┃ Bio: ${userData.bio || 'Not set'}`,
        `┃ Followers: ${userData.followers}`,
        `┃ Following: ${userData.following}`,
        `┃ Public Repos: ${userData.public_repos}`,
        `┃ Profile: ${userData.html_url}`,
        `╚═━──────────────────────────────━═╝`
      ].join('\n');

      await api.sendMessage(
        {
          body: userDetails,
          attachment: fs.createReadStream(tempFilePath)
        },
        event.threadID,
        () => {
          fsExtra.unlink(tempFilePath);
          api.unsendMessage(waitMsg.messageID);
        }
      );
    } catch (error) {
      console.error(error);
      await api.sendMessage(getLang("userNotFound"), event.threadID);
      if (waitMsg?.messageID) await api.unsendMessage(waitMsg.messageID);
    }
  }
};
