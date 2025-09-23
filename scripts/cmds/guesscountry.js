import axios from "axios";

const config = {
  name: "Guess-country",
  version: "2.0",
  author: "Farhan",
  role: 0,
  countDown: 5,
  shortDescription: "Guess a country",
  longDescription: "Guess-country API: send a hint/input, get a country name back.",
  category: "fun",
  guide: {
    en: "{p}gcan <input>"
  }
};

async function onCall({ message, args }) {
  if (!args || args.length === 0) {
    return message.reply(
      "⚠️ You must provide something to guess the country.\nUsage: gcan <hint or name fragment>"
    );
  }

  const query = args.join(" ").trim();
  const waitMsg = await message.reply(`🔍 Guessing country for "${query}", please wait...`);

  try {
    const apiUrl = `https://sus-apis.onrender.com/api/guess-country?input=${encodeURIComponent(query)}`;
    const res = await axios.get(apiUrl);
    const data = res.data;

    if (!data) throw new Error("No data returned from API");

    let replyText = `🌍 Guess Country Result for: "${query}"\n`;
    if (data.country) replyText += `**Country:** ${data.country}\n`;
    if (data.confidence) replyText += `**Confidence:** ${data.confidence}\n`;
    if (data.more) replyText += `Additional Info: ${JSON.stringify(data.more)}`;

    await message.reply(replyText);

  } catch (err) {
    console.error("Error in gcan command:", err);
    await message.reply("❌ Failed to guess the country. Maybe invalid input or API error.");
  } finally {
    if (waitMsg?.messageID) message.unsend(waitMsg.messageID);
  }
}

export default {
  config,
  onCall
};
