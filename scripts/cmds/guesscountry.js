const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "guesscountry",
    aliases: ["gcountry", "quizcountry"],
    version: "2.0",
    author: "Farhan & Hridoy",
    countDown: 5,
    role: 0,
    shortDescription: "Play a guess the country quiz",
    longDescription: "Guess the country based on the given clue and multiple-choice answers.",
    category: "fun",
    guide: "{pn}"
  },

  onStart: async function ({ message, event }) {
    try {
      const res = await axios.get("https://sus-apis-2.onrender.com/api/guess-country");
      const data = res.data;

      if (!data.success) {
        return message.reply("❌ Could not fetch country data. Try again later.");
      }

      const clue = data.clue;
      const options = data.options;
      const answer = data.answer;

      const optionText = `a) ${options[0]}\nb) ${options[1]}\nc) ${options[2]}\nd) ${options[3]}`;

      const quizMsg = `🌍 Country Quiz\n\n🧩 Clue: ${clue}\n\n${optionText}\n\nReply with a, b, c, or d to answer.`;

      const sent = await message.reply(quizMsg);

      // Save reply handler
      this.reply.set(sent.messageID, {
        messageID: sent.messageID,
        author: event.senderID,
        correctAnswer: answer.name,
        correctIndex: options.indexOf(answer.name),
        flagUrl: answer.flag_url,
        timeout: setTimeout(() => {
          if (this.reply.has(sent.messageID)) {
            this.reply.delete(sent.messageID);
            message.reply("⏰ Time is up! You did not answer.");
          }
        }, 60000)
      });

    } catch (error) {
      console.error(error);
      message.reply("❌ Failed to start country quiz. Try again later.");
    }
  },

  onReply: async function ({ message, event, Reply }) {
    const reply = event.body.trim().toLowerCase();
    const { author, correctAnswer, correctIndex, flagUrl, timeout } = Reply;

    if (event.senderID !== author) {
      return message.reply("⚠️ Only the user who started the quiz can answer.");
    }

    if (!["a", "b", "c", "d"].includes(reply)) {
      return message.reply("⚠️ Please reply with only 'a', 'b', 'c', or 'd'.");
    }

    clearTimeout(timeout);
    this.reply.delete(Reply.messageID);

    const userAnswerIndex = { a: 0, b: 1, c: 2, d: 3 }[reply];
    const correct = userAnswerIndex === correctIndex;

    try {
      const response = await axios.get(flagUrl, { responseType: "arraybuffer" });
      const cacheDir = path.join(__dirname, "cache");
      if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);
      const imgPath = path.join(cacheDir, `country_flag_${Date.now()}.png`);
      fs.writeFileSync(imgPath, Buffer.from(response.data, "binary"));

      const resultMsg = correct
        ? `✅ Correct! The country is **${correctAnswer}**.`
        : `❌ Wrong! The correct answer was **${correctAnswer}**.`;

      await message.reply({
        body: resultMsg,
        attachment: fs.createReadStream(imgPath)
      }, () => fs.unlinkSync(imgPath));

    } catch (err) {
      console.error(err);
      const resultMsg = correct
        ? `✅ Correct! The country is **${correctAnswer}**.`
        : `❌ Wrong! The correct answer was **${correctAnswer}**.`;
      message.reply(resultMsg);
    }
  }
};
        
