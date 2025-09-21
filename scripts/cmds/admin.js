const fs = require("fs");
const path = require("path");
const axios = require("axios");
const config = require("../../config/config.json");

module.exports = {
  config: {
    name: "admin",
    version: "1.0.1",
    author: "frnwot",
    description: "Manage the bot admin list (admin only).",
    category: "box chat",
    guide: "Use {pn}admin to see admin list, {pn}admin add @user to add, or {pn}admin remove @user to remove.",
    role: 0,
    cooldowns: 5,
    prefix: true,
    adminOnly: true
  },

  langs: {
    en: {
      missingId: "⚠️ Please mention a user to add or remove as admin.",
      invalidAction: "⚠️ Invalid action. Use 'add' or 'remove'.",
      alreadyAdmin: "⚠️ {name} is already an admin.",
      notAdmin: "⚠️ {name} is not an admin.",
      cannotRemoveOwner: "⚠️ Cannot remove the bot owner from admin list.",
      successAdd: "✅ {name} has been added as admin.",
      successRemove: "✅ {name} has been removed from admin list.",
      noAdmins: "No admins found.",
      adminList: "╔═━─[ {botName} ADMIN LIST ]─━═╗\n{list}\n╚═━──────────────────────────────━═╝"
    }
  },

  onStart: async ({ api, event, args, getLang }) => {
    if (!event || !event.threadID || !event.messageID) return;

    const configPath = path.join(__dirname, "../../config/config.json");

    // Show admin list if no args or list command
    if (!args[0] || args[0].toLowerCase() === "list" || args[0].toLowerCase() === "-l") {
      const adminUids = config.bot.adminUids || [];
      if (!adminUids.length) return api.sendMessage(getLang("noAdmins"), event.threadID);

      const adminInfo = await new Promise(resolve =>
        api.getUserInfo(adminUids, (err, info) => resolve(err ? {} : info))
      );

      const adminList = adminUids.map(uid => `• ${adminInfo[uid]?.name || uid} (${uid})`);
      return api.sendMessage(
        getLang("adminList")
          .replace("{botName}", config.bot.botName)
          .replace("{list}", adminList.join("\n")),
        event.threadID
      );
    }

    // Add or remove admin
    if (!event.mentions || Object.keys(event.mentions).length === 0) {
      return api.sendMessage(getLang("missingId"), event.threadID);
    }

    const targetUid = Object.keys(event.mentions)[0];
    const targetName = event.mentions[targetUid].replace(/@/g, "");
    const action = args[0].toLowerCase();

    let adminUids = config.bot.adminUids || [];

    if (action === "add") {
      if (adminUids.includes(targetUid)) {
        return api.sendMessage(getLang("alreadyAdmin").replace("{name}", targetName), event.threadID);
      }
      adminUids.push(targetUid);
      config.bot.adminUids = adminUids;
      await fs.promises.writeFile(configPath, JSON.stringify(config, null, 2));
      return api.sendMessage(getLang("successAdd").replace("{name}", targetName), event.threadID);

    } else if (action === "remove") {
      if (!adminUids.includes(targetUid)) {
        return api.sendMessage(getLang("notAdmin").replace("{name}", targetName), event.threadID);
      }
      if (targetUid === config.bot.ownerUid) {
        return api.sendMessage(getLang("cannotRemoveOwner"), event.threadID);
      }
      adminUids = adminUids.filter(uid => uid !== targetUid);
      config.bot.adminUids = adminUids;
      await fs.promises.writeFile(configPath, JSON.stringify(config, null, 2));
      return api.sendMessage(getLang("successRemove").replace("{name}", targetName), event.threadID);

    } else {
      return api.sendMessage(getLang("invalidAction"), event.threadID);
    }
  }
};
