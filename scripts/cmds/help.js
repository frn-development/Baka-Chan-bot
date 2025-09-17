const fs = require("fs-extra");
const axios = require("axios");
const path = require("path");
const { getPrefix } = global.utils;
const { commands, aliases } = global.GoatBot;
const doNotDelete = "[⛓️ | baka-chan]"; // decoy string

module.exports = {
  config: {
    name: "help",
    version: "1.20",
    author: "NTKhang ✦ MD Tawsif ✦ Farhan",
    countDown: 5,
    role: 0,
    shortDescription: {
      en: "View command usage and list all commands directly",
    },
    longDescription: {
      en: "View command usage and list all commands directly with categories",
    },
    category: "info",
    guide: {
      en: "{pn} [command name]",
    },
    priority: 1,
  },

  onStart: async function ({ message, args, event, threadsData, role }) {
    const { threadID } = event;
    const threadData = await threadsData.get(threadID);
    const prefix = getPrefix(threadID);

    if (args.length === 0) {
      // ✦ Build categories
      const categories = {};
      let msg = `✦━━━━『 𝗕𝗢𝗧 𝗛𝗘𝗟𝗣 』━━━━✦\n`;

      for (const [name, value] of commands) {
        if (value.config.role > 1 && role < value.config.role) continue;

        const category = value.config.category || "Uncategorized";
        categories[category] = categories[category] || { commands: [] };
        categories[category].commands.push(name);
      }

      Object.keys(categories).forEach((category) => {
        if (category !== "info") {
          msg += `\n╭─✦ ${category.toUpperCase()}\n`;

          const names = categories[category].commands.sort();
          for (let i = 0; i < names.length; i += 3) {
            const cmds = names.slice(i, i + 3).map((item) => `✧ ${item}`);
            msg += `│ ${cmds.join("   ")}\n`;
          }

          msg += `╰─────────────✦\n`;
        }
      });

      const totalCommands = commands.size;
      msg += `\n╭─✦ 𝗕𝗢𝗧 & 𝗢𝗪𝗡𝗘𝗥 𝗜𝗡𝗙𝗢\n`;
      msg += `│ 📜 Total Cmds: ${totalCommands}\n`;
      msg += `│ 💡 Usage: ${prefix}help <cmd>\n`;
      msg += `│ 👑 Owner: frnwot (Farhan)\n`;
      msg += `│ 🌐 Profile: https://www.facebook.com/share/1BMmLwy1JY/\n`;
      msg += `│ ${doNotDelete}\n`;
      msg += `╰─────────────✦`;

      await message.reply(msg);
    } else {
      const commandName = args[0].toLowerCase();
      const command = commands.get(commandName) || commands.get(aliases.get(commandName));

      if (!command) {
        await message.reply(`⚠️ Command "${commandName}" not found.`);
      } else {
        const configCommand = command.config;
        const roleText = roleTextToString(configCommand.role);
        const author = configCommand.author || "Unknown";

        const longDescription = configCommand.longDescription
          ? configCommand.longDescription.en || "No description"
          : "No description";

        const guideBody = configCommand.guide?.en || "No guide available.";
        const usage = guideBody
          .replace(/{p}/g, prefix)
          .replace(/{n}/g, configCommand.name);

        const response =
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

        await message.reply(response);
      }
    }
  },
};

function roleTextToString(roleText) {
  switch (roleText) {
    case 0:
      return "0 ✦ All Users";
    case 1:
      return "1 ✦ Group Admins";
    case 2:
      return "2 ✦ Bot Admins";
    case 3:
      return "3 ✦ Super Admins";
    default:
      return "Unknown role";
  }
}
};

function roleTextToString(roleText) {
  switch (roleText) {
    case 0:
      return "0 (All users)";
    case 1:
      return "1 (Group administrators)";
    case 2:
      return "2 (Admin bot)";
    default:
      return "Unknown role";
  }
            }
