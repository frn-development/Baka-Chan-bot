const fs = require("fs-extra");

module.exports = {
  config: {
    name: "leave",
    aliases: ["l"],
    version: "2.1",
    author: "Sandy | Fixed by Farhan",
    role: 2,
    shortDescription: "Bot will leave the group",
    category: "admin"
  },

  onStart: async function ({ api, event, args }) {
    let id = args[0] ? parseInt(args[0]) : event.threadID;

    const form = { body: "👋 Goodbye guys, I'm leaving this group!" };

    // Attach leave.mp4 if available
    try {
      const mp4Path = `${__dirname}/assets/leave.mp4`;
      if (fs.existsSync(mp4Path)) {
        form.attachment = fs.createReadStream(mp4Path);
      }
    } catch {}

    return api.sendMessage(form, id, () => {
      api.removeUserFromGroup(api.getCurrentUserID(), id);
    });
  }
};
