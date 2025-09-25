const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "file",
    version: "1.1",
    author: "frnwot",
    countDown: 5,
    role: 0,
    shortDescription: "Send bot script file",
    longDescription: "Retrieve and send the content of a specific bot script file.",
    category: "owner",
    guide: "{pn} <filename> (example: {pn} help)"
  },

  onStart: async function ({ message, args, api, event }) {
    const ownerID = "100094924471568"; // Only one UID allowed

    // Permission check
    if (event.senderID !== ownerID) {
      return api.sendMessage(
        "⛔ This command is restricted to the bot owner.",
        event.threadID,
        event.messageID
      );
    }

    // Filename validation
    const fileName = args[0];
    if (!fileName) {
      return api.sendMessage(
        "⚠ Please provide the file name.\nExample: file help",
        event.threadID,
        event.messageID
      );
    }

    // File path
    const filePath = path.join(__dirname, `${fileName}.js`);
    if (!fs.existsSync(filePath)) {
      return api.sendMessage(
        `❌ File not found: ${fileName}.js`,
        event.threadID,
        event.messageID
      );
    }

    // Read and send file content
    try {
      const fileContent = fs.readFileSync(filePath, "utf8");
      api.sendMessage(
        { body: `📂 File: ${fileName}.js\n\n${fileContent}` },
        event.threadID,
        event.messageID
      );
    } catch (err) {
      api.sendMessage(
        `⚠ Error reading file: ${err.message}`,
        event.threadID,
        event.messageID
      );
    }
  }
};
  
