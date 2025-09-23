const fs = require('fs');
const path = require('path');
const axios = require('axios');

module.exports = {
  config: {
    name: 'nano',
    version: '1.0',
    author: 'Hridoy',
    countDown: 5,
    prefix: true,
    groupAdminOnly: false,
    description: 'Enhance or transform image using Gemini Nano Titanium API.',
    category: 'media',
    guide: {
      en: '{pn} [reply to image] | [prompt]'
    }
  },
  langs: {
    vi: {
      missingImage: 'Vui lòng reply một hình ảnh để xử lý',
      missingPrompt: 'Vui lòng cung cấp prompt để tạo ảnh',
      error: 'Đã xảy ra lỗi khi xử lý hình ảnh',
      processing: 'Đang xử lý hình ảnh của bạn'
    },
    en: {
      missingImage: 'Please reply to an image to process',
      missingPrompt: 'Please provide a prompt for image transformation',
      error: 'An error occurred while processing the image',
      processing: 'Processing your image'
    }
  },
  onStart: async ({ api, event, getLang, args }) => {
    if (!event.messageReply || !event.messageReply.attachments || event.messageReply.attachments.length === 0) {
      return api.sendMessage(getLang('missingImage'), event.threadID);
    }

    const prompt = args.join(' ');
    if (!prompt) return api.sendMessage(getLang('missingPrompt'), event.threadID);

    const imageUrl = event.messageReply.attachments[0].url;
    const apiUrl = `https://nexalo-api.vercel.app/api/ai-canvas?url=${encodeURIComponent(imageUrl)}&prompt=${encodeURIComponent(prompt)}`;

    const cacheDir = path.join(__dirname, 'cache');
    const imagePath = path.join(cacheDir, `nano_${event.senderID}_${Date.now()}.png`);

    try {
      if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);

      const msgSend = await api.sendMessage(getLang('processing'), event.threadID);
      const response = await axios.get(apiUrl, { responseType: 'json' });

      if (!response.data || !response.data.result) {
        await api.sendMessage(getLang('error'), event.threadID);
        return api.unsendMessage(msgSend.messageID);
      }

      const imageResponse = await axios.get(response.data.result, { responseType: 'arraybuffer' });
      fs.writeFileSync(imagePath, Buffer.from(imageResponse.data, 'binary'));

      await api.sendMessage({
        body: 'Here is your Nano image 🌟',
        attachment: fs.createReadStream(imagePath)
      }, event.threadID);

      await api.unsendMessage(msgSend.messageID);
      fs.unlinkSync(imagePath);
    } catch (error) {
      console.error('Error processing Nano image:', error);
      await api.sendMessage(getLang('error'), event.threadID);
      if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
    }
  }
};
