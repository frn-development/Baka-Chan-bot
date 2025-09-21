const fs = require('fs');
const path = require('path');
const axios = require('axios');
const fsExtra = require('fs-extra');
const config = require('../../config/config.dev.json'); // your config file

module.exports = {
  config: {
    name: 'GitHub', // renamed command
    version: '1.0.3',
    author: 'frnwot',
    countDown: 5,
    prefix: true,
    groupAdminOnly: false,
    description: 'Fetches GitHub user details for a given username.',
    category: 'media',
    guide: '{pn}GitHub <username>'
  },
  langs: {
    en: {
      missingUsername: '⚠️ Please provide a GitHub username. Usage: {pn}GitHub <username>',
      userNotFound: '❌ Failed to fetch GitHub user details. User not found or API error.',
      fetching: '⏳ Fetching GitHub user details...'
    }
  },
  onStart: async ({ api, event, args, getLang }) => {
    if (!args[0]) return api.sendMessage(getLang('missingUsername'), event.threadID);

    const username = args[0];
    const githubApiUrl = `https://api.github.com/users/${username}`;
    const tempDir = path.join(__dirname, '../../temp');
    const tempFilePath = path.join(tempDir, `github_${username}.png`);

    try {
      if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);

      const waitMsg = await api.sendMessage(getLang('fetching'), event.threadID);

      const response = await axios.get(githubApiUrl);
      const userData = response.data;

      if (!userData || !userData.login) {
        await api.unsendMessage(waitMsg.messageID);
        return api.sendMessage(getLang('userNotFound'), event.threadID);
      }

      const imageResponse = await axios.get(userData.avatar_url, { responseType: 'arraybuffer' });
      fs.writeFileSync(tempFilePath, Buffer.from(imageResponse.data, 'binary'));

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
        event.threadID
      );

      await api.unsendMessage(waitMsg.messageID);
      fs.unlinkSync(tempFilePath);

    } catch (error) {
      console.error('Error fetching GitHub user:', error);
      await api.sendMessage(getLang('userNotFound'), event.threadID);
      if (fs.existsSync(tempFilePath)) fs.unlinkSync(tempFilePath);
    }
  }
};
