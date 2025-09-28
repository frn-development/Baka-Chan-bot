const fs = require("fs");
const path = require("path");
const { getPrefix } = global.utils;
const { commands, aliases } = global.GoatBot;

const doNotDelete = "✦ BAKA-CHAN ✦"; // decoy
const taglines = [
  "Power up your group with Baka-chan!",
  "Commands forged for legends only!",
  "Built for speed, made for you.",
  "Your bot, your power, your rules!",
  "Explore. Command. Conquer."
];

module.exports = {
  config: {
    name: "help",
    version: "2.1",
    author: "NTKhang • MD Tawsif • Farhan",
    countDown: 5,
    role: 0,
    shortDescription: { en: "View all commands or details about one" },
    longDescription: { en: "Browse the full list of commands or check usage details for a specific command." },
    category: "info",
    guide: { en: "{pn} / help <cmdName>" },
    priority: 1,
  },

  onStart: async function ({ message, args, event, role }) {
    const { threadID } = event;
    const prefix = getPrefix(threadID);
    const videoPath = path.join(process.cwd(), "assets", "video.mp4");
    const tagline = taglines[Math.floor(Math.random() * taglines.length)];

    // Show all commands
    if (args.length === 0) {
      const categories = {};
      let msg = `✦━━━━━━━━━━━━━━━━━━━━✦\n       BAKA-CHAN BOT\n✦━━━━━━━━━━━━━━━━━━━━✦\n${tagline}\n`;

      for (const [name, value] of commands) {
        if (value.config.role > 1 && role < value.config.role) continue;
        const category = value.config.category || "Uncategorized";
        categories[category] = categories[category] || [];
        categories[category].push(name);
      }

      // alt grouping (old style flavor)
      Object.keys(categories).sort().forEach((category) => {
        msg += `\n[ ${category.toUpperCase()} ]\n`;
        const names = categories[category].sort();
        msg += names.map((cmd) => `- ${cmd}`).join("\n");
        msg += "\n";
      });

      // alt BOT INFO (cleaner layout)
      const totalCommands = commands.size;
      msg += `━━━━━━━━━━━━━━━━━━━━━\n BOT INFO\n━━━━━━━━━━━━━━━━━━━━━\n`;
      msg += `Total Commands : ${totalCommands}\n`;
      msg += `Usage          : ${prefix}help <cmd>\n`;
      msg += `Owner          : Farhan (frnwot)\n`;
      msg += `Profile        : fb.com/share/1BMmLwy1JY/\n`;
      msg += `${doNotDelete}`;

      if (fs.existsSync(videoPath)) {
        return message.reply({
          body: msg,
          attachment: fs.createReadStream(videoPath),
        });
      }
      return message.reply(msg);
    }

    // Show details of one command
    const commandName = args[0].toLowerCase();
    const command = commands.get(commandName) || commands.get(aliases.get(commandName));
    if (!command) return message.reply(`⚠️ Command "${commandName}" not found.`);

    const config = command.config;
    const roleText = roleToString(config.role);
    const usage = (config.guide?.en || "No guide available.")
      .replace(/{p}/g, prefix)
      .replace(/{n}/g, config.name);

    let detail = `✦━━━━━━━━━━━━━━━━━━━━✦\n       COMMAND INFO\n✦━━━━━━━━━━━━━━━━━━━━✦\n`;
    detail += `Name        : ${config.name}\n`;
    detail += `Description : ${config.longDescription?.en || "No description"}\n`;
    detail += `Aliases     : ${config.aliases ? config.aliases.join(", ") : "None"}\n`;
    detail += `Version     : ${config.version || "1.0"}\n`;
    detail += `Role        : ${roleText}\n`;
    detail += `Cooldown    : ${config.countDown || 1}s\n`;
    detail += `Author      : ${config.author || "Unknown"}\n`;
    detail += `Usage       : ${usage}\n`;

    if (fs.existsSync(videoPath)) {
      return message.reply({
        body: detail,
        attachment: fs.createReadStream(videoPath),
      });
    }
    return message.reply(detail);
  }
};

function roleToString(role) {
  switch (role) {
    case 0: return "0 - All Users";
    case 1: return "1 - Group Admins";
    case 2: return "2 - Bot Admins";
    case 3: return "3 - Super Admins";
    default: return "Unknown";
  }
}
        typeof guide === "string"
          ? guide.replace(/{pn}/g, prefix)
          : guide?.en?.replace(/{pn}/g, prefix) || `${prefix}${name}`;

      return message.reply({
        body:
          `┏━━━━━━━━━━━━━━━━━┓\n` +
          `  BAKA-CHAN CMD INFO\n` +
          `┗━━━━━━━━━━━━━━━━━┛\n\n` +
          `› Name: ${name}\n` +
          `› Category: ${category || "Uncategorized"}\n` +
          `› Description: ${desc}\n` +
          `› Aliases: ${aliases?.length ? aliases.join(", ") : "None"}\n` +
          `› Usage: ${usage}\n` +
          `› Author: ${author || "Unknown"}\n` +
          `› Version: ${version || "1.0"}`,
        attachment: fs.createReadStream(gifPath)
      });
    }

    // ─── Full Commands Menu ───
    const formatCommands = (cmds) =>
      cmds.sort().map((cmd) => `│ ${cmd}`).join("\n");

    let msg = `┏━━━━━━━━━━━━━━━━━━━━━━┓\n        BAKA-CHAN MENU\n┗━━━━━━━━━━━━━━━━━━━━━━┛\n`;
    const sortedCategories = Object.keys(categories).sort();
    for (const cat of sortedCategories) {
      const title = styleMap[cat] || `《 ${cat.toUpperCase()} 》`;
      msg += `\n${title}\n`;
      msg += `${formatCommands(categories[cat])}\n`;
    }
    msg += `\nUse: ${prefix}help [command name] for details`;

    return message.reply({
      body: msg,
      attachment: fs.createReadStream(gifPath)
    });
  }
};
