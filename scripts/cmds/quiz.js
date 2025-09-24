const axios = require('axios');

module.exports = {
    config: {
        name: 'quiz',
        version: '1.0',
        author: 'Farhan',
        countDown: 5,
        prefix: true,
        adminOnly: false,
        description: 'Hard-level boolean trivia quiz (English)',
        category: 'game',
        guide: {
            en: '{pn}quiz'
        }
    },

    onStart: async ({ api, event }) => {
        const { threadID, senderID } = event;

        try {
            const res = await axios.get('https://sus-apis.onrender.com/api/quiz?amount=1&difficulty=hard&type=boolean');
            const questionData = res.data?.results?.[0];

            if (!res.data || !questionData) {
                return api.sendMessage('❌ Could not load quiz. Try again later.', threadID);
            }

            const options = ['True', 'False'];
            const correctIndex = questionData.correct_answer.toLowerCase() === 'true' ? 0 : 1;

            const cleanCategory = questionData.category.replace(/&amp;/g, '&');
            const question = questionData.question.replace(/&quot;/g, '"').replace(/&#039;/g, "'");

            const optionText = `a) True\nb) False`;

            const quizMsg = `🧠 Hard Quiz: [${cleanCategory}]\n\n❓ ${question}\n\n${optionText}\n\nReply with a or b to answer.`;

            const sentMsg = await api.sendMessage(quizMsg, threadID);

            global.client.handleReply.push({
                name: 'quiz',
                messageID: sentMsg.messageID,
                threadID,
                senderID,
                correctIndex,
                options,
                timeout: setTimeout(async () => {
                    const idx = global.client.handleReply.findIndex(e => e.messageID === sentMsg.messageID && e.name === 'quiz');
                    if (idx >= 0) global.client.handleReply.splice(idx, 1);
                    await api.sendMessage('⏰ Time is up! You didn’t answer.', threadID);
                }, 60000)
            });

            console.log(`📌 Hard quiz sent to ${senderID} in thread ${threadID}`);

        } catch (error) {
            console.error(`❌ Quiz fetch error: ${error.message}`);
            api.sendMessage('❌ Failed to fetch quiz. Try again later.', threadID);
        }
    },

    handleReply: async ({ event, api, handleReply }) => {
        const reply = event.body.trim().toLowerCase();
        const { threadID, senderID, messageID } = event;

        if (!event.messageReply || event.messageReply.messageID !== handleReply.messageID) {
            return api.sendMessage('⚠️ This is not a reply to the quiz.', threadID, messageID);
        }

        if (!['a', 'b'].includes(reply)) {
            return api.sendMessage('⚠️ Please reply with only "a" or "b".', threadID, messageID);
        }

        const idx = global.client.handleReply.findIndex(e => e.messageID === handleReply.messageID && e.name === 'quiz');
        if (idx >= 0) {
            clearTimeout(global.client.handleReply[idx].timeout);
            global.client.handleReply.splice(idx, 1);
        }

        const userIndex = { a: 0, b: 1 }[reply];
        const correctAnswer = handleReply.options[handleReply.correctIndex];

        if (userIndex === handleReply.correctIndex) {
            await api.sendMessage('✅ Correct! Well done.', threadID, messageID);
        } else {
            await api.sendMessage(`❌ Incorrect.\nThe correct answer was: ${correctAnswer}`, threadID, messageID);
        }

        console.log(`📌 User ${senderID} answered "${reply}" for quiz in thread ${threadID}. Correct: ${userIndex === handleReply.correctIndex}`);
    }
};
              
