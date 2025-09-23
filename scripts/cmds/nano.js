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

    if (!event.messageReply || !event?.messageReply?.attachments[0]?.url) {
      return message.reply('❌ | Reply to an image');
    } else if (!prompt) {
      return message.reply("❌ | Provide a prompt");
    }

    const replyImageUrl = event.messageReply.attachments[0].url;
    message.reaction("⏳", event.messageID);

    try {
      const url = `https://nexalo-api.vercel.app/api/ai-canvas?url=${encodeURIComponent(replyImageUrl)}&prompt=${encodeURIComponent(prompt)}`;
      const res = await axios.get(url);

      if (!res.data?.result) {
        return message.reply("❌ | Failed to generate image");
      }

      await message.reply({
        body: `✅ | Image edited successfully`,
        attachment: await global.utils.getStreamFromURL(res.data.result, 'nano.png')
      });

    } catch (error) {
      message.send("❌ | " + error.message);
    }
  }
};
