const axios = require("axios");
const { createCanvas, loadImage } = require("canvas");
const fs = require("fs");
const path = require("path");
const FormData = require("form-data");

// === Helpers ===
async function getStreamFromURL(url) {
  const res = await axios.get(url, { responseType: "stream" });
  return res.data;
}

function generateRandomId(len = 16) {
  const chars = "abcdef0123456789";
  return Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

async function getBalance() {
  const pack = generateRandomId();
  await axios.post("https://api.getglam.app/rewards/claim/hdnu30r7auc4kve", null, {
    headers: {
      "User-Agent": "Glam/1.58.4 Android/32 (Samsung SM-A156E)",
      "glam-user-id": pack,
      "user_id": pack,
      "glam-local-date": new Date().toISOString(),
    },
  });
  return pack;
}

async function uploadFile(pack, stream, prompt, duration) {
  const form = new FormData();
  form.append("package_id", pack);
  form.append("media_file", stream);
  form.append("media_type", "image");
  form.append("template_id", "community_img2vid");
  form.append("template_category", "20_coins_dur");
  form.append("frames", JSON.stringify([{
    prompt,
    custom_prompt: prompt,
    start: 0,
    end: 0,
    timings_units: "frames",
    media_type: "image",
    style_id: "chained_falai_img2video",
    rate_modifiers: { duration: duration.toString() + "s" },
  }]));
  const res = await axios.post("https://android.getglam.app/v2/magic_video", form, {
    headers: { ...form.getHeaders(), "User-Agent": "Glam/1.58.4 Android/32 (Samsung SM-A156E)" },
  });
  return res.data.event_id;
}

async function getStatus(taskID, pack) {
  while (true) {
    const res = await axios.get("https://android.getglam.app/v2/magic_video", {
      params: { package_id: pack, event_id: taskID },
      headers: { "User-Agent": "Glam/1.58.4 Android/32 (Samsung SM-A156E)" },
    });
    if (res.data.status === "READY") return [res.data];
    await new Promise(r => setTimeout(r, 2000));
  }
}

async function imgToVideo(prompt, filePath, duration = 5) {
  const pack = await getBalance();
  const task = await uploadFile(pack, fs.createReadStream(filePath), prompt, duration);
  return await getStatus(task, pack);
}

async function getAvatar(uid, usersData) {
  let url = null;
  try {
    url = await usersData.getAvatarUrl(uid);
  } catch (e) {}
  if (!url) {
    url = `https://graph.facebook.com/${uid}/picture?width=512&height=512`;
  }
  return url;
}

async function mergeAvatars(url1, url2) {
  const img1 = await loadImage(url1);
  const img2 = await loadImage(url2);
  const size = 512;
  const canvas = createCanvas(size * 2, size);
  const ctx = canvas.getContext("2d");

  ctx.drawImage(img1, 0, 0, size, size);
  ctx.drawImage(img2, size, 0, size, size);

  const cacheDir = path.join(__dirname, "cache");
  if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);

  const filePath = path.join(cacheDir, `kiss_${Date.now()}.png`);
  fs.writeFileSync(filePath, canvas.toBuffer("image/png"));
  return filePath;
}

// === Command ===
module.exports = {
  config: {
    name: "kiss2",
    Auth: 0,
    Owner: "Hina",
    Info: "😘 Kiss interaction between two people",
    Class: "✧༺Fun_List༻✧",
    How: "Reply to someone with 'kiss' OR use: kiss <uid1> <uid2>"
  },

  onType: async function ({ event, sh, usersData, args }) {
    let uid1, uid2;

    if (args.length >= 2) {
      // Case: command with two IDs
      uid1 = args[0];
      uid2 = args[1];
    } else if (event.messageReply && event.messageReply.senderID) {
      // Case: reply to someone
      uid1 = event.senderID;
      uid2 = event.messageReply.senderID;
    } else {
      return sh.reply("❌ Please reply to someone or provide 2 UIDs like: kiss <uid1> <uid2>");
    }

    const url1 = await getAvatar(uid1, usersData);
    const url2 = await getAvatar(uid2, usersData);

    const prompt = "two people kissing each other, romantic, realistic style";

    await sh.react("⏳");

    try {
      const mergedPath = await mergeAvatars(url1, url2);
      const result = await imgToVideo(prompt, mergedPath);

      await sh.react("✅");

      await sh.reply({
        body: `😘 | ${await usersData.getName(uid1)} is kissing ${await usersData.getName(uid2)}`,
        attachment: await getStreamFromURL(result[0].video_url)
      });

      fs.unlinkSync(mergedPath);
    } catch (err) {
      console.error("kiss error:", err);
      sh.reply("❌ An error occurred while creating the kiss video.");
    }
  }
};
  
