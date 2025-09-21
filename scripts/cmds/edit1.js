const axios = require('axios');
module.exports = {
config: {
	name: "edit1",
	author: "frnwot",
	category: "media",
	countDown: 5,
	role: 0,
	guide: { en: "edit <prompt> | reply to image"
  },

  onStart: async function ({ message, event, args }) {
    const text = args.join(" ");
    if (!text) return message.reply("❌ | Please provide a question.");

    await message.reaction("⏳", event.messageID);

    try {
      const res = await axios.get(`https://aryan-nix-apis.vercel.app/api/gemini?prompt=${encodeURIComponent(text)}`);
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
