const fs = require("fs");

const approvedDataPath = "threadApproved.json";

module.exports = {
  config: {
    name: "approve",
    aliases: ["app"],
    author: "frn", // don't change my credit
    countDown: 0,
    role: 2,
    category: "admin",
    shortDescription: {
      en: "Manage approved group chats"
    }
  },

  onLoad: async function () {
    if (!fs.existsSync(approvedDataPath)) {
      fs.writeFileSync(approvedDataPath, JSON.stringify([]));
    }
  },

  onStart: async function ({ event, api, args }) {
    const { threadID, messageID, senderID } = event;
    const command = args[0] || "";
    const idToApprove = args[1] || threadID;
    const customMessage = args.slice(2).join(" ");
    const adminID = "100094924471568";
    let approvedData = JSON.parse(fs.readFileSync(approvedDataPath));

    switch (command) {
      // 📋 List approved groups
      case "list": {
        if (approvedData.length === 0) {
          return api.sendMessage("📋 No groups are approved yet.", threadID, messageID);
        }
        let msg = "✅ Approved Groups\n──────────────────\n\n";
        for (let index = 0; index < approvedData.length; index++) {
          const groupId = approvedData[index];
          const threadInfo = await api.getThreadInfo(groupId);
          const groupName = threadInfo ? (threadInfo.name || "Unnamed Group") : "Unnamed Group";
          msg += `#${index + 1}\n📌 Name: ${groupName}\n🆔 ID: ${groupId}\n──────────────\n`;
        }
        return api.sendMessage(msg, threadID, messageID);
      }

      // ❌ Delete group from approved list
      case "del": {
        if (!isNumeric(idToApprove)) {
          return api.sendMessage("⚠ Invalid group ID. Please check again.", threadID, messageID);
        }
        if (!approvedData.includes(idToApprove)) {
          return api.sendMessage("❌ This group is not in the approved list.", threadID, messageID);
        }

        approvedData = approvedData.filter((e) => e !== idToApprove);
        fs.writeFileSync(approvedDataPath, JSON.stringify(approvedData, null, 2));

        const threadInfoDel = await api.getThreadInfo(idToApprove);
        const groupNameDel = threadInfoDel.name || "Unnamed Group";

        return api.sendMessage(
          `🗑 Removed from Approved List\n──────────────────\n📌 Group: ${groupNameDel}\n🆔 ID: ${idToApprove}`,
          threadID,
          messageID
        );
      }

      // 📦 Batch approve groups
      case "batch": {
        const idsToApprove = args.slice(1);
        if (idsToApprove.length === 0) {
          return api.sendMessage("⚠ Please provide group IDs to approve in batch.", threadID, messageID);
        }

        let batchMessage = "📦 Batch Approval Completed\n──────────────────\n";
        for (const id of idsToApprove) {
          if (isNumeric(id) && !approvedData.includes(id)) {
            approvedData.push(id);
            const threadInfoBatch = await api.getThreadInfo(id);
            const groupNameBatch = threadInfoBatch.name || "Unnamed Group";
            batchMessage += `📌 Group: ${groupNameBatch}\n🆔 ID: ${id}\n──────────────\n`;
          }
        }
        fs.writeFileSync(approvedDataPath, JSON.stringify(approvedData, null, 2));
        return api.sendMessage(batchMessage, threadID, messageID);
      }

      // 🔍 Search approved groups
      case "search": {
        const searchTerm = args.slice(1).join(" ");
        if (!searchTerm) {
          return api.sendMessage("🔍 Please provide a search term.", threadID, messageID);
        }

        let searchMsg = `🔍 Search Results for: "${searchTerm}"\n──────────────────\n`;
        let found = false;

        for (let index = 0; index < approvedData.length; index++) {
          const groupId = approvedData[index];
          const threadInfoSearch = await api.getThreadInfo(groupId);
          const groupNameSearch = threadInfoSearch ? (threadInfoSearch.name || "Unnamed Group") : "Unnamed Group";
          if (groupNameSearch.includes(searchTerm) || groupId.includes(searchTerm)) {
            found = true;
            searchMsg += `#${index + 1}\n📌 Name: ${groupNameSearch}\n🆔 ID: ${groupId}\n──────────────\n`;
          }
        }

        if (!found) searchMsg += "❌ No matches found.";
        return api.sendMessage(searchMsg, threadID, messageID);
      }

      // ✅ Default: Approve group
      default: {
        if (!isNumeric(idToApprove)) {
          return api.sendMessage("⚠ Invalid group ID.", threadID, messageID);
        }
        if (approvedData.includes(idToApprove)) {
          const threadInfo = await api.getThreadInfo(idToApprove);
          const groupName = threadInfo.name || "Unnamed Group";
          return api.sendMessage(`✅ Group already approved:\n📌 ${groupName}\n🆔 ${idToApprove}`, threadID, messageID);
        }

        // Approve new group
        approvedData.push(idToApprove);
        fs.writeFileSync(approvedDataPath, JSON.stringify(approvedData, null, 2));

        const userInfo = await api.getUserInfo(senderID);
        const userName = userInfo[senderID].name;
        const threadInfo = await api.getThreadInfo(idToApprove);
        const groupName = threadInfo.name || "Unnamed Group";

        const approvalMessage = `🎉 Group Approved!\n──────────────────\n📌 Group: ${groupName}\n🆔 ID: ${idToApprove}\n👤 Approved By: ${userName}\n🗓 Time: ${new Date().toLocaleString()}\n📊 Total Approved: ${approvedData.length}\n\n${customMessage}`;

        // Send to approved group
        api.sendMessage(approvalMessage, idToApprove);

        // Confirm in current chat
        api.sendMessage(`✅ Successfully Approved:\n📌 Group: ${groupName}\n🆔 ID: ${idToApprove}`, threadID, messageID);

        // Admin notification (optional)
        const adminNotificationEnabled = true;
        if (adminNotificationEnabled) {
          api.sendMessage(approvalMessage, adminID);
        }
      }
    }
  }
};

function isNumeric(value) {
  return /^-?\d+$/.test(value);
}
