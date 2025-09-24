const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports.config = {
  name: "ff-profile",
  version: "1.0.0",
  author: "Gtajisan",
  countDown: 5,
  role: 0,
  description: "Get Free Fire profile image by UID",
  prefix: true,
  commandCategory: "fan",
  usages: "ff-profile [uid]"
};

module.exports.run = async function({ api, event, args }) {
  if (!args[0]) {
    return api.sendMessage("❌ Please provide a UID.\nUsage: !ff-profile [uid]", event.threadID, event.messageID);
  }

  const uid = args[0];
  const url = `https://hridoy-ff-1.onrender.com/api/profile?uid=${uid}`;

  try {
    const res = await axios.get(url);
    const data = res.data;

    if (!data || !data.profile || !data.profile.profile_picture) {
      return api.sendMessage("❌ Profile not found or UID is invalid.", event.threadID, event.messageID);
    }

    const profilePicUrl = data.profile.profile_picture;

    // Download image temporarily
    const imgPath = path.join(__dirname, `ff-${uid}.jpg`);
    const imgRes = await axios({ url: profilePicUrl, responseType: "arraybuffer" });
    fs.writeFileSync(imgPath, Buffer.from(imgRes.data, "binary"));

    // Send only image with simple text
    api.sendMessage(
      { body: `✅ Profile image for UID ${uid}`, attachment: fs.createReadStream(imgPath) },
      event.threadID,
      () => fs.unlinkSync(imgPath), // remove temp file
      event.messageID
    );

  } catch (err) {
    console.error(err);
    api.sendMessage("❌ Error fetching profile. Make sure the UID is correct.", event.threadID, event.messageID);
  }
};
