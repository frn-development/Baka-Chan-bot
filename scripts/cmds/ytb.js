const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');
const { createReadStream } = require('fs');

const YTSEARCH_API_URL = 'https://nexalo-api.vercel.app/api/ytsearch';
const YTDL_API_URL = 'https://hridoy-apis.onrender.com/downloaders/ytdlv2';

const IMAGES = [
  'https://i.ibb.co/jZjDNcNr/2151002535.jpg',
  'https://i.ibb.co/gM1BMnnH/2151002609.jpg',
  'https://i.ibb.co/Mk0dnktq/2151645896.jpg',
  'https://i.ibb.co/k21pW1TF/2151995300.jpg',
  'https://i.ibb.co/hJyV5B46/2151995301.jpg',
  'https://i.ibb.co/JR57bL4T/2151995303.jpg',
  'https://i.ibb.co/GfM3wjVd/2151995312.jpg'
];


const createAxiosConfig = (timeout = 15000, isDownload = false) => ({
  timeout,
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Accept': isDownload ? 'video/mp4, video/*, */*' : 'application/json, text/plain, */*',
    'Accept-Language': 'en-US,en;q=0.9',
    'Accept-Encoding': 'gzip, deflate, br',
    'Connection': 'keep-alive',
    'Upgrade-Insecure-Requests': '1',
    'Sec-Fetch-Dest': isDownload ? 'video' : 'empty',
    'Sec-Fetch-Mode': 'cors',
    'Sec-Fetch-Site': 'cross-site'
  },
  maxRedirects: 5,
  responseType: isDownload ? 'arraybuffer' : 'json'
});


const retryRequest = async (requestFunc, maxRetries = 3, baseDelay = 1000) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await requestFunc();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      
      const delay = baseDelay * Math.pow(2, i) + Math.random() * 1000;
      console.log(`Retry ${i + 1}/${maxRetries} after ${Math.round(delay)}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
};


const downloadVideo = async (url, outputPath) => {
  console.log(`Downloading video from: ${url.substring(0, 100)}...`);
  
  const downloadAttempts = [
  
    async () => {
      console.log('Attempting direct download...');
      const response = await axios.get(url, createAxiosConfig(45000, true));
      return response;
    },
    
   
    async () => {
      console.log('Attempting download with mobile user agent...');
      const response = await axios.get(url, {
        ...createAxiosConfig(45000, true),
        headers: {
          'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0.3 Mobile/15E148 Safari/604.1'
        }
      });
      return response;
    },
    
    async () => {
      console.log('Attempting download with curl headers...');
      const response = await axios.get(url, {
        timeout: 45000,
        headers: {
          'User-Agent': 'curl/7.68.0',
          'Accept': '*/*'
        },
        responseType: 'arraybuffer'
      });
      return response;
    }
  ];

  for (let i = 0; i < downloadAttempts.length; i++) {
    try {
      const response = await downloadAttempts[i]();
      
      if (response.status === 200 && response.data && response.data.byteLength > 1000) {
        const buffer = Buffer.from(response.data);
        await fs.writeFile(outputPath, buffer);
        
        const stats = await fs.stat(outputPath);
        if (stats.size > 1000) {
          console.log(`Download successful! File size: ${stats.size} bytes`);
          return true;
        } else {
          throw new Error('Downloaded file is too small');
        }
      } else {
        throw new Error(`Invalid response: status ${response.status}`);
      }
    } catch (error) {
      console.log(`Download attempt ${i + 1} failed:`, error.message);
      if (i === downloadAttempts.length - 1) {
        throw error;
      }
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
};

module.exports = {
  config: {
    name: 'ytb',
    version: '1.3',
    author: 'Farhan',
    countDown: 5,
    prefix: true,
    description: 'Search and download YouTube videos (reply with 1-5)',
    category: 'media',
    guide: {
      en: '{pn}ytb <video name> (then reply 1-5 to choose)'
    }
  },

  onStart: async ({ api, event, args }) => {
    const threadID = event.threadID;
    const messageID = event.messageID;
    const senderID = event.senderID;

    try {
      const query = args.join(' ').trim();
      if (!query) {
        return api.sendMessage('❌ Please provide a video name. Example: ytb Starboy music video', threadID, messageID);
      }

  
      const ytRes = await retryRequest(async () => {
        return await axios.get(`${YTSEARCH_API_URL}?query=${encodeURIComponent(query)}`, createAxiosConfig(10000));
      });

      if (!ytRes.data || ytRes.data.code !== 200 || !Array.isArray(ytRes.data.data) || ytRes.data.data.length === 0) {
        return api.sendMessage('❌ No video results found.', threadID, messageID);
      }

      const top5 = ytRes.data.data.slice(0, 5);
      let listText = '🎬 Reply with a number (1-5) to select a video:\n';
      top5.forEach((v, i) => {
        listText += `\n${i + 1}. ${v.title} [${v.duration}]`;
      });

  
      const previewImageUrl = IMAGES[Math.floor(Math.random() * IMAGES.length)];
      const cacheDir = path.resolve(__dirname, 'cache');
      await fs.ensureDir(cacheDir);
      const previewImagePath = path.resolve(cacheDir, `preview_${threadID}.jpg`);

      try {
        const imgResp = await axios.get(previewImageUrl, createAxiosConfig(10000, true));
        await fs.writeFile(previewImagePath, Buffer.from(imgResp.data));
      } catch (imgError) {
        console.log('Failed to download preview image:', imgError.message);
      }

    
      const sentMsg = await new Promise((resolve, reject) => {
        const messageData = { body: listText };
        
        if (fs.existsSync(previewImagePath)) {
          messageData.attachment = createReadStream(previewImagePath);
        }
        
        api.sendMessage(
          messageData,
          threadID,
          (err, info) => {
            if (fs.existsSync(previewImagePath)) {
              fs.unlink(previewImagePath).catch(() => {});
            }
            if (err) reject(err);
            else resolve(info);
          },
          messageID
        );
      });

     
      global.client.handleReply.push({
        name: 'ytb',
        messageID: sentMsg.messageID,
        threadID,
        senderID,
        timestamp: Date.now(),
        top5,
        listMessageID: sentMsg.messageID
      });

  
      setTimeout(() => {
        const index = global.client.handleReply.findIndex(e => e.messageID === sentMsg.messageID);
        if (index !== -1) global.client.handleReply.splice(index, 1);
      }, 120000);

    } catch (error) {
      console.error('[ytb] Error onStart:', error);
      api.sendMessage(`❌ Error: ${error.message}`, threadID, messageID);
    }
  },

  handleReply: async ({ api, event }) => {
    const threadID = event.threadID;
    const messageID = event.messageID;
    const senderID = event.senderID;

    try {
      const replyText = event.body.trim();
      const handleReply = global.client.handleReply.find(
        r => r.messageID === event.messageReply?.messageID && r.name === 'ytb'
      );

      if (!handleReply) {
        return api.sendMessage('❌ This is not a reply to my message.', threadID, messageID);
      }

      if (!['1', '2', '3', '4', '5'].includes(replyText)) {
        return api.sendMessage('❌ Please reply with a number between 1 and 5.', threadID, messageID);
      }

      const index = parseInt(replyText) - 1;
      const video = handleReply.top5[index];
      if (!video) {
        return api.sendMessage('❌ Invalid selection.', threadID, messageID);
      }

      const videoUrl = `https://www.youtube.com/watch?v=${video.videoId}`;


      const requestingMsg = await new Promise((resolve, reject) => {
        api.sendMessage('⏳ Requesting video download link...', threadID, (err, info) => {
          if (err) reject(err);
          else resolve(info);
        }, messageID);
      });

      let downloadUrl, title;


      try {
        console.log('Requesting video from new API...');
        await new Promise(r => setTimeout(r, 2000));
        
        const ytdlRes = await retryRequest(async () => {
          return await axios.get(
            `${YTDL_API_URL}?url=${encodeURIComponent(videoUrl)}&format=1080&type=video`,
            createAxiosConfig(30000)
          );
        }, 5, 2000); 

        console.log('New API response:', ytdlRes.data);

        if (ytdlRes.data && ytdlRes.data.status && ytdlRes.data.result?.downloadUrl) {
          downloadUrl = ytdlRes.data.result.downloadUrl;
          title = ytdlRes.data.result.title || video.title;
          
         
          await api.editMessage('✅ Request success!\n⏬ Downloading video...', requestingMsg.messageID);
        } else {
          throw new Error('New API returned invalid response');
        }
      } catch (error) {
        console.error('New API failed:', error.message);
        throw new Error(`Failed to get download URL: ${error.message}`);
      }

      if (!downloadUrl) {
        throw new Error('No download URL obtained from API');
      }


      await api.editMessage('📥 Downloading video file...', requestingMsg.messageID);

      
      const cacheDir = path.resolve(__dirname, 'cache');
      await fs.ensureDir(cacheDir);
      const videoPath = path.resolve(cacheDir, `video_${threadID}_${Date.now()}.mp4`);

      try {
        await downloadVideo(downloadUrl, videoPath);
      } catch (downloadError) {
        console.error('Video download failed:', downloadError.message);
   
        try {
          console.log('Attempting direct buffer download...');
          const response = await axios.get(downloadUrl, createAxiosConfig(45000, true));
          
          if (response.status === 200 && response.data && response.data.byteLength > 1000) {
            const buffer = Buffer.from(response.data);
            await fs.writeFile(videoPath, buffer);
            console.log(`Direct buffer download successful! File size: ${buffer.length} bytes`);
          } else {
            throw new Error('Direct buffer download failed');
          }
        } catch (bufferError) {
          console.error('Buffer download failed:', bufferError.message);
          throw new Error(`Failed to download video: ${downloadError.message}`);
        }
      }


      await api.editMessage('📤 Preparing video for upload...', requestingMsg.messageID);

     
      const stats = await fs.stat(videoPath);
      const fileSizeMB = stats.size / (1024 * 1024);
      
      if (fileSizeMB > 25) {
        await fs.unlink(videoPath);
        throw new Error(`Video file is too large (${fileSizeMB.toFixed(2)}MB). Facebook Messenger limit is 25MB.`);
      }

  
      await new Promise((resolve, reject) => {
        api.sendMessage(
          {
            body: `🎬 Here's your video: "${title}" [${video.duration}]\n📁 File size: ${fileSizeMB.toFixed(2)}MB\n✅ Download completed successfully!`,
            attachment: createReadStream(videoPath)
          },
          threadID,
          (err) => {
            fs.unlink(videoPath).catch(() => {});
            if (err) reject(err);
            else resolve();
          },
          messageID
        );
      });


      if (handleReply.listMessageID) {
        await api.unsendMessage(handleReply.listMessageID);
      }
      if (requestingMsg?.messageID) {
        await api.unsendMessage(requestingMsg.messageID);
      }

      api.setMessageReaction('✅', messageID, () => {}, true);


      const idx = global.client.handleReply.findIndex(r => r.messageID === handleReply.messageID);
      if (idx !== -1) global.client.handleReply.splice(idx, 1);

    } catch (error) {
      console.error('[ytb] handleReply error:', error);
      api.sendMessage(`❌ Error: ${error.message}`, threadID, messageID);
    }
  }
};
