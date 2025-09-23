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

  onStart: async ({ api, event, args, message }) => {
    const threadID = args.length ? parseInt(args.join(" ")) : event.threadID;

    const text = "👋 Goodbye guys, I'm leaving this group!";

    // Send the specific leave.mp4 from assets folder
    const videoPath = path.join(__dirname, "../../assets/leave.mp4");

    return message.reply({
      body: text,
      attachment: fs.createReadStream(videoPath)
    }, () => api.removeUserFromGroup(api.getCurrentUserID(), threadID));
  }
};
