const fs = require('fs');

module.exports = {
  config: {
    name: "pending",
    aliases: ["pen"],
    version: "1.1",
    author: "Rômeo", // cmd modified by Aryan Chauhan, credit kept
    countDown: 0,
    role: 2,
    shortDescription: {
      en: "View and approve/cancel pending group requests"
    },
    longDescription: {
      en: "Shows the list of pending/spam group requests and lets you approve or cancel them easily."
    },
    category: "owner"
  },

  langs: {
    en: {
      invaildNumber: "⚠️ Invalid input:\n━━━━━━━━━━━━━━━\n%1 is not a valid number.",
      cancelSuccess: "❌ Request Cancelled:\n━━━━━━━━━━━━━━━\nRemoved from %1 group(s).",
      approveSuccess: "✅ Groups Approved:\n━━━━━━━━━━━━━━━\nSuccessfully approved %1 group(s)!",
      cantGetPendingList: "⚠️ Unable to fetch the pending group list!",
      returnListPending: "📥 Pending Group Requests\n━━━━━━━━━━━━━━━\nTotal: %1 group(s)\n\n%2",
      returnListClean: "✨ Pending Group Requests\n━━━━━━━━━━━━━━━\nNo pending group requests found."
    }
  },

  onReply: async function({ api, event, Reply, getLang, commandName, prefix }) {
    if (String(event.senderID) !== String(Reply.author)) return;
    const { body, threadID, messageID } = event;
    let count = 0;

    // Cancel request(s)
    if (isNaN(body) && (body.indexOf("c") === 0 || body.toLowerCase().startsWith("cancel"))) {
      const indexList = (body.slice(1).trim()).split(/\s+/);
      for (const singleIndex of indexList) {
        if (isNaN(singleIndex) || singleIndex <= 0 || singleIndex > Reply.pending.length) 
          return api.sendMessage(getLang("invaildNumber", singleIndex), threadID, messageID);

        api.removeUserFromGroup(api.getCurrentUserID(), Reply.pending[singleIndex - 1].threadID);
        count++;
      }
      return api.sendMessage(getLang("cancelSuccess", count), threadID, messageID);
    } 
    
    // Approve request(s)
    else {
      const indexList = body.split(/\s+/);
      for (const singleIndex of indexList) {
        if (isNaN(singleIndex) || singleIndex <= 0 || singleIndex > Reply.pending.length) 
          return api.sendMessage(getLang("invaildNumber", singleIndex), threadID, messageID);

        const targetGroup = Reply.pending[singleIndex - 1].threadID;
        api.sendMessage(
          `🤖 Bot Connected\n━━━━━━━━━━━━━━━\n✨ The bot is now active in this group!\n\n📌 Use: ${prefix}commands to see available features.\n📍 Need help? Type: ${prefix}help`,
          targetGroup
        );
        count++;
      }
      return api.sendMessage(getLang("approveSuccess", count), threadID, messageID);
    }
  },

  onStart: async function({ api, event, getLang, commandName }) {
    const { threadID, messageID } = event;
    let msg = "", index = 1;

    try {
      const spam = await api.getThreadList(100, null, ["OTHER"]) || [];
      const pending = await api.getThreadList(100, null, ["PENDING"]) || [];
      const list = [...spam, ...pending].filter(group => group.isSubscribed && group.isGroup);

      for (const single of list) {
        msg += `${index++}. 📌 ${single.name} \n🆔 ${single.threadID}\n\n`;
      }

      if (list.length !== 0) {
        return api.sendMessage(
          getLang("returnListPending", list.length, msg),
          threadID,
          (err, info) => {
            global.GoatBot.onReply.set(info.messageID, {
              commandName,
              messageID: info.messageID,
              author: event.senderID,
              pending: list
            });
          },
          messageID
        );
      } else {
        return api.sendMessage(getLang("returnListClean"), threadID, messageID);
      }
    } catch (e) {
      return api.sendMessage(getLang("cantGetPendingList"), threadID, messageID);
    }
  }
};
