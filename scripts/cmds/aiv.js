const fs = require('fs');
const path = require('path');
const axios = require('axios');

module.exports = {
  config: {
    name: 'aiv',
    version: '1.0',
    author: 'Farhan',
    countDown: 5,
    prefix: true,
    groupAdminOnly: false,
    description: 'Generate AI Vision styled image from photo with prompt.',
    category: 'media',
    guide: {
      en: '{pn} <prompt> [reply to image]'
    }
  },
  langs: {
    vi: {
      missingPrompt: 'Vui lòng nhập prompt (ví dụ: aiv anime style)',
      missingImage: 'Vui lòng reply một hình ảnh để tạo AI Vision',
      error: 'Đã xảy ra lỗi khi xử lý hình ảnh',
      processing: 'Đang xử lý hình ảnh của bạn...'
    },
    en: {
      missingPrompt: 'Please provide a prompt (example: aiv anime style)',
      missingImage: 'Please reply to an image to generate AI Vision',
      error: 'An error occurred while processing the image',
      processing: 'Processing your image...'
    }
  },

  onStart: async ({ api, event, args, getLang }) => {
    if (args.length === 0) {
      return api.sendMessage(getLang('missingPrompt'), event.threadID);
    }
    if (!event.messageReply || !event.messageReply.attachments || event.messageReply.attachments.length === 0) {
      return api.sendMessage(getLang('missingImage'), event.threadID);
    }

    const prompt = args.join(" ");
    const imageUrl = event.messageReply.attachments[0].url;
    const apiUrl = `https://hridoy-apis.vercel.app/ai-image/aivison?prompt=${encodeURIComponent(prompt)}&url=${encodeURIComponent(imageUrl)}&apikey=hridoyXQC`;

    const cacheDir = path.join(__dirname, 'cache');
    const imagePath = path.join(cacheDir, `aiv_${event.senderID}_${Date.now()}.png`);

    try {
      if (!fs.existsSync(cacheDir)) {
        fs.mkdirSync(cacheDir);
      }

      const msgSend = await api.sendMessage(getLang('processing'), event.threadID);
      const response = await axios.get(apiUrl, { responseType: 'json' });

      if (!response.data.status || !response.data.result) {
        await api.sendMessage(getLang('error'), event.threadID);
        return api.unsendMessage(msgSend.messageID);
      }

      const imageResponse = await axios.get(response.data.result, { responseType: 'arraybuffer' });
      fs.writeFileSync(imagePath, Buffer.from(imageResponse.data, 'binary'));

      await api.sendMessage({
        body: `👁️ AI Vision Result\n📝 Prompt: ${prompt}`,
        attachment: fs.createReadStream(imagePath)
      }, event.threadID);

      await api.unsendMessage(msgSend.messageID);
      fs.unlinkSync(imagePath);
    } catch (error) {
      console.error('Error processing AI Vision image:', error);
      await api.sendMessage(getLang('error'), event.threadID);
      if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
    }
  }
};
