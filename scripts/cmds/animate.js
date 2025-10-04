const axios = require("axios");
const { createCanvas, loadImage } = require("canvas");
const fs = require("fs");
const path = require("path");
const FormData = require("form-data");

// === API utils ===
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

async function uploadFile(pack, stream, prompt, duration = 5) {
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

// === Command ===
module.exports = {
  config: {
    name: "animate",
    version: "1.0",
    author: "goku black ",
    role: 0,
    description: "Animate a picture into a short video using a prompt",
    category: "fun",
    guide: "Reply to a picture and type: animate <your prompt>"
  },

  onStart: async function ({ event, message, usersData, media }) {
    if (!event.messageReply && !media) {
      return message.reply("❌ You must reply to an image to animate it!");
    }

    const promptText = event.body.replace(/^animate\s+/i, "").trim();
    if (!promptText) {
      return message.reply("❌ Please provide a prompt after the command.");
    }

    // Get the image stream
    let filePath;
    try {
      if (media) {
        filePath = media.filePath;
      } else {
        const url = event.messageReply.attachments[0].url;
        filePath = path.join(__dirname, "cache", `animate_${Date.now()}.png`);
        const writer = fs.createWriteStream(filePath);
        const response = await axios.get(url, { responseType: "stream" });
        response.data.pipe(writer);
        await new Promise((resolve) => writer.on("finish", resolve));
      }
    } catch (err) {
      console.error(err);
      return message.reply("❌ Failed to download the image.");
    }

    const waitMsg = await message.reply("⏳ Generating animated video...");

    try {
      const result = await imgToVideo(promptText, filePath, 5);
      await message.reply({
        body: `🎬 Animation complete! Prompt: ${promptText}`,
        attachment: await getStreamFromURL(result[0].video_url)
      });

      fs.unlinkSync(filePath);
    } catch (err) {
      console.error("animate command error:", err);
      message.reply("❌ Error while generating animation.");
    }
  }
};
