const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

module.exports.config = {
    name: "mara",
    version: "1.0",
    author: "Farhan",
    countDown: 10,
    role: 0,
    prefix: false,
    description: "Sends a specific video",
    category: "media",
    guide: {
        en: "Just type 'mara' to get the video."
    }
};

module.exports.onStart = async ({ api, event }) => {
    try {
        const threadId = event.threadID;

        const videoUrl = "https://drive.google.com/uc?export=download&id=1LDi1MfzVe3pyFNMVvTfcBe7jlxhwsUze";
        console.log(`[API Request] Sending to: ${videoUrl}`);

        const response = await axios.get(videoUrl, { responseType: 'arraybuffer' });
        console.log(`[API Response] Status: ${response.status}, Status Text: ${response.statusText}`);

        if (response.status !== 200 || !response.data || response.data.byteLength < 1000) {
            throw new Error('Invalid video response from URL');
        }

        const tempDir = path.join(__dirname, '../../temp');
        await fs.ensureDir(tempDir);
        const videoPath = path.join(tempDir, `mara_${Date.now()}.mp4`);
        await fs.writeFile(videoPath, Buffer.from(response.data));

        await api.sendMessage(
            {
                body: 'riyal!',
                attachment: fs.createReadStream(videoPath),
            },
            threadId
        );

        await fs.unlink(videoPath);
    } catch (error) {
        console.error('Error in mara command:', error);
        api.sendMessage('❌ Failed to fetch or send the video.', event.threadID);
    }
};
