const fs = require("fs");
const path = require("path");

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

  onStart: async function ({ api, event, args, message }) {
    let id = args.length ? parseInt(args.join(" ")) : event.threadID;

    const form = { body: "👋 Goodbye guys, I'm leaving this group!" };

    // Attach leave.mp4 automatically
    const mp4Path = path.join(__dirname, "../../Baka-chan-1/assets/leave.mp4");
    if (fs.existsSync(mp4Path)) form.attachment = fs.createReadStream(mp4Path);

    return api.sendMessage(form, id, () => api.removeUserFromGroup(api.getCurrentUserID(), id));
  }
};
