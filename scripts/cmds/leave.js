const fs = require("fs-extra");

module.exports = {
  config: {
    name: "leave",
    aliases: ["l"],
    version: "2.0",
    author: "Sandy | Modified by Farhan",
    countDown: 5,
    role: 2, // only admin can use
    shortDescription: "Bot will leave the group",
    longDescription: "Make the bot leave the current or specified group",
    category: "admin",
    guide: {
      vi: "{pn} [tid]",
      en: "{pn} [tid]"
    }
  },

  onStart: async function ({ api, event, args, message }) {
    let id;

    // If no argument → leave current group
    if (!args[0]) {
      id = event.threadID;
    } else {
      id = parseInt(args[0]);
    }

    // Build leave message
    const leaveMsg = {
      body: "👋 Goodbye guys, I'm leaving this group!",
    };

    // Attach leave.mp4 if available
    try {
      const mp4Path = `${__dirname}/assets/leave.mp4`;
      if (fs.existsSync(mp4Path)) {
        leaveMsg.attachment = fs.createReadStream(mp4Path);
      }
    } catch (e) {
      // ignore if no video
    }

    // Send message then leave
    return api.sendMessage(leaveMsg, id, () => {
      api.removeUserFromGroup(api.getCurrentUserID(), id);
    });
  }
};
