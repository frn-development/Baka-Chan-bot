const axios = require('axios');

module.exports = {
  config: {
    name: "nano",
    author: "Farhan",
    category: "media",
    countDown: 5,
    role: 0,
    guide: { en: "nano <prompt> | reply to image OR nano <image_url> <prompt>" }
  },

  onStart: async function({ message, event, args }) {
    let imageUrl = null;
    let prompt = null;

    // Case 1: Reply to an image
    if (event.messageReply && event.messageReply.attachments?.[0]?.url) {
      imageUrl = event.messageReply.attachments[0].url;
      prompt = args.join(" ");
    } else if (args.length >= 2) {
      // Case 2: Direct image URL + prompt
      imageUrl = args[0];
      prompt = args.slice(1).join(" ");
    }

    if (!imageUrl) return message.reply('❌ | Provide an image URL or reply to an image');
    if (!prompt) return message.reply('❌ | Provide a prompt');

    // Show processing reaction
    message.reaction("⏳", event.messageID);

    const apiUrl = `https://nexalo-api.vercel.app/api/ai-canvas?url=${encodeURIComponent(imageUrl)}&prompt=${encodeURIComponent(prompt)}`;

    try {
      const res = await axios.get(apiUrl, { timeout: 30000 });

      const editedImageUrl = res.data?.data?.imageResponseVo?.urls?.[0];
      if (!editedImageUrl) {
        return message.reply("❌ | Nano API returned invalid data. Try again later.");
      }

      // Send edited image
      await message.reply({
        body: `✅ | Your image has been edited successfully! 🍌✨`,
        attachment: await global.utils.getStreamFromURL(editedImageUrl, 'nano.png')
      });

    } catch (error) {
      console.error('Nano API error:', error.message || error);
      message.reply("❌ | Failed to process image. Try again later.");
    }
  }
};
