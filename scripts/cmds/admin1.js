const fs = require("fs");
const fsExtra = require("fs-extra");
const path = require("path");
const axios = require("axios");
const config = require("../../config/config.json");

module.exports = {
  config: {
    name: "admin1",
    version: "1.1.0",
    author: "frnwot",
    description: "Manages the bot admin list (admin only) and sends admin photo from GitHub.",
    category: "admin",
    guide: "Use {pn}admin to see admin list, {pn}admin add @user to add, or {pn}admin remove @user to remove.",
    cooldowns: 5,
    prefix: true,
    adminOnly: true,
  },

  langs: {
    en: {
      missingMention: "⚠️ Please mention a user to add or remove as admin.",
      invalidAction: '⚠️ Invalid action. Use "add" or "remove".',
      alreadyAdmin: "⚠️ {name} is already an admin.",
      notAdmin: "⚠️ {name} is not an admin.",
      cannotRemoveOwner: "⚠️ Cannot remove the bot owner from admin list.",
      actionDone: "✅ {name} has been {action}.",
      adminListEmpty: "No admins found.",
      fetchingAdminPhoto: "⏳ Fetching admin photo from GitHub..."
    }
  },

  onStart: async ({ api, event, args, getLang }) => {
    const configPath = path.join(__dirname, "../../config/config.json");

    // SHOW ADMIN LIST
    if (!args[0]) {
      const adminUids = config.bot.adminUids;
      if (adminUids.length === 0) {
        return api.sendMessage(getLang("adminListEmpty"), event.threadID);
      }

      const adminInfo = await new Promise((resolve) =>
        api.getUserInfo(adminUids, (err, info) => resolve(err ? {} : info))
      );

      const adminList = await Promise.all(
        adminUids.map(async (uid) => {
          let adminName = adminInfo[uid]?.name || uid;

          // Fetch GitHub photo for your GitHub account
          let adminPhotoPath = null;
          if (uid === config.bot.ownerUid) {
            const githubUrl = "https://api.github.com/users/Gtajisan";
            try {
              const res = await axios.get(githubUrl);
              const avatarUrl = res.data.avatar_url;
              const tempDir = path.join(__dirname, "../../temp");
              await fsExtra.ensureDir(tempDir);
              adminPhotoPath = path.join(tempDir, `admin_${uid}.png`);
              const imgData = await axios.get(avatarUrl, { responseType: "arraybuffer" });
              await fsExtra.writeFile(adminPhotoPath, imgData.data);
            } catch (e) {
              console.error("Failed to fetch GitHub photo:", e.message);
            }
          }

          return { name: adminName, uid, photoPath: adminPhotoPath };
        })
      );

      // Send message with admin photos if available
      const messageBody = [
        `╔═━─[ ${config.bot.botName} ADMIN LIST ]─━═╗`,
        ...adminList.map(a => `┃ ${a.name} (ID: ${a.uid})`),
        `╚═━──────────────────────────────━═╝`
      ].join("\n");

      const attachments = adminList
        .filter(a => a.photoPath && fs.existsSync(a.photoPath))
        .map(a => fs.createReadStream(a.photoPath));

      api.sendMessage(
        { body: messageBody, attachment: attachments.length ? attachments : null },
        event.threadID,
        () => {
          // Clean up temp files
          attachments.forEach(a => fs.unlinkSync(a.path));
        }
      );
      return;
    }

    // ADD / REMOVE ADMIN
    if (!event.mentions || Object.keys(event.mentions).length === 0) {
      return api.sendMessage(getLang("missingMention"), event.threadID);
    }

    const targetUid = Object.keys(event.mentions)[0];
    const targetName = event.mentions[targetUid].replace(/@/g, "");
    const actionArg = args[0].toLowerCase();

    let adminUids = config.bot.adminUids;

    if (actionArg === "add") {
      if (adminUids.includes(targetUid)) {
        return api.sendMessage(getLang("alreadyAdmin").replace("{name}", targetName), event.threadID);
      }
      adminUids.push(targetUid);
    } else if (actionArg === "remove") {
      if (!adminUids.includes(targetUid)) {
        return api.sendMessage(getLang("notAdmin").replace("{name}", targetName), event.threadID);
      }
      if (targetUid === config.bot.ownerUid) {
        return api.sendMessage(getLang("cannotRemoveOwner"), event.threadID);
      }
      adminUids = adminUids.filter(uid => uid !== targetUid);
    } else {
      return api.sendMessage(getLang("invalidAction"), event.threadID);
    }

    config.bot.adminUids = adminUids;
    await fs.writeFile(configPath, JSON.stringify(config, null, 2));

    const doneMessage = getLang("actionDone")
      .replace("{name}", targetName)
      .replace("{action}", actionArg === "add" ? "added as admin" : "removed from admin list");

    api.sendMessage(doneMessage, event.threadID);
  }
};
