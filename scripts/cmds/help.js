const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");

module.exports = {
  config: {
    name: "help",
    aliases: ["menu", "commands"],
    version: "5.1",
    author: "Farhan",
    shortDescription: "Show all available commands",
    longDescription: "Displays a categorized, premium-styled list of commands with detailed info support.",
    category: "system",
    guide: "{pn}help [command name]"
  },

  onStart: async function ({ message, args, prefix }) {
    const allCommands = global.GoatBot.commands;
    const categories = {};

    // Stylish category titles
    const styleMap = {
      ai: "《 AI 》", "ai-image": "《 AI-IMAGE 》", group: "《 GROUP 》", system: "《 SYSTEM 》",
      fun: "《 FUN 》", owner: "《 OWNER 》", config: "《 CONFIG 》", economy: "《 ECONOMY 》",
      media: "《 MEDIA 》", "18+": "《 NSFW 》", tools: "《 TOOLS 》", utility: "《 UTILITY 》",
      info: "《 INFO 》", image: "《 IMAGE 》", game: "《 GAME 》", admin: "《 ADMIN 》",
      rank: "《 RANK 》", boxchat: "《 BOXCHAT 》", others: "《 OTHERS 》"
    };

    // Clean category names
    const cleanCategoryName = (text) => {
      if (!text) return "others";
      return text
        .normalize("NFKD")
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, " ")
        .trim()
        .toLowerCase();
    };

    // Group commands by category
    for (const [, cmd] of allCommands) {
      const cat = cleanCategoryName(cmd.config.category);
      if (!categories[cat]) categories[cat] = [];
      categories[cat].push(cmd.config.name);
    }

    // GIF URLs
    const gifURLs = [
      "https://i.imgur.com/ejqdK51.gif",
      "https://i.imgur.com/ltIztKe.gif",
      "https://i.imgur.com/5oqrQ0i.gif",
      "https://i.imgur.com/qf2aZH8.gif",
      "https://i.imgur.com/3QzYyye.gif",
      "https://i.imgur.com/ffxzucB.gif",
      "https://i.imgur.com/3QSsSzA.gif",
      "https://i.imgur.com/Ih819LH.gif"
    ];
    const randomGifURL = gifURLs[Math.floor(Math.random() * gifURLs.length)];

    const cacheFolder = path.join(__dirname, "cache");
    if (!fs.existsSync(cacheFolder)) fs.mkdirSync(cacheFolder, { recursive: true });
    const gifPath = path.join(cacheFolder, path.basename(randomGifURL));

    // Download GIF if missing
    if (!fs.existsSync(gifPath)) {
      const response = await axios.get(randomGifURL, { responseType: "stream" });
      const writer = fs.createWriteStream(gifPath);
      response.data.pipe(writer);
      await new Promise((resolve, reject) => {
        writer.on("finish", resolve);
        writer.on("error", reject);
      });
    }

    // ─── Single Command Info ───
    if (args[0]) {
      const query = args[0].toLowerCase();
      const cmd =
        allCommands.get(query) ||
        [...allCommands.values()].find((c) => (c.config.aliases || []).includes(query));
      if (!cmd) return message.reply(`✘ Command "${query}" not found.`);

      const {
        name,
        version,
        author,
        guide,
        category,
        shortDescription,
        longDescription,
        aliases
      } = cmd.config;

      const desc =
        typeof longDescription === "string"
          ? longDescription
          : longDescription?.en || shortDescription?.en || shortDescription || "No description";

      const usage =
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
