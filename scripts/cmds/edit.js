const axios = require("axios");

module.exports = {
  config: {
    name: "edit",
    aliases: ["gmn"],
    version: "1.2",
    author: "frnwot",
    shortDescription: "Gemini AI with image & text support",
    longDescription: "Send text or image to Gemini API and get AI response.",
    category: "ai",
    guide: "{pn}gemini <text question> or reply to an image",
  },

  onStart: async function({ api, event, args }) {
    const uid = 1;
    const apikey = "66e0cfbb-62b8-4829-90c7-c78cacc72ae2";

    // Check if reply to an image
    let isReplyToImage = false;
    let imageUrl = "";

    if (
      event.messageReply &&
      event.messageReply.attachments &&
      event.messageReply.attachments.length > 0 &&
      event.messageReply.attachments[0].type === "photo"
    ) {
      isReplyToImage = true;
      imageUrl = event.messageReply.attachments[0].url;
    }

    let payloadUrl = "";
    if (isReplyToImage) {
      // Send image url in ask param (or if API supports base64, can do that)
      // Here assuming API accepts image URL in `ask` param
      payloadUrl = `https://kaiz-apis.gleeze.com/api/gemini-pro?ask=${encodeURIComponent(imageUrl)}&uid=${uid}&apikey=${apikey}`;
    } else {
      if (args.length === 0) {
        return api.sendMessage(
          "❌ Please provide a question or reply to an image with a question.",
          event.threadID,
          event.messageID
        );
      }
      const textQuery = args.join(" ");
      payloadUrl = `https://kaiz-apis.gleeze.com/api/gemini-pro?ask=${encodeURIComponent(textQuery)}&uid=${uid}&apikey=${apikey}`;
    }

    try {
      const res = await axios.get(payloadUrl);
      if (res.data && res.data.response) {
        return api.sendMessage(`\n${res.data.response}`, event.threadID, event.messageID);
      } else {
        return api.sendMessage("⚠️ No valid response from Gemini API.", event.threadID, event.messageID);
      }
    } catch (err) {
      console.error("Gemini API error:", err);
      return api.sendMessage(
        "❌ Failed to contact Gemini API. Please try again later.",
        event.threadID,
        event.messageID
      );
    }
  },
};
