const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

module.exports = {
  config: {
    name: 'tt',
    version: '1.0',
    author: 'Farhan',
    countDown: 5,
    prefix: true,
    description: 'Search and get a random TikTok video by query.',
    category: 'media',
    guide: {
      en: '{pn}tt <any video query>'
    }
  },

  onStart: async ({ api, event, args }) => {
    const threadID = event.threadID;
    const messageID = event.messageID;
    const query = args.join(' ').trim();

    if (!query) {
      return api.sendMessage('❌ Please provide a video query. Example: tt freefire', threadID, messageID);
    }

    let statusMsg;
    try {
    
      statusMsg = await new Promise((resolve, reject) => {
        api.sendMessage('🔎 Searching TikTok videos...', threadID, (err, info) => {
          if (err) reject(err);
          else resolve(info);
        }, messageID);
      });

   
      const searchRes = await axios.get(`https://hridoy-apis.vercel.app/search/tiktok?query=${encodeURIComponent(query)}&count=5&apikey=hridoyXQC`);
      const videos = searchRes.data?.data?.videos;
      if (!Array.isArray(videos) || videos.length === 0) {
        await api.editMessage('❌ No TikTok videos found.', statusMsg.messageID);
        return;
      }

   
      const video = videos[Math.floor(Math.random() * videos.length)];
      if (!video?.wmplay) {
        await api.editMessage('❌ Could not get a valid TikTok video.', statusMsg.messageID);
        return;
      }

   
      await api.editMessage('⬇️ Downloading TikTok video...', statusMsg.messageID);


      const cacheDir = path.join(__dirname, 'cache');
      await fs.ensureDir(cacheDir);
      const filePath = path.join(cacheDir, `tt_${Date.now()}.mp4`);

      const vidRes = await axios.get(video.wmplay, { responseType: 'arraybuffer', timeout: 80000 });
      await fs.writeFile(filePath, Buffer.from(vidRes.data));


      const authorNick = video.author?.nickname || video.author?.unique_id || "Unknown";
      const title = video.title || "No title";
      const views = video.play_count?.toLocaleString?.() || video.play_count || "N/A";
      const duration = video.duration ? `${video.duration}s` : "N/A";

      await api.editMessage('📤 Sending video...', statusMsg.messageID);

 
      await new Promise((resolve, reject) => {
        api.sendMessage({
          body: `🎬 ${title}\n👤 Author: ${authorNick}\n👁️ Views: ${views}\n⏱️ Duration: ${duration}`,
          attachment: fs.createReadStream(filePath)
        }, threadID, (err) => {
          fs.unlink(filePath).catch(() => {});
          if (err) reject(err);
          else resolve();
        }, messageID);
      });

  
      if (statusMsg?.messageID) {
        await api.unsendMessage(statusMsg.messageID);
      }

    } catch (error) {
      console.error('[tt] Error:', error);
      if (statusMsg?.messageID) {
        await api.editMessage('❌ Error occurred while processing your TikTok request.', statusMsg.messageID);
        setTimeout(() => api.unsendMessage(statusMsg.messageID), 10000);
      } else {
        api.sendMessage('❌ Error occurred while processing your TikTok request.', threadID, messageID);
      }
    }
  }
};
