const axios = require('axios');
module.exports = {
config: {
	name: "edit",
	author: "Tawsif~",
	category: "media",
	countDown: 5,
	role: 0,
	guide: { en: "edit <prompt> | reply to image"
}
},
onStart: async function({ message, event, args }) {
const prompt = args.join(" ");
if (!event.messageReply || !event?.messageReply?.attachments[0]?.url) { return message.reply('reply to an image');
} else if (!prompt) { return message.reply("❌ | provide a prompt");
}
const replyImageUrl = event.messageReply.attachments[0].url;	message.reaction("⏳", event.messageID);
try {
		let url = `https://tawsifs-gemini.onrender.com/nano?prompt=${encodeURIComponent(prompt)}&url=${encodeURIComponent(replyImageUrl)}`;
const res = await axios.get(url);
await message.reply({ attachment: await global.utils.getStreamFromURL(res.data.data.imageResponseVo.urls[0], 'edit.png'), body: `✅ | nigga image Edited succesfully`,
});
} catch (error) { message.send("❌ | " + error.message);
		}
	}
}
