const axios = require("axios");

module.exports = {
  config: {
    name: "remini1",
    version: "1.0",
    author: "Farhan",
    countDown: 5,
    role: 0,
    shortDescription: {
      vi: "Cải thiện chất lượng ảnh bằng Remini",
      en: "Enhance image quality using Remini"
    },
    longDescription: {
      vi: "Cải thiện chất lượng ảnh bằng API Remini",
      en: "Enhance image quality using Remini API"
    },
    category: "media",
    guide: {
      en: "Reply to an image with {pn}"
    }
  },

  langs: {
    vi: {
      missingImage: "Vui lòng reply một hình ảnh để cải thiện",
      error: "Đã xảy ra lỗi khi xử lý hình ảnh",
      processing: "Đang xử lý hình ảnh của bạn..."
    },
    en: {
      missingImage: "⚠️ Please reply to an image to enhance",
      error: "❌ An error occurred while processing the image",
      processing: "⏳ Processing your image..."
    }
  },

  onStart: async function ({ message, event, getLang }) {
    // Check if user replied to an image
    if (
      !event.messageReply ||
      !event.messageReply.attachments ||
      event.messageReply.attachments.length === 0
    ) {
      return message.reply(getLang("missingImage"));
    }

    const imageUrl = event.messageReply.attachments[0].url;
    const msgSend = message.reply(getLang("processing"));

    try {
      // Call Remini API
      const response = await axios.get(
        `https://hridoy-apis.vercel.app/tools/remini?url=${encodeURIComponent(imageUrl)}&apikey=hridoyXQC`,
        { responseType: "json" }
      );

      if (!response.data.status || !response.data.result) {
        message.unsend((await msgSend).messageID);
        return message.reply(getLang("error"));
      }

      // Fetch enhanced image
      const imageStream = await axios({
        url: response.data.result,
        responseType: "stream"
      });

      imageStream.data.path = global.utils.randomString(10) + ".png";

      // Send enhanced image back
      message.reply(
        { attachment: imageStream.data },
        async () => message.unsend((await msgSend).messageID)
      );
    } catch (err) {
      console.error(err);
      message.unsend((await msgSend).messageID);
      return message.reply(getLang("error"));
    }
  }
};
  
