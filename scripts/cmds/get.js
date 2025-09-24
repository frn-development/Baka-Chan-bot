const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports.config = {
  name: "get", // renamed command
  version: "1.2.0",
  author: "Gtajisan",
  countDown: 5,
  role: 0,
  description: "Get Free Fire profile image or full info by UID",
  prefix: true,
  commandCategory: "game",
  usages: "get [uid] | get full [uid]"
};

module.exports.run = async function({ api, event, args }) {
  if (!args[0]) return api.sendMessage("❌ Please provide a UID.\nUsage: get [uid] | get full [uid]", event.threadID, event.messageID);

  let fullMode = false;
  let uid = args[0];

  if (args[0].toLowerCase() === "full") {
    if (!args[1]) return api.sendMessage("❌ Please provide a UID after 'full'.", event.threadID, event.messageID);
    fullMode = true;
    uid = args[1];
  }

  try {
    if (fullMode) {
      // Fetch full profile info
      const res = await axios.get(`https://hridoy-ff-1.onrender.com/api/get?uid=${uid}`);
      const data = res.data;

      if (!data || !data.name) return api.sendMessage("❌ Profile not found.", event.threadID, event.messageID);

      const infoText = `
💠 Name: ${data.name || "N/A"}
💠 UID: ${data.uid || "N/A"}
💠 Level: ${data.level || "N/A"}
💠 Rank: ${data.rank || "N/A"}
💠 Guild: ${data.guild || "N/A"}
💠 Status: ${data.status || "N/A"}
      `;

      api.sendMessage(infoText, event.threadID, event.messageID);

    } else {
      // Fetch profile image only
      const res = await axios.get(`https://hridoy-ff-1.onrender.com/api/profile?uid=${uid}`);
      const data = res.data;

      if (!data || !data.profile || !data.profile.profile_picture) return api.sendMessage("❌ Profile not found.", event.threadID, event.messageID);

      const imgUrl = data.profile.profile_picture;
      const imgPath = path.join(__dirname, `ff-${uid}.jpg`);
      const imgRes = await axios({ url: imgUrl, responseType: "arraybuffer" });
      fs.writeFileSync(imgPath, Buffer.from(imgRes.data, "binary"));

      api.sendMessage(
        { body: `✅ Profile image for UID ${uid}`, attachment: fs.createReadStream(imgPath) },
        event.threadID,
        () => fs.unlinkSync(imgPath),
        event.messageID
      );
    }
  } catch (err) {
    console.error(err);
    api.sendMessage("❌ Error fetching profile. Check UID or API availability.", event.threadID, event.messageID);
  }
};
        
