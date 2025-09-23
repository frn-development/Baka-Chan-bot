const axios = require("axios");

module.exports = {
  config: {
    name: "gcan",
    version: "1.0",
    author: "Farhan",
    role: 0,
    countDown: 5,
    shortDescription: "Guess a country",
    longDescription: "Guess-country API: send a hint/input, get a country name back.",
    category: "fun",
    guide: {
      en: "{p}guesscountry <input>"
    }
  },

  onStart: async function({ api, event, message }) {
    const { threadID, senderID, args } = event;
    if (!args || args.length === 0) {
      return message.reply("⚠️ You must provide something to guess the country.\nUsage: {p}guesscountry <hint or name fragment>");
    }
    const query = args.join(" ").trim();

    const waitMsg = await message.reply(`🔍 Guessing country for "${query}", please wait...`);

    try {
      const apiUrl = `https://sus-apis.onrender.com/api/guess-country?input=${encodeURIComponent(query)}`;
      const res = await axios.get(apiUrl);

      // Depending on response format. Example assume JSON { country: "Name", … }
      const data = res.data;

      if (!data) {
        throw new Error("No data");
      }

      // Build reply message based on API response
      let replyText = `🌍 Guess Country Result for: "${query}"\n`;
      if (data.country) {
        replyText += `**Country:** ${data.country}\n`;
      }
      if (data.confidence) {
        replyText += `**Confidence:** ${data.confidence}\n`;
      }
      if (data.more) {
        replyText += `Additional Info: ${JSON.stringify(data.more)}`;
      }

      await message.reply(replyText);

      if (waitMsg?.messageID) api.unsendMessage(waitMsg.messageID);
    } catch (err) {
      console.error("Error in guesscountry command:", err);
      message.reply("❌ Failed to guess the country. Maybe invalid input or API error.");
      if (waitMsg?.messageID) api.unsendMessage(waitMsg.messageID);
    }
  }
};
};
        
