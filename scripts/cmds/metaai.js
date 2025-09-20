module.exports = {
  config: {
    name: "metaai",
    author: "frnwot",
    category: "ai",
    countDown: 5,
    role: 0,
    guide: { en: "metaai <prompt> - automatically mentions Meta AI and sends the prompt" }
  },

  onStart: async function({ message, event, args, api }) {
    const prompt = args.join(" ").trim();
    if (!prompt) return message.reply("❌ Please provide a prompt to send to Meta AI!");

    try {
      // Meta AI official account ID (replace with the correct one)
      const metaAIID = "META_AI_ID";

      // Send message mentioning Meta AI with exact space
      await api.sendMessage(
        {
          body: `@Meta AI ${prompt}`,
          mentions: [{
            tag: "Meta AI",
            id: metaAIID
          }]
        },
        event.threadID
      );

      message.reply("✅ Prompt sent to Meta AI! It should respond automatically.");
    } catch (err) {
      console.error(err);
      message.reply("❌ Failed to send prompt to Meta AI. Try again.");
    }
  }
};
