const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

module.exports = {
  config: {
    name: 'voice',
    aliases: ['voices'],
    version: '2.0',
    author: 'Farhan',
    prefix: true,
    description: 'List and send voices from GitHub repo, works reliably with replies.',
    category: 'media',
    guide: {
      en: '{pn}voice - list all voices\n{pn}voice <number> - send selected voice (reply to a message to send to that user)'
    }
  },

  onStart: async ({ api, event, args }) => {
    const threadID = event.threadID;
    const messageID = event.messageID;
    const replyUserID = event.messageReply?.senderID || null;

    try {
      // Status message
      const statusMsg = await new Promise((resolve, reject) => {
        api.sendMessage('🔎 Fetching voices from GitHub...', threadID, (err, info) => {
          if (err) reject(err);
          else resolve(info);
        }, messageID);
      });

      // GitHub public folder
      const repoUrl = 'https://api.github.com/repos/Gtajisan/voice-bot/contents/public';
      const res = await axios.get(repoUrl);
      const mp3Files = res.data.filter(file => file.name.endsWith('.mp3'));

      if (!mp3Files.length) {
        return api.editMessage('❌ No voices found.', statusMsg.messageID);
      }

      // Build file list
      const fileList = mp3Files.map((file, idx) => ({
        name: file.name, // simple file name, no commits
        url: file.download_url
      }));

      // No args: list voices
      if (!args[0]) {
        let listText = '🎵 Voice List:\n\n';
        fileList.forEach((file, idx) => listText += `${idx + 1}. ${file.name}\n`);
        return api.editMessage(listText, statusMsg.messageID);
      }

      // User selected number
      const index = parseInt(args[0]) - 1;
      if (isNaN(index) || index < 0 || index >= fileList.length)
        return api.editMessage('❌ Invalid selection number!', statusMsg.messageID);

      await api.editMessage('⬇️ Downloading voice...', statusMsg.messageID);

      // Download MP3
      const tempPath = path.join(__dirname, `voice_${Date.now()}.mp3`);
      const mp3Res = await axios.get(fileList[index].url, { responseType: 'arraybuffer' });
      await fs.writeFile(tempPath, Buffer.from(mp3Res.data));

      // Determine target thread
      const targetThread = replyUserID || threadID;

      // Send MP3
      await new Promise((resolve, reject) => {
        api.sendMessage({
          body: `🎤 Sending voice: ${fileList[index].name}`,
          attachment: fs.createReadStream(tempPath)
        }, targetThread, (err) => {
          fs.unlink(tempPath).catch(() => {});
          if (err) reject(err);
          else resolve();
        }, messageID);
      });

      // Remove status
      await api.unsendMessage(statusMsg.messageID);

    } catch (error) {
      console.error('[voice] Error:', error);
      api.sendMessage('❌ Error occurred while sending voice.', threadID, messageID);
    }
  }
};
