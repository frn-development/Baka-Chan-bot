const axios = require('axios');
const fs = require('fs-extra');

module.exports = {
    config: {
        name: "meme",
        version: "1.0",
        author: "Farhan",
        countDown: 5,
        prefix: true,
        adminOnly: false,
        description: "Fetch memes from Bangladeshi Meme API",
        category: "fun",
        guide: {
            en: "   {pn}: Get a random meme.\n   {pn} 10: Get 10 random memes.\n   {pn} <query>: Search memes by keyword (max 5)."
        }
    },

    onStart: async ({ event, api, args }) => {
        try {
            const baseUrl = "https://bangladeshi-meme-api.vercel.app/api";
            let endpoint, message;

            if (args[0] === "10") {
                endpoint = "/random10";
                message = "Here are 10 random memes:";
            } else if (args.length > 0) {
                endpoint = `/search?query=${encodeURIComponent(args.join(" "))}`;
                message = `Search results for "${args.join(" ")}":`;
            } else {
                endpoint = "/random1";
                message = "Random meme:";
            }

            const response = await axios.get(`${baseUrl}${endpoint}`, { timeout: 15000 });
            const data = response.data;

            const cacheDir = './cache';
            await fs.ensureDir(cacheDir);
            const attachments = [];

            if (endpoint === "/random1") {
                const { id, title, image_url } = data;
                const imagePath = `${cacheDir}/meme_${id}_${Date.now()}.png`;
                const imageResponse = await axios.get(image_url, { responseType: 'arraybuffer', timeout: 15000 });
                await fs.writeFile(imagePath, Buffer.from(imageResponse.data));
                attachments.push(fs.createReadStream(imagePath));
                await api.sendMessage({
                    body: `${message}\nID: ${id}\nTitle: ${title}`,
                    attachment: attachments
                }, event.threadID, () => fs.unlinkSync(imagePath));
            } else if (endpoint === "/random10") {
                for (const meme of data) {
                    const { id, image_url } = meme;
                    const imagePath = `${cacheDir}/meme_${id}_${Date.now()}.png`;
                    const imageResponse = await axios.get(image_url, { responseType: 'arraybuffer', timeout: 15000 });
                    await fs.writeFile(imagePath, Buffer.from(imageResponse.data));
                    attachments.push(fs.createReadStream(imagePath));
                }
                await api.sendMessage({
                    body: `${message}`,
                    attachment: attachments
                }, event.threadID, () => attachments.forEach(stream => fs.unlinkSync(stream.path)));
            } else {
                for (const meme of data.slice(0, 5)) {
                    const { id, image_url } = meme;
                    const imagePath = `${cacheDir}/meme_${id}_${Date.now()}.png`;
                    const imageResponse = await axios.get(image_url, { responseType: 'arraybuffer', timeout: 15000 });
                    await fs.writeFile(imagePath, Buffer.from(imageResponse.data));
                    attachments.push(fs.createReadStream(imagePath));
                }
                await api.sendMessage({
                    body: `${message}`,
                    attachment: attachments
                }, event.threadID, () => attachments.forEach(stream => fs.unlinkSync(stream.path)));
            }

            log('info', `Meme command executed by ${event.senderID} in thread ${event.threadID}`);
        } catch (error) {
            log('error', `Meme command error: ${error.message || 'Unknown error'}`);
            api.sendMessage('An error occurred while fetching memes. Please try again later.', event.threadID);
        }
    }
};
