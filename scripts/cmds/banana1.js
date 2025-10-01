const axios = require('axios');
const fs = require('fs');
const path = require('path');
const os = require('os');

const API_BASE = 'https://dev.oculux.xyz/api/nanobanana';

module.exports = {
  config: {
    name: 'nanobanana1',
    aliases: ['nano', 'banana', 'nanob'],
    version: '1.0',
    author: 'farhan',
    cooldown: 8,      // seconds
    description: 'Generate Nano Banana images using the external API',
    usage: '.nanobanana <prompt> | <seed?>',
    allow: 'all'      // adjust per your bot's permission system
  },

  // GoatBot requires onStart instead of start
  async onStart({ message, args, event, api, commandName }) {
    try {
      // parse prompt and optional seed
      let raw = args.length ? args.join(' ') : '';
      if (!raw) {
        return message.reply(
          `Usage:\n.${commandName} <prompt> | <seed?>\n\nExample:\n.${commandName} a cute banana astronaut | 42`
        );
      }

      let prompt = raw;
      let seed = '';
      if (raw.includes('|')) {
        const parts = raw.split('|').map(p => p.trim());
        prompt = parts[0] || '';
        seed = parts[1] || '';
      }

      if (!prompt) return message.reply('⚠️ Please provide a prompt.');

      message.reply('⏳ Generating image... 🌱');

      // API url
      const url = `${API_BASE}?prompt=${encodeURIComponent(prompt)}${seed ? `&seed=${encodeURIComponent(seed)}` : ''}`;

      // fetch image
      const response = await axios.get(url, {
        responseType: 'arraybuffer',
        timeout: 120000,
        headers: { 'User-Agent': 'GoatBot-v2-NanoBanana/1.0' }
      });

      const contentType = response.headers['content-type'] || '';
      let ext = '.jpg';
      if (contentType.includes('png')) ext = '.png';
      else if (contentType.includes('webp')) ext = '.webp';
      else if (contentType.includes('gif')) ext = '.gif';

      // save temp file
      const tmpFile = path.join(os.tmpdir(), `nanobanana_${Date.now()}${ext}`);
      fs.writeFileSync(tmpFile, Buffer.from(response.data));

      // send image
      await message.reply({
        body: `✅ Generated!\n\nPrompt: ${prompt}${seed ? `\nSeed: ${seed}` : ''}`,
        attachment: fs.createReadStream(tmpFile)
      });

      fs.unlinkSync(tmpFile); // cleanup
    } catch (err) {
      console.error('nanobanana error:', err);
      const errMsg = err?.response?.data
        ? JSON.stringify(err.response.data).slice(0, 500)
        : (err.message || String(err)).slice(0, 500);

      message.reply(`❌ Failed to generate image.\nError: ${errMsg}`);
    }
  }
};
