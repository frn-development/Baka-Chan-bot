const axios = require('axios');
module.exports = {
config: {
	name: "edit",
	author: "Tawsif~",
	category: "ai",
	countDown: 5,
	role: 0,
description: "edit images using Nano-Banana AI",
	guide: { en: "edit <prompt> | reply to image"
}
},
onStart: async function({ message, event, args }) {
const prompt = args.join(" ");
if (!event.messageReply || !event?.messageReply?.attachments[0]?.url) { return message.reply('reply to an image');
} else if (!prompt) { return message.reply("❌ | provide a prompt");
}
const imageUrl = event.messageReply.attachments[0].url;
	message.reaction("⏳", event.messageID);
try {
const res = await axios.get(`https://tawsif.is-a.dev/gemini/nano-banana?prompt=${encodeURIComponent(prompt)}&url=${encodeURIComponent(imageUrl)}`);
message.reply({ attachment: await global.utils.getStreamFromURL(res.data.imageUrl, 'edit.png'), body: `✅ | image Edited succesfully`,
});
} catch (error) { message.send("❌ | " + error.message);
		}
	}
}
