const axios = require('axios');

module.exports = {
    config: {
        name: 'ai4',
        version: '1.0',
        author: 'frwot',
        role: 0,
        countDown: 5,
        prefix: true,
        groupAdminOnly: false,
        description: 'Chat with an AI using AI4.',
        category: 'ai',
        guide: {
            en: '   {pn}ai4 <query>'
        },
    },
    onStart: async ({ api, event, args }) => {
        const threadID = event.threadID;
        const messageID = event.messageID;

        const query = args.join(' ').trim();
        if (!query) {
            return api.sendMessage('❌ Please provide a query. Example: !ai4 Tell me a story', threadID, messageID);
        }

        try {
            console.log(`Requesting AI4 with query: ${query}`);
            const response = await axios.get(
                `https://hridoy-apis.onrender.com/ai/ai4chat?text=${encodeURIComponent(query)}`,
                { timeout: 15000 }
            );

            console.log('AI4 response:', response.data);

            if (response.data.status && response.data.result) {
                api.sendMessage(response.data.result, threadID, messageID);
            } else {
                throw new Error('Invalid response from AI4 API');
            }
        } catch (error) {
            console.error('AI4 error:', error.message);
            api.sendMessage(`❌ Error: ${error.message}`, threadID, messageID);
        }
    },
};
