// ss.js
const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "ss1",
    version: "1.0",
    author: "Farhan",
    shortDescription: {
      en: "Take a website screenshot"
    },
    longDescription: {
      en: "Usage: ss <url>  —  Example: ss https://example.com\nYou can also reply to a message containing a URL with this command."
    },
    cooldown: 5,
    role: 0, // change if you restrict usage
    aliases: ["screenshot"]
  },

  start: async function ({ api, event, args }) {
    try {
      const threadID = event.threadID;
      const messageID = event.messageID;

      // get URL from args or from replied message
      let url = args && args[0] ? args[0].trim() : null;
      if (!url && event.messageReply && event.messageReply.body) {
        url = event.messageReply.body.trim().split(/\s+/)[0]; // take first token
      }

      if (!url) {
        return api.sendMessage(
          "❌ Please provide a URL. Example: ss https://example.com  or reply to a message containing the URL.",
          threadID,
          messageID
        );
      }

      // add protocol if missing
      if (!/^https?:\/\//i.test(url)) url = "http://" + url;

      const apiEndpoint = `https://dev.oculux.xyz/api/screenshot?url=${encodeURIComponent(url)}`;

      // let user know we're working (optional)
      await api.sendMessage(`🔍 Taking screenshot of:\n${url}\nPlease wait...`, threadID, messageID);

      // download image (binary)
      const response = await axios.get(apiEndpoint, {
        responseType: "arraybuffer",
        timeout: 30000
      });

      // some APIs may respond JSON on error; check content-type
      const contentType = response.headers["content-type"] || "";
      if (!contentType.startsWith("image")) {
        // try to parse JSON error
        let text = response.data.toString ? response.data.toString() : "[no message]";
        return api.sendMessage(`⚠️ Screenshot API did not return an image:\n${text}`, threadID, messageID);
      }

      // save temp file
      const tmpDir = path.join(__dirname, "tmp");
      await fs.ensureDir(tmpDir);
      const filePath = path.join(tmpDir, `screenshot_${Date.now()}.png`);
      await fs.writeFile(filePath, response.data);

      // send the file
      await api.sendMessage(
        {
          body: `🖼 Screenshot — ${url}`,
          attachment: fs.createReadStream(filePath)
        },
        threadID,
        async (err) => {
          // cleanup
          try { await fs.remove(filePath); } catch (e) {}
          if (err) console.error("Send error:", err);
        },
        messageID
      );
    } catch (error) {
      console.error(error);
      const errorMsg = error.response && error.response.data
        ? (typeof error.response.data === "string" ? error.response.data : JSON.stringify(error.response.data))
        : error.message;
      return api.sendMessage(`❌ Failed to capture screenshot:\n${errorMsg}`, event.threadID, event.messageID);
    }
  }
};
        
