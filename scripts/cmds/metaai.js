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
      // Replace 'META_AI_ID' with the official Meta AI account ID
      const metaAIID = "META_AI_ID";

      // Send a message mentioning Meta AI with your prompt
      await api.sendMessage(
        {
          body: `@MetaAI ${prompt}`,
          mentions: [{
            tag: "MetaAI",
            id: metaAIID
          }]
        },
        event.threadID
      );

      message.reply("✅ Prompt sent to Meta AI!");
    } catch (err) {
      console.error(err);
      message.reply("❌ Failed to send prompt to Meta AI. Try again.");
    }
  }
};
