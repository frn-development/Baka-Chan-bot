var request = require("request");
const { readdirSync, readFileSync, writeFileSync, existsSync, copySync, createWriteStream, createReadStream } = require("fs-extra");

module.exports.config = {
  name: "admin",
  version: "1.0.5",
  hasPermssion: 0,
  credits: "based",
  description: "Admin Config",
  commandCategory: "Admin",
  usages: "Admin",
  cooldowns: 2,
  dependencies: {
    "fs-extra": ""
  }
};

module.exports.languages = {
  vi: {
    listAdmin: `=== DANH SÁCH ADMIN ===\n━━━━━━━━━━━━━━━\n%1\n\n== NGƯỜI HỖ TRỢ BOT ==\n━━━━━━━━━━━━━━━\n%2`,
    notHavePermssion: 'Bạn không đủ quyền để dùng "%1"',
    addedNewAdmin: 'Đã thêm thành công %1 người dùng thành Admin Bot\n\n%2',
    addedNewNDH: 'Đã thêm thành công %1 người dùng thành Người hỗ trợ\n\n%2',
    removedAdmin: 'Đã gỡ thành công vai trò Admin của %1 người dùng\n\n%2',
    removedNDH: 'Đã gỡ thành công vai trò Người hỗ trợ của %1 người dùng\n\n%2'
  },
  en: {
    listAdmin: '[Admin] Admin list:\n\n%1',
    notHavePermssion: '[Admin] You have no permission to use "%1"',
    addedNewAdmin: '[Admin] Added %1 Admin:\n\n%2',
    addedNewNDH: '[Admin] Added %1 Support:\n\n%2',
    removedAdmin: '[Admin] Removed %1 Admin:\n\n%2',
    removedNDH: '[Admin] Removed %1 Support:\n\n%2'
  }
};

module.exports.onLoad = function () {
  const { resolve } = require("path");
  const path = resolve(__dirname, 'cache', 'data.json');
  if (!existsSync(path)) {
    const obj = { adminbox: {} };
    writeFileSync(path, JSON.stringify(obj, null, 4));
  } else {
    const data = require(path);
    if (!data.hasOwnProperty('adminbox')) data.adminbox = {};
    writeFileSync(path, JSON.stringify(data, null, 4));
  }
};

