const axios = require('axios');

module.exports = {
    config: {
        name: 'dadjoke',
        version: '1.0',
        author: 'Farhan',
        countDown: 5,
        prefix: true,
        groupAdminOnly: false,
        description: 'Get a random dad joke.',
        category: 'fun',
        guide: {
            en: '   {pn}\n\nExample: {pn}'
        },
    },

    onStart: async ({ api, event }) => {
        const apiUrl = `https://sus-apis.onrender.com/api/dad-joke`;

        try {
            console.log(`[API Request] Sending to: ${apiUrl}`);
            const response = await axios.get(apiUrl);

            if (response.data && response.data.joke) {
                api.sendMessage(
                    `😂 Dad Joke:\n\n${response.data.joke}`,
                    event.threadID,
                    event.messageID
                );
            } else {
                api.sendMessage("❌ Sorry, I couldn't fetch a dad joke right now.", event.threadID, event.messageID);
            }

        } catch (error) {
            console.error("Error fetching dad joke:", error);
            api.sendMessage("❌ Failed to fetch dad joke. Try again later.", event.threadID, event.messageID);
        }
    },
};
      
