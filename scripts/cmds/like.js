const axios = require("axios");

module.exports = {
  config: {
    name: "fflike",
    version: "1.0.0",
    author: "Farhan & Rahat",
    role: 0,
    prefix: true,
    hasPermssion: 2,
    cooldowns: 5,
    description: "Send Free Fire like using API",
    category: "fun",
    usages: "[uid] [server_name]"
  },

  onStart: async function ({ api, event, args }) {
    try {
      if (args.length < 2) {
        return api.sendMessage(
          "⚠️ Usage: fflike [uid] [server_name]\nExample: fflike 123456789 bd",
          event.threadID,
          event.messageID
        );
      }

      const uid = args[0];
      const serverName = args[1];

      const url = `https://free10-like-1dev-hridoy.vercel.app/like?uid=${encodeURIComponent(uid)}&server_name=${encodeURIComponent(serverName)}`;
      const res = await axios.get(url);

      if (res.data) {
        api.sendMessage(
          `✅ Like sent successfully!\n\nUID: ${uid}\nServer: ${serverName}\nResponse: ${JSON.stringify(res.data)}`,
          event.threadID,
          event.messageID
        );
      } else {
        api.sendMessage(
          "❌ No response received from the server.",
          event.threadID,
          event.messageID
        );
      }
    } catch (err) {
      console.error(err);
      api.sendMessage(
        "❌ An error occurred while executing the command.",
        event.threadID,
        event.messageID
      );
    }
  }
};
                                                                                            
