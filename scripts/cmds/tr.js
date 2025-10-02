const axios = require("axios");

module.exports = {
  config: {
    name: "tr",
    version: "2.0",
    author: "Farhan",
    role: 0,
    shortDescription: {
      en: "Alien Auto Arabic → English translator"
    },
    longDescription: {
      en: "Automatically detects Arabic messages and translates them into English in a clean format."
    },
    category: "auto",
    guide: {
      en: "Runs automatically, no prefix needed."
    }
  },

  onChat: async function ({ event, api }) {
    try {
      const msg = event.body;

      // Detect Arabic text
      const arabicRegex = /[\u0600-\u06FF]/;
      if (!arabicRegex.test(msg)) return;

      // Translation API
      const url = `https://hridoy-apis.vercel.app/tools/translate?text=${encodeURIComponent(msg)}&targetLang=English&sourceLang=Arabic&apikey=hridoyXQC`;
      const res = await axios.get(url);

      if (res.data && res.data.translatedText) {
        const reply = 
`👽 AlienCe Translator  
━━━━━━━━━━━━━━━  
🌍 Original (AR):  
${msg}  

⚡ Translated (EN):  
${res.data.translatedText}  
━━━━━━━━━━━━━━━`;

        return api.sendMessage(reply, event.threadID, event.messageID);
      }
    } catch (err) {
      console.error("Alience TR error:", err.message);
    }
  }
};
