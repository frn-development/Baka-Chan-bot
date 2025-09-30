const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

module.exports = {
  config: {
    name: 'voice',
    aliases: ['voices'],
    version: '1.1',
    author: 'Farhan',
    prefix: true,
    description: 'List and send voices from GitHub repo using commit names.',
    category: 'media',
    guide: {
      en: '{pn}voice - list all voices\n{pn}voice <number> - send selected voice'
    }
  },

  onStart: async ({ api, event, args }) => {
    const threadID = event.threadID;
    const messageID = event.messageID;

    try {
      const statusMsg = await new Promise((resolve, reject) => {
        api.sendMessage('🔎 Fetching voices from GitHub...', threadID, (err, info) => {
          if (err) reject(err);
          else resolve(info);
        }, messageID);
      });

      const repoOwner = 'Gtajisan';
      const repoName = 'voice-bot';
      const folderPath = 'public';

      // Get all mp3 files
      const res = await axios.get(`https://api.github.com/repos/${repoOwner}/${repoName}/contents/${folderPath}`);
      const mp3Files = res.data.filter(file => file.name.endsWith('.mp3'));

      if (!mp3Files.length) {
        return api.editMessage('❌ No voices found.', statusMsg.messageID);
      }

      // Fetch commit messages for each file
      const fileList = [];
      for (const file of mp3Files) {
        const commits = await axios.get(`https://api.github.com/repos/${repoOwner}/${repoName}/commits?path=${folderPath}/${encodeURIComponent(file.name)}&per_page=1`);
        const commitMsg = commits.data[0]?.commit?.message || file.name;
        fileList.push({ name: commitMsg, url: file.download_url });
      }

      if (!args[0]) {
        // List all voices
        let listText = '🎵 Voice List (from commit names):\n\n';
        fileList.forEach((file, idx) => listText += `${idx + 1}. ${file.name}\n`);
        return api.editMessage(listText, statusMsg.messageID);
      }

      // User selected number
      const index = parseInt(args[0]) - 1;
      if (isNaN(index) || index < 0 || index >= fileList.length) {
        return api.editMessage('❌ Invalid selection number!', statusMsg.messageID);
      }

      await api.editMessage('⬇️ Downloading voice...', statusMsg.messageID);

      // Download MP3 temporarily
      const tempPath = path.join(__dirname, `voice_${Date.now()}.mp3`);
      const mp3Res = await axios.get(fileList[index].url, { responseType: 'arraybuffer' });
      await fs.writeFile(tempPath, Buffer.from(mp3Res.data));

      // Send MP3
      await new Promise((resolve, reject) => {
        api.sendMessage({
          body: `🎤 Sending voice: ${fileList[index].name}`,
          attachment: fs.createReadStream(tempPath)
        }, threadID, (err) => {
          fs.unlink(tempPath).catch(() => {});
          if (err) reject(err);
          else resolve();
        }, messageID);
      });

      await api.unsendMessage(statusMsg.messageID);

    } catch (error) {
      console.error('[voice] Error:', error);
      api.sendMessage('❌ Error occurred while processing your request.', threadID, messageID);
    }
  }
};
  
