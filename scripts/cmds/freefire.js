const axios = require("axios");

async function handleRequest(api, event, args, endpoint, type) {
  try {
    if (args.length < 2) {
      return api.sendMessage(
        `⚠️ Usage: ${type} [uid] [server]\nExample: ${type} 123456789 bd`,
        event.threadID,
        event.messageID
      );
    }

    const uid = args[0];
    const server = args[1];

    const url = `https://hridoyxqc-ff.giize.com/api/${endpoint}?uid=${encodeURIComponent(uid)}&server=${encodeURIComponent(server)}`;
    const res = await axios.get(url);

    if (res.data) {
      api.sendMessage(
        `✅ Request Successful!\n\n📌 Command: ${type}\nUID: ${uid}\nServer: ${server}\nResponse: ${JSON.stringify(res.data, null, 2)}`,
        event.threadID,
        event.messageID
      );
    } else {
      api.sendMessage(
        "❌ No response received from the API.",
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

module.exports = {
  // 🔥 Free Fire Profile
  ffprofile: {
    config: {
      name: "ffprofile",
      version: "1.0.0",
      author: "Farhan & Rahat",
      role: 0,
      prefix: true,
      hasPermssion: 2,
      cooldowns: 5,
      description: "Fetch Free Fire profile image",
      category: "Fun",
      usages: "ffprofile [uid] [server]"
    },
    onStart: async function ({ api, event, args }) {
      return handleRequest(api, event, args, "profile", "ffprofile");
    }
  },

  // 🔥 Free Fire Profile Card
  ffprofilecard: {
    config: {
      name: "ffprofilecard",
      version: "1.0.0",
      author: "Farhan & Rahat",
      role: 0,
      prefix: true,
      hasPermssion: 2,
      cooldowns: 5,
      description: "Generate Free Fire profile card with custom branding",
      category: "Fun",
      usages: "ffprofilecard [uid] [server]"
    },
    onStart: async function ({ api, event, args }) {
      return handleRequest(api, event, args, "profile-card", "ffprofilecard");
    }
  },

  // 🔥 Free Fire Info
  ffinfo: {
    config: {
      name: "ffinfo",
      version: "1.0.0",
      author: "Farhan & Rahat",
      role: 0,
      prefix: true,
      hasPermssion: 2,
      cooldowns: 5,
      description: "Get detailed Free Fire user information",
      category: "Fun",
      usages: "ffinfo [uid] [server]"
    },
    onStart: async function ({ api, event, args }) {
      return handleRequest(api, event, args, "info", "ffinfo");
    }
  },

  // 🔥 Free Fire Ban Check
  ffcheckban: {
    config: {
      name: "ffcheckban",
      version: "1.0.0",
      author: "Farhan & Rahat",
      role: 0,
      prefix: true,
      hasPermssion: 2,
      cooldowns: 5,
      description: "Check if a Free Fire user is banned",
      category: "Fun",
      usages: "ffcheckban [uid] [server]"
    },
    onStart: async function ({ api, event, args }) {
      return handleRequest(api, event, args, "check_ban", "ffcheckban");
    }
  }
};
                                                                                                                 