module.exports.run = async function ({ api, event, args, Users, permssion, getText }) {
  const content = args.slice(1);
  if (args.length == 0) {
    return api.sendMessage({
      body: `==== [ ADMIN SETTINGS ] ====\n━━━━━━━━━━━━━━━
admin list       => View list of Admin and Support
admin add        => Add user as Admin
admin remove     => Remove Admin role
admin addndh     => Add user as Support
admin removendh  => Remove Support role
admin qtvonly    => Toggle mode: only admins can use bot in group
admin ndhonly    => Toggle mode: only supports can use bot
admin only       => Toggle mode: only admins can use bot globally
admin ibonly     => Toggle mode: only admins can use bot in inbox
━━━━━━━━━━━━━━━
Usage: ${global.config.PREFIX}admin [command]`
    }, event.threadID, event.messageID);
  }

  const { threadID, messageID, mentions } = event;
  const { configPath } = global.client;
  const { ADMINBOT } = global.config;
  const { NDH } = global.config;
  const { writeFileSync } = global.nodemodule["fs-extra"];
  const mention = Object.keys(mentions);

  delete require.cache[require.resolve(configPath)];
  var config = require(configPath);

  switch (args[0]) {
    case "list":
    case "all":
    case "-a": {
      listAdmin = ADMINBOT || config.ADMINBOT || [];
      var msg = [];
      for (const idAdmin of listAdmin) {
        if (parseInt(idAdmin)) {
          const name = (await Users.getData(idAdmin)).name;
          msg.push(`Name: ${name}\nFB: https://www.facebook.com/${idAdmin}`);
        }
      }
      listNDH = NDH || config.NDH || [];
      var msg1 = [];
      for (const idNDH of listNDH) {
        if (parseInt(idNDH)) {
          const name1 = (await Users.getData(idNDH)).name;
          msg1.push(`Name: ${name1}\nFB: https://www.facebook.com/${idNDH}`);
        }
      }
      return api.sendMessage(getText("listAdmin", msg.join("\n\n"), msg1.join("\n\n")), threadID, messageID);
    }

    case "add": {
      if (permssion != 3) return api.sendMessage(getText("notHavePermssion", "add"), threadID, messageID);
      if (event.type == "message_reply") { content[0] = event.messageReply.senderID; }
      if (mention.length != 0 && isNaN(content[0])) {
        var listAdd = [];
        for (const id of mention) {
          ADMINBOT.push(id);
          config.ADMINBOT.push(id);
          listAdd.push(`${id} - ${event.mentions[id]}`);
        }
        writeFileSync(configPath, JSON.stringify(config, null, 4), 'utf8');
        return api.sendMessage(getText("addedNewAdmin", mention.length, listAdd.join("\n").replace(/\@/g, "")), threadID, messageID);
      } else if (content.length != 0 && !isNaN(content[0])) {
        ADMINBOT.push(content[0]);
        config.ADMINBOT.push(content[0]);
        const name = (await Users.getData(content[0])).name;
        writeFileSync(configPath, JSON.stringify(config, null, 4), 'utf8');
        return api.sendMessage(getText("addedNewAdmin", 1, `Admin - ${name}`), threadID, messageID);
      } else return global.utils.throwError(this.config.name, threadID, messageID);
    }

    case "addndh": {
      if (permssion != 3) return api.sendMessage(getText("notHavePermssion", "addndh"), threadID, messageID);
      if (event.type == "message_reply") { content[0] = event.messageReply.senderID; }
      if (mention.length != 0 && isNaN(content[0])) {
        var listAdd = [];
        for (const id of mention) {
          NDH.push(id);
          config.NDH.push(id);
          listAdd.push(`${id} - ${event.mentions[id]}`);
        }
        writeFileSync(configPath, JSON.stringify(config, null, 4), 'utf8');
        return api.sendMessage(getText("addedNewNDH", mention.length, listAdd.join("\n").replace(/\@/g, "")), threadID, messageID);
      } else if (content.length != 0 && !isNaN(content[0])) {
        NDH.push(content[0]);
        config.NDH.push(content[0]);
        const name = (await Users.getData(content[0])).name;
        writeFileSync(configPath, JSON.stringify(config, null, 4), 'utf8');
        return api.sendMessage(getText("addedNewNDH", 1, `Support - ${name}`), threadID, messageID);
      } else return global.utils.throwError(this.config.name, threadID, messageID);
    }

    case "remove":
    case "rm":
    case "delete": {
      if (permssion != 3) return api.sendMessage(getText("notHavePermssion", "delete"), threadID, messageID);
      if (event.type == "message_reply") { content[0] = event.messageReply.senderID; }
      if (mentions.length != 0 && isNaN(content[0])) {
        const mention = Object.keys(mentions);
        var listAdd = [];
        for (const id of mention) {
          const index = config.ADMINBOT.findIndex(item => item == id);
          ADMINBOT.splice(index, 1);
          config.ADMINBOT.splice(index, 1);
          listAdd.push(`${id} - ${event.mentions[id]}`);
        }
        writeFileSync(configPath, JSON.stringify(config, null, 4), 'utf8');
        return api.sendMessage(getText("removedAdmin", mention.length, listAdd.join("\n").replace(/\@/g, "")), threadID, messageID);
      } else if (content.length != 0 && !isNaN(content[0])) {
        const index = config.ADMINBOT.findIndex(item => item.toString() == content[0]);
        ADMINBOT.splice(index, 1);
        config.ADMINBOT.splice(index, 1);
        const name = (await Users.getData(content[0])).name;
        writeFileSync(configPath, JSON.stringify(config, null, 4), 'utf8');
        return api.sendMessage(getText("removedAdmin", 1, `${content[0]} - ${name}`), threadID, messageID);
      } else global.utils.throwError(this.config.name, threadID, messageID);
    }

    case "removendh": {
      if (permssion != 3) return api.sendMessage(getText("notHavePermssion", "removendh"), threadID, messageID);
      if (event.type == "message_reply") { content[0] = event.messageReply.senderID; }
      if (mentions.length != 0 && isNaN(content[0])) {
        const mention = Object.keys(mentions);
        var listAdd = [];
        for (const id of mention) {
          const index = config.NDH.findIndex(item => item == id);
          NDH.splice(index, 1);
          config.NDH.splice(index, 1);
          listAdd.push(`${id} -${event.mentions[id]}`);
        }
        writeFileSync(configPath, JSON.stringify(config, null, 4), 'utf8');
        return api.sendMessage(getText("removedNDH", mention.length, listAdd.join("\n").replace(/\@/g, "")), threadID, messageID);
      } else if (content.length != 0 && !isNaN(content[0])) {
        const index = config.NDH.findIndex(item => item.toString() == content[0]);
        NDH.splice(index, 1);
        config.NDH.splice(index, 1);
        const name = (await Users.getData(content[0])).name;
        writeFileSync(configPath, JSON.stringify(config, null, 4), 'utf8');
        return api.sendMessage(getText("removedNDH", 1, `${content[0]} - ${name}`), threadID, messageID);
      } else global.utils.throwError(this.config.name, threadID, messageID);
    }

    case 'qtvonly': {
      const { resolve } = require("path");
      const pathData = resolve(__dirname, 'cache', 'data.json');
      const database = require(pathData);
      const { adminbox } = database;
      if (permssion < 1) return api.sendMessage("You don't have permission.", threadID, messageID);
      if (adminbox[threadID] == true) {
        adminbox[threadID] = false;
        api.sendMessage("QTV-only mode disabled. Everyone can use the bot.", threadID, messageID);
      } else {
        adminbox[threadID] = true;
        api.sendMessage("QTV-only mode enabled. Only administrators can use the bot.", threadID, messageID);
      }
      writeFileSync(pathData, JSON.stringify(database, null, 4));
      break;
    }

    case 'ndhonly':
    case '-ndh': {
      if (permssion < 2) return api.sendMessage("You don't have permission.", threadID, messageID);
      if (config.ndhOnly == false) {
        config.ndhOnly = true;
        api.sendMessage(`NDH-only mode enabled. Only supports can use the bot.`, threadID, messageID);
      } else {
        config.ndhOnly = false;
        api.sendMessage(`NDH-only mode disabled. Everyone can use the bot.`, threadID, messageID);
      }
      writeFileSync(configPath, JSON.stringify(config, null, 4), 'utf8');
      break;
    }

    case 'ibonly': {
      if (permssion != 3) return api.sendMessage("You don't have permission.", threadID, messageID);
      if (config.adminPaOnly == false) {
        config.adminPaOnly = true;
        api.sendMessage("Inbox-only mode enabled. Only admins can use the bot in inbox.", threadID, messageID);
      } else {
        config.adminPaOnly = false;
        api.sendMessage("Inbox-only mode disabled. Everyone can use the bot in inbox.", threadID, messageID);
      }
      writeFileSync(configPath, JSON.stringify(config, null, 4), 'utf8');
      break;
    }

    case 'only':
    case '-o': {
      if (permssion != 3) return api.sendMessage("You don't have permission.", threadID, messageID);
      if (config.adminOnly == false) {
        config.adminOnly = true;
        api.sendMessage(`Admin-only mode enabled. Only admins can use the bot.`, threadID, messageID);
      } else {
        config.adminOnly = false;
        api.sendMessage(`Admin-only mode disabled. Everyone can use the bot.`, threadID, messageID);
      }
      writeFileSync(configPath, JSON.stringify(config, null, 4), 'utf8');
      break;
    }

    default: {
      return global.utils.throwError(this.config.name, threadID, messageID);
    }
  }
};
