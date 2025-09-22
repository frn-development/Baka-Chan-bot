const os = require("os");

module.exports.config = {
  name: "uptime",
  version: "3.1",
  hasPermssion: 0,
  credits: "Farhan",
  description: "Shows system uptime, RAM usage and status",
  commandCategory: "System",
  usages: "uptime",
  cooldowns: 5,
  aliases: ["rtm", "upt", "up"]
};

module.exports.run = async ({ api, event }) => {
  const { threadID } = event;

  const frames = [
    "[▰▱▱▱▱▱▱▱▱▱] 10%",
    "[▰▰▰▱▱▱▱▱▱▱] 30%",
    "[▰▰▰▰▰▰▱▱▱▱] 60%",
    "[▰▰▰▰▰▰▰▰▱▱] 90%",
    "[▰▰▰▰▰▰▰▰▰▰] 100%"
  ];

  let loading;
  try {
    loading = await api.sendMessage(frames[0], threadID);

    // Animate progress bar
    frames.forEach((frame, i) => {
      setTimeout(() => {
        api.editMessage(frame, loading.messageID);
      }, i * 300);
    });

    // Final system info after animation
    setTimeout(() => {
      const uptime = process.uptime();
      const days = Math.floor(uptime / (3600 * 24));
      const hours = Math.floor((uptime % (3600 * 24)) / 3600);
      const minutes = Math.floor((uptime % 3600) / 60);
      const seconds = Math.floor(uptime % 60);

      const uptimeStr =
        (days > 0 ? `${days}d ` : "") +
        (hours > 0 ? `${hours}h ` : "") +
        (minutes > 0 ? `${minutes}m ` : "") +
        `${seconds}s`;

      const ramUsed = (os.totalmem() - os.freemem()) / 1024 / 1024 / 1024;
      const ramTotal = os.totalmem() / 1024 / 1024 / 1024;

      const msg = 
`─── System Status ───
• Uptime   : ${uptimeStr}
• Ping     : ${Math.floor(process.uptime() * 10)} ms

• RAM Used : ${ramUsed.toFixed(2)} GB / ${ramTotal.toFixed(2)} GB
• RAM Total: ${ramTotal.toFixed(2)} GB
──────────────────────`;

      api.editMessage(msg, loading.messageID);
    }, frames.length * 300 + 200);

  } catch (err) {
    console.error("Uptime command error:", err);
    if (loading) api.sendMessage("Error: could not fetch system info.", threadID);
  }
};
      
