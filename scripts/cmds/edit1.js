const axios = require('axios');

module.exports = {
  config: {
    name: "edit1",
    author: "frnwot",
    category: "ai",
    version: "2.0",
    countDown: 5,
    role: 0,
    guide: { en: "edit1 <question>" }
  },

  onStart: async function ({ message, event, args }) {
    const prompt = args.join(" ");
    if (!prompt) return message.reply("❌ | Please provide a question.");

    await message.reaction("⏳", event.messageID);

    try {
      let url = `https://aryan-nix-apis.vercel.app/api/gemini?prompt=${encodeURIComponent(prompt)}`;
      const res = await axios.get(url);
      const reply = res.data?.response || "❌ | No response received.";

      await message.reaction("✅", event.messageID);
      return message.reply(reply);
    } catch (error) {
      console.error("Gemini CMD ERROR:", error);
      await message.reaction("❌", event.messageID);
      return message.reply("❌ | Something went wrong while contacting Gemini AI.");
    }
  }
};
