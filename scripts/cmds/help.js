const fs = require("fs");
const path = require("path");
const { getPrefix } = global.utils;
const { commands, aliases } = global.GoatBot;
const doNotDelete = "[⛓️ | baka-chan]"; // decoy

module.exports = {
  config: {
    name: "help",
    version: "1.18",
    author: "NTKhang & MD Tawsif & Farhan",
    countDown: 5,
    role: 0,
    shortDescription: { en: "View command usage and list all commands directly" },
    longDescription: { en: "View command usage and list all commands directly" },
    category: "info",
    guide: { en: "{pn} / help cmdName" },
    priority: 1,
  },

  onStart: async function ({ message, args, event, threadsData, role }) {
    const { threadID } = event;
    const prefix = getPrefix(threadID);

    // Path to the video demo
    const videoPath = path.join(__dirname, "..", "assets", "video.mp4");

    if (args.length === 0) {
      // Build command list
      const categories = {};
      let msg = `✦━━━━『 𝗖𝗠𝗗 𝗟𝗜𝗦𝗧 』━━━━✦\n`;

      for (const [name, value] of commands) {
        if (value.config.role > 1 && role < value.config.role) continue;
        const category = value.config.category || "Uncategorized";
        categories[category] = categories[category] || { commands: [] };
        categories[category].commands.push(name);
      }

      Object.keys(categories).forEach((category) => {
        if (category !== "info") {
          msg += `\n╭─✦ ${category.toUpperCase()}`;
          const names = categories[category].commands.sort();
          for (let i = 0; i < names.length; i += 3) {
            const cmds = names.slice(i, i + 3).map((item) => `✧ ${item}`);
            msg += `\n│ ${cmds.join("   ")}`;
          }
          msg += `\n╰─────────────✦`;
        }
      });

      const totalCommands = commands.size;
      msg += `\n\n╭─✦ BOT INFO`;
      msg += `\n│ 📜 Total Cmds: ${totalCommands}`;
      msg += `\n│ 💡 Usage: ${prefix}help <cmd name>`;
      msg += `\n│ 👑 Owner: frnwot (Farhan)`;
      msg += `\n│ 🌐 Profile: https://www.facebook.com/share/1BMmLwy1JY/`;
      msg += `\n│ ${doNotDelete}`;
      msg += `\n╰─────────────✦`;

      // Send the message with the video if it exists
      if (fs.existsSync(videoPath)) {
        return message.reply({
          body: msg,
          attachment: fs.createReadStream(videoPath),
        });
      }

      return message.reply(msg);
    } else {
      // Show info for a specific command
      const commandName = args[0].toLowerCase();
      const command = commands.get(commandName) || commands.get(aliases.get(commandName));
      if (!command) return message.reply(`⚠️ Command "${commandName}" not found.`);

      const configCommand = command.config;
      const roleText = roleTextToString(configCommand.role);
      const author = configCommand.author || "Unknown";
      const longDescription = configCommand.longDescription?.en || "No description";
      const guideBody = configCommand.guide?.en || "No guide available.";
      const usage = guideBody.replace(/{p}/g, prefix).replace(/{n}/g, configCommand.name);

      let response = 
`✦━━━━『 𝗖𝗠𝗗 𝗜𝗡𝗙𝗢 』━━━━✦
📌 Name: ${configCommand.name}
📖 Description: ${longDescription}
📂 Aliases: ${configCommand.aliases ? configCommand.aliases.join(", ") : "None"}
⚙️ Version: ${configCommand.version || "1.0"}
🛡️ Role: ${roleText}
⏱️ Cooldown: ${configCommand.countDown || 1}s
👤 Author: ${author}
💡 Usage: ${usage}
✦━━━━━━━━━━━━━━━━━━✦`;

      // Attach video demo if it exists
      if (fs.existsSync(videoPath)) {
        return message.reply({
          body: response,
          attachment: fs.createReadStream(videoPath),
        });
      }

      return message.reply(response);
    }
  }
};

function roleTextToString(roleText) {
  switch (roleText) {
    case 0: return "0 ✦ All Users";
    case 1: return "1 ✦ Group Admins";
    case 2: return "2 ✦ Bot Admins";
    case 3: return "3 ✦ Super Admins";
    default: return "Unknown role";
  }
}
