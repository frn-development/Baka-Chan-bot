import axios from "axios";

const config = {
  name: "edit 1",
  version: "2.0",
  permissions: 0,
  credits: "frnwot",
  prefix: true,
  description: "Ask anything to Gemini AI",
  commandCategory: "ai",
  usages: "[question]",
  role: 0,
  cooldown: 5
};

async function onCall({ message, args }) {
  const text = args.join(" ");
  if (!text) return message.reply("❌ Please provide a question.");

  try {
    await message.react("⏳");

    const res = await axios.get(`https://aryan-nix-apis.vercel.app/api/gemini?prompt=${encodeURIComponent(text)}`);
    const reply = res.data?.response || "❌ No response received.";

    await message.react("✅");
    return message.reply(reply);
  } catch (error) {
    console.error("Gemini CMD ERROR:", error);
    await message.react("❌");
    return message.reply("❌ Something went wrong while contacting Gemini AI.");
  }
}

export default {
  config,
  onCall
};
