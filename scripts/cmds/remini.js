const fs = require('fs');
const path = require('path');
const axios = require('axios');

module.exports = {
  config: {
    name: 'remini',
    version: '1.0',
    author: 'Hridoy',
    countDown: 5,
    prefix: true,
    groupAdminOnly: false,
    description: 'Enhance image quality using Remini API.',
    category: 'media',
    guide: {
      en: '{pn} [reply to image]'
    }
  },
  langs: {
    vi: {
      missingImage: 'Vui lòng reply một hình ảnh để cải thiện',
      error: 'Đã xảy ra lỗi khi xử lý hình ảnh',
      processing: 'Đang xử lý hình ảnh của bạn'
    },
    en: {
      missingImage: 'Please reply to an image to enhance',
      error: 'An error occurred while processing the image',
      processing: 'Processing your image'
    }
  },
  onStart: async ({ api, event, getLang }) => {
    if (!event.messageReply || !event.messageReply.attachments || event.messageReply.attachments.length === 0) {
      return api.sendMessage(getLang('missingImage'), event.threadID);
    }

    const imageUrl = event.messageReply.attachments[0].url;
    const apiUrl = `https://hridoy-apis.vercel.app/tools/remini?url=${encodeURIComponent(imageUrl)}&apikey=hridoyXQC`;
    const cacheDir = path.join(__dirname, 'cache');
    const imagePath = path.join(cacheDir, `remini_${event.senderID}_${Date.now()}.png`);

    try {
      if (!fs.existsSync(cacheDir)) {
        fs.mkdirSync(cacheDir);
      }

      const msgSend = await api.sendMessage(getLang('processing'), event.threadID);
      const response = await axios.get(apiUrl, { responseType: 'json' });

      if (response.data.status !== true) {
        await api.sendMessage(getLang('error'), event.threadID);
        return api.unsendMessage(msgSend.messageID);
      }

      const imageResponse = await axios.get(response.data.result, { responseType: 'arraybuffer' });
      fs.writeFileSync(imagePath, Buffer.from(imageResponse.data, 'binary'));

      await api.sendMessage({
        body: 'Enhanced image 🌟',
        attachment: fs.createReadStream(imagePath)
      }, event.threadID);
      await api.unsendMessage(msgSend.messageID);
      fs.unlinkSync(imagePath);
    } catch (error) {
      console.error('Error processing Remini image:', error);
      await api.sendMessage(getLang('error'), event.threadID);
      if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
    }
  }
};
