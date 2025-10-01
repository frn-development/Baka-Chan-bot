const axios = require('axios');
const fs = require('fs');
const { Shazam } = require("node-shazam");
const qs = require('qs');
const yts = require('yt-search');

module.exports = {
  config: {
    name: "shazam",
    aliases: ["شزم", "شازام", "music", "songid", "identify"],
    author: "Takt Asahina & Farhan",
    version: "1.0",
    role: 0,
    description: {
      en: "Identify a song from a video or audio"
    },
    category: "media",
    usage: {
      en: "Reply to a video or audio file to identify the song"
    },
    cooldown: 5
  },

  onType: async function ({ api, event, sh: Message }) {
    if (event.type !== "message_reply") {
      return Message.reply("⚠️ Please reply to a video or audio file 🙂🚮");
    }

    try {
      let type = event.messageReply?.attachments[0]?.type;
      let path;

      if (type === "audio") {
        path = __dirname + "/cache/song.mp3";
      } else if (type === "video") {
        path = __dirname + "/cache/song.mp4";
      } else {
        return Message.reply("⚠️ This is not a video or audio file.");
      }

      let fileUrl = event.messageReply.attachments[0].url;
      let fileData = await axios.get(fileUrl, { responseType: "arraybuffer" });
      fs.writeFileSync(path, Buffer.from(fileData.data));

      const shazam = new Shazam();
      const recognise = await shazam.recognise(path, 'en-US');

      let format = {
        image: recognise?.track?.images?.coverart,
        name: recognise?.track?.title,
        author: recognise?.track?.subtitle
      };

      const info = await Message.reply({
        body: `🎵 Song Info:
• Artist: ${format.author} 👤
• Title: ${format.name} 🎶

Reply with "send" (or "ارسلي") to receive the song.`,
        attachment: (await axios.get(format.image, { responseType: "stream" })).data
      });

      return global.shelly.Reply.push({
        name: "shazam",
        ID: info.messageID,
        songName: format.name,
        author: event.senderID
      });

    } catch (err) {
      console.error(err);
      return Message.reply("❌ | An error occurred while identifying the song.");
    }
  },

  Reply: async ({ args, event, sh, Reply }) => {
    const { songName, author } = Reply;
    if (event.senderID !== author) return;
    if (event.body.toLowerCase() !== "send" && event.body !== "ارسلي") return;

    sh.reply("⏳ Fetching song, please wait...");

    const r = await yts(songName);
    const data = r.videos[0];
    const song = {
      title: data.title,
      link: data.url
    };

    sh.str(song.title, (await getMp3(song.link)).dlink);
  }
};

async function getInfo(url) {
  let data = qs.stringify({
    query: url,
    cf_token: '',
    vt: 'youtube'
  });

  let config = {
    method: 'POST',
    url: 'https://ssvid.net/api/ajax/search',
    headers: {
      'User-Agent': 'Mozilla/5.0',
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    data: data
  };

  return (await axios.request(config)).data;
}

async function download(vidCode, KCode) {
  let data = qs.stringify({ vid: vidCode, k: KCode });

  let config = {
    method: 'POST',
    url: 'https://ssvid.net/api/ajax/convert',
    headers: {
      'User-Agent': 'Mozilla/5.0',
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    data: data
  };

  return (await axios.request(config)).data;
}

async function getMp3(link) {
  const info = await getInfo(link);
  const firstMp3 = Object.values(info.links.mp3)[0];
  const data = await download(info.vid, firstMp3.k);
  return data;
  }
      
