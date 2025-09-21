const axios = require('axios');

module.exports = {
  config: {
    name: "edit1",
    author: "frnwot",
    category: "media",
    countDown: 5,
    role: 0,
    guide: { en: "edit1 <prompt>" }
  },

  onStart: async function({ message, event, args }) {
    const prompt = args.join(" ");
    if (!prompt) {
      return message.reply("❌ | provide a prompt");
    }

    message.reaction("⏳", event.messageID);

    try {
      let url = `https://aryan-nix-apis.vercel.app/api/gemini?prompt=${encodeURIComponent(prompt)}`;
      const res = await axios.get(url);

      await message.reply({
        body: res.data?.response || "❌ | No response received."
      });

      message.reaction("✅", event.messageID);
    } catch (error) {
      message.reaction("❌", event.messageID);
      message.reply("❌ | " + error.message);
    }
  }
};
