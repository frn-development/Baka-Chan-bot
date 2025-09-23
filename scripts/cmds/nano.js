const axios = require('axios');

module.exports = {
  config: {
    name: "nano",
    author: "Farhan",
    category: "media",
    countDown: 5,
    role: 0,
    guide: { en: "nano <prompt> | reply to image" }
  },

  onStart: async function({ message, event, args }) {
    const prompt = args.join(" ");
    if (!event.messageReply || !event?.messageReply?.attachments?.[0]?.url) {
      return message.reply('❌ | Reply to an image');
    }
    if (!prompt) {
      return message.reply("❌ | Provide a prompt");
    }

    const replyImageUrl = event.messageReply.attachments[0].url;
    message.reaction("⏳", event.messageID);

    const apiUrl = `https://nexalo-api.vercel.app/api/ai-canvas?url=${encodeURIComponent(replyImageUrl)}&prompt=${encodeURIComponent(prompt)}`;

    try {
      const res = await axios.get(apiUrl, { timeout: 30000 });

      if (!res.data || !res.data.result) {
        return message.reply("❌ | Nano API failed or returned invalid data. Try again later.");
      }

      await message.reply({
        body: `✅ | Your image has been edited successfully! 🍌✨`,
        attachment: await global.utils.getStreamFromURL(res.data.result, 'nano.png')
      });

    } catch (error) {
      console.error('Nano API error:', error.message || error);
      message.reply("❌ | Failed to process image. Try again later.");
    }
  }
};
