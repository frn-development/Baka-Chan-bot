const fs = require("fs-extra");
const axios = require("axios");
const path = require("path");
const { getPrefix } = global.utils;
const { commands, aliases } = global.GoatBot;

module.exports = {
  config: {
    name: "help",
    version: "2.1",
    author: "Farhan (frnwot) ✦ styled",
    countDown: 5,
    role: 0,
    shortDescription: {
      en: "View command usage and list all commands",
    },
    longDescription: {
      en: "Display usage instructions or list all available commands grouped by category.",
    },
    category: "info",
    guide: {
      en: "{pn} [command name]",
    },
    priority: 1,
  },

  onStart: async function ({ message, args, event, threadsData, role }) {
    const { threadID } = event;
    const prefix = getPrefix(threadID);

    if (args.length === 0) {
      const categories = {};
      let msg = `✦────────────✦\n     𝙲𝙾𝙼𝙼𝙰𝙽𝙳 𝙻𝙸𝚂𝚃\n✦────────────✦\n`;

      for (const [name, value] of commands) {
        if (value.config.role > 1 && role < value.config.role) continue;

        const category = value.config.category || "Uncategorized";
        categories[category] = categories[category] || { commands: [] };
        categories[category].commands.push(name);
      }

      Object.keys(categories).forEach((category) => {
        if (category !== "info") {
          msg += `\n✦ ${category.toUpperCase()} ✦\n`;

          const names = categories[category].commands.sort();
          for (let i = 0; i < names.length; i += 3) {
            const cmds = names.slice(i, i + 3).map((item) => `✦ ${item}`);
            msg += ` ${cmds.join("   ")}\n`;
          }
        }
      });

      const totalCommands = commands.size;
      msg += `\n✦────────────✦\n     𝙱𝙾𝚃 𝙸𝙽𝙵𝙾\n✦────────────✦
✦ Owner: Farhan (frnwot)  
✦ Profile: https://www.facebook.com/share/1BMmLwy1JY/  
✦ Prefix: [ ${prefix} ]  
✦ Total Commands: ${totalCommands}  
✦ Usage: ${prefix}help <command>  
✦ baka-chan bot ✦`;

      await message.reply(msg);
    } else {
      const commandName = args[0].toLowerCase();
      const command = commands.get(commandName) || commands.get(aliases.get(commandName));

      if (!command) {
        await message.reply(`✦ Command "${commandName}" not found ✦`);
      } else {
        const configCommand = command.config;
        const roleText = roleTextToString(configCommand.role);
        const author = configCommand.author || "Unknown";
        const longDescription = configCommand.longDescription?.en || "No description";
        const guideBody = configCommand.guide?.en || "No guide available.";
        const usage = guideBody.replace(/{p}/g, prefix).replace(/{n}/g, configCommand.name);

        const response = `✦────────────✦\n    ${configCommand.name.toUpperCase()}\n✦────────────✦
✦ Description: ${longDescription}
✦ Aliases: ${configCommand.aliases?.join(", ") || "None"}
✦ Version: ${configCommand.version || "1.0"}
✦ Role Required: ${roleText}
✦ Cooldown: ${configCommand.countDown || 1}s
✦ Author: ${author}

✦ Usage: ${usage}
✦────────────✦`;

        await message.reply(response);
      }
    }
  },
};

function roleTextToString(roleText) {
  switch (roleText) {
    case 0: return "0 (All users)";
    case 1: return "1 (Group admins)";
    case 2: return "2 (Bot admins)";
    default: return "Unknown role";
  }
}
  },
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
